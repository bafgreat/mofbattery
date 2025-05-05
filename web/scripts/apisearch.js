let allArticles = [];
let visibleYearIndex = 0;
let sortedYears = [];
const grouped = {};
const visibleArticlesByYear = {};
const pageSizeYears = 5;
const pageSizeArticlesPerYear = 2;

const atomAliases = {
  "Li": ["Li", "Li+", "Lithium", "lithium", "Li metal", "Lithium metal", "lithium metal", "Li⁰", "Li(0)", "metallic lithium", "Metallic Lithium"],
  "LiS": ["LiS", "Li-S", "Li/S", "Li–S", "Lithium-sulfur", "lithium-sulfur", "Lithium sulfur", "lithium sulfur", "Lithium–sulfur", "Lithium sulphur", "lithium sulphur", "Li–Sulphur", "Li/S battery", "Li-S battery", "Lithium sulfur battery", "Lithium-sulfur battery", "Lithium sulphur battery"],
  "LiO": ["LiO", "Li-O", "Li/O", "Li–O", "Lithium oxide battery", "lithium oxide battery", "Lithium-oxide battery", "lithium-oxide battery", "Li2O battery", "Li₂O battery", "Lithium oxide cell", "Li2O cell", "Lithium-oxide electrochemical cell"],
  "Mg": ["Mg", "Mg2+", "Magnesium", "magnesium", "Mg metal", "Magnesium metal", "magnesium metal", "Mg⁰", "Mg(0)", "metallic magnesium", "Metallic Magnesium"],
  "Na": ["Na", "Na+", "Sodium", "sodium", "Na metal", "Sodium metal", "sodium metal", "Na⁰", "Na(0)", "metallic sodium", "Metallic Sodium"],
  "K": ["K", "K+", "Potassium", "potassium", "K metal", "Potassium metal", "potassium metal", "K⁰", "K(0)", "metallic potassium", "Metallic Potassium"],
  "Ca": ["Ca", "Ca2+", "Calcium", "calcium", "Ca metal", "Calcium metal", "calcium metal", "Ca⁰", "Ca(0)", "metallic calcium", "Metallic Calcium"],
  "Zn": ["Zn", "Zn2+", "Zinc", "zinc", "Zn metal", "Zinc metal", "zinc metal", "Zn⁰", "Zn(0)", "metallic zinc", "Metallic Zinc"],
  "Al": ["Al", "Al3+", "Aluminum", "aluminum", "Aluminium", "aluminium", "Al metal", "Aluminum metal", "aluminum metal", "Aluminium metal", "aluminium metal", "Al⁰", "Al(0)", "metallic aluminum", "metallic aluminium", "Metallic Aluminum", "Metallic Aluminium"]
};

// Get atom symbol from <html data-atom="Li">, etc.
const atomSymbol = document.documentElement.dataset.atom;
if (atomSymbol) {
  fetchArticles(atomSymbol);
}
async function fetchArticles(atomSymbol) {
    const baseURL = `https://api.crossref.org/works`;
    const aliases = atomAliases[atomSymbol] || [atomSymbol];

    const titleQuery = aliases.map(a => `metal-organic frameworks battery ${a}`).join(" OR ");
    const metaQuery = aliases.map(a => `metal-organic frameworks battery electrochemical ${a}`).join(" OR ");
    const url = `${baseURL}?rows=100&sort=score&order=desc&query.title=${encodeURIComponent(titleQuery)}&query=${encodeURIComponent(metaQuery)}`;

    // Show spinner
    document.getElementById("loading-spinner").style.display = "block";

    try {
      const res = await fetch(url);
      const data = await res.json();
      const rawArticles = data.message.items;

      allArticles = rawArticles.filter(item => {
        const title = (item.title?.[0] || "").toLowerCase();
        const abstract = (item.abstract || "").toLowerCase();
        const text = `${title} ${abstract}`;
        return (
          (text.includes("metal-organic framework") || text.includes("mof")) &&
          !text.includes("covalent organic framework") &&
          !text.includes("cof")
        );
      });

      renderArticles();
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      // Hide spinner
      const spinner = document.getElementById("loading-spinner");
      if (spinner) spinner.style.display = "none";
    }
  }

  function renderArticles() {
    const container = document.getElementById("article-container");

    // Group and sort years once
    if (sortedYears.length === 0) {
      allArticles.forEach(item => {
        const year = item.created?.["date-parts"]?.[0]?.[0] || "Unknown";
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(item);
      });

      sortedYears = Object.keys(grouped).sort((a, b) => {
        const yearA = isNaN(parseInt(a)) ? -Infinity : parseInt(a);
        const yearB = isNaN(parseInt(b)) ? -Infinity : parseInt(b);
        return yearB - yearA;
      });
    }

    // Get next 10 years to display
    const nextYears = sortedYears.slice(visibleYearIndex, visibleYearIndex + pageSizeYears);

    nextYears.forEach(year => {
      const articles = grouped[year];
      visibleArticlesByYear[year] = pageSizeArticlesPerYear;

      const yearId = `year-${year}`;
      if (document.getElementById(yearId)) return;

      const yearSection = document.createElement("div");
      yearSection.id = yearId;
      yearSection.className = "mb-5";
      yearSection.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3 class="text-white">${year === "Unknown" ? "Year Unknown" : year}</h3>
          <button class="btn btn-sm text-white" data-bs-toggle="collapse" data-bs-target="#collapse-${year}">
            Toggle Year
          </button>
        </div>
        <div class="collapse show" id="collapse-${year}">
          <div class="table-responsive">
            <table class="table table-striped table-hover align-middle">
              <thead class="table-dark">
                <tr>
                  <th class="w-50">Title</th>
                  <th class="w-25">DOI</th>
                  <th class="w-25">Abstract</th>
                </tr>
              </thead>
              <tbody id="body-${year}"></tbody>
            </table>
            <div class="text-end mt-2">
              <button class="btn btn-sm btn-outline-light" id="more-btn-${year}" onclick="loadMoreArticlesForYear('${year}')">
                View More Articles
              </button>
            </div>
          </div>
        </div>
      `;
      container.appendChild(yearSection);

      renderYearArticles(year);
    });

    visibleYearIndex += pageSizeYears;

    if (visibleYearIndex >= sortedYears.length) {
      document.getElementById("loadMoreBtn").classList.add("d-none");
    } else {
      document.getElementById("loadMoreBtn").classList.remove("d-none");
    }
  }

  function renderYearArticles(year) {
    const articles = grouped[year];
    const visibleCount = visibleArticlesByYear[year];
    const tbody = document.getElementById(`body-${year}`);
    tbody.innerHTML = "";

    articles.slice(0, visibleCount).forEach((item, idx) => {
      const title = item.title?.[0] || "No title";
      const doi = item.DOI
        ? `<a href="https://doi.org/${item.DOI}" target="_blank" class="text-decoration-none">${item.DOI}</a>`
        : "No DOI";
      const abstract = item.abstract || "No abstract available.";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong><i class="bi me-2 text-muted"></i>${title}</strong></td>
        <td>${doi}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#abs-${year}-${idx}">
            <i class="bi bi-eye me-1"></i>Abstract
          </button>
          <div class="collapse mt-2" id="abs-${year}-${idx}">
            <div class="card card-body bg-light border-0 small">${abstract}</div>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });

    const moreBtn = document.getElementById(`more-btn-${year}`);
    if (visibleCount >= articles.length) {
      moreBtn.classList.add("d-none");
    } else {
      moreBtn.classList.remove("d-none");
    }
  }

  function loadMoreArticlesForYear(year) {
    visibleArticlesByYear[year] += pageSizeArticlesPerYear;
    renderYearArticles(year);
  }

  function loadMore() {
    renderArticles();
  }
