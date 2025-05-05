// components.js

function loadComponent(id, file, callback) {
  fetch(file)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to load ${file}`);
      return response.text();
    })
    .then(data => {
      document.getElementById(id).innerHTML = data;
      if (callback) callback();
    })
    .catch(error => console.error(error));
}

function injectNavLinks(jsonPath = "/web/data/json/nav.json") {
  fetch(jsonPath)
    .then(res => res.json())
    .then(navLinks => {
      const inlineNav = document.getElementById("inlineNav");
      const offcanvasNav = document.getElementById("offcanvasNav");
      const currentPath = window.location.pathname.split("/").pop() || "index.html";

      navLinks.forEach(link => {
        const isActive = currentPath === link.href || (link.href === "index.html" && currentPath === "");

        const li = document.createElement("li");
        li.className = "nav-item";
        li.innerHTML = `<a class="nav-link text-white${isActive ? ' active' : ''}" href="${link.href}">${link.label}</a>`;
        inlineNav.appendChild(li);

        offcanvasNav.appendChild(li.cloneNode(true));
      });
    })
    .catch(err => console.error("Failed to load nav.json:", err));
}


function injectFooter(jsonPath = "/web/data/json/footer.json") {
  fetch(jsonPath)
  .then(res => res.json())
  .then(data => {
    const footerLinks = document.getElementById("footerLinks");
    const footerEmail = document.getElementById("footerEmail");
    const footerResources = document.getElementById("footerResources");
    const footerDataset = document.getElementById("footerDataset");
    const footerCopyright = document.getElementById("footerCopyright");

    // Social/media links
    data.links.forEach(link => {
      const a = document.createElement("a");
      a.href = link.href.startsWith("http") ? link.href : `https://${link.href}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "text-white text-decoration-none";
      a.innerHTML = `<i class="bi bi-${link.icon}" style="font-size: 1.2rem;"></i>`;
      footerLinks.appendChild(a);
    });

    // Manuscript
    if (data.publication) {
      footerResources.innerHTML = `<a href="${data.publication.href}" target="_blank" class="text-white text-decoration-none">${data.publication.label}</a>`;
    }

    // FAIRMOF dataset
    if (data.dataset) {
      footerDataset.innerHTML = `<a href="${data.dataset.href}" target="_blank" class="text-white text-decoration-none">${data.dataset.label}</a>`;
    }

    // Email
    // footerEmail.innerHTML = `<a href="mailto:${data.email}" class="text-white text-decoration-none">Contact</a>`;

    // // Copyright
    // if (data?.copyright) {
    //   footerCopyright.textContent = data.copyright;
    // }
  })
  .catch(err => console.error("Failed to load footer.json:", err));
}



// Load navbar and footer, then inject nav links after navbar is in DOM
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("navbar-placeholder", "/web/components/navbar.html", injectNavLinks);
  loadComponent("footer-placeholder", "/web/components/footer.html", injectFooter);
});
