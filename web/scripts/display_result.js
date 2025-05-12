// Enhanced scripts/display_result.js with professional design
// Fully independent module for elegant cluster display with Bootstrap
// Reads refcode_finder.json and refcode_description.json
// Displays pristine + guest PDOS and band structures + CIF download + 3D viewer

(async function() {
  const atom = document.documentElement.getAttribute("data-atom");
  if (!atom) return console.warn("data-atom not set on <html>");

  const finderPath = "data/json/refcode_finder.json";
  const descriptionPath = "data/json/refcode_description.json";
  const container = document.createElement("div");
  container.className = "container py-5";

  try {
      const [finderRes, descRes] = await Promise.all([
          fetch(finderPath),
          fetch(descriptionPath)
      ]);
      const finderData = await finderRes.json();
      const descData = await descRes.json();

      const clusters = finderData[atom];
      if (!clusters) return console.warn(`No refcodes for atom ${atom}`);

      const row = document.createElement("div");
      row.className = "row g-4";

      Object.entries(clusters).forEach(([cluster, {refcode}]) => {
          const col = document.createElement("div");
          col.className = "col-12 col-sm-6 col-lg-3";
          col.innerHTML = `
              <div class="card shadow-sm border-0 h-100 bg-light">
                  <div class="card-header bg-primary text-white text-center fw-bold rounded-top">
                      Cluster ${cluster}
                  </div>
                  <div class="card-body text-center">
                      <h5 class="card-title text-dark">${refcode}</h5>
                      <button class="btn btn-outline-primary w-100 mt-3" data-cluster="${cluster}" data-refcode="${refcode}">View More</button>
                  </div>
              </div>`;
          row.appendChild(col);
      });

      container.appendChild(row);
      (document.getElementById('display-result-container') || document.body).appendChild(container);

      container.addEventListener("click", e => {
          const btn = e.target.closest("button[data-refcode]");
          if (!btn) return;
          displayExpandedView(btn.dataset.refcode, descData[btn.dataset.refcode]);
      });

  } catch (err) {
      console.error("Failed to load json data", err);
  }

  function displayExpandedView(refcode, desc = {}) {
      const modal = document.createElement("div");
      modal.className = "modal fade";
      modal.innerHTML = `
          <div class="modal-dialog modal-xl">
          <div class="modal-content bg-dark text-white border-0 rounded-4 shadow">
                  <div class="modal-header bg-primary text-white rounded-top">
                      <h5 class="modal-title fw-bold">Details for ${refcode}</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                      <h2 class="text-center text-white fw-bold mb-4">Band Structure</h2>
                      <div class="d-flex justify-content-center"> <band-structure></band-structure> </div>
                      <div class="row g-3">
                          <div class="col-md-6">
                              <h5 class="text-center text-white text-secondary">Pristine MOF</h5>
                              <img src="data/bands/mof/${refcode}.png" class="img-fluid rounded mx-auto d-block border" onerror="this.src='https://via.placeholder.com/300x300?text=No+Band+Mof'">
                          </div>
                          <div class="col-md-6">
                              <h5 class="text-center text-white text-secondary">MOF@${atom}</h5>
                              <img src="data/bands/host/${refcode}.png" class="img-fluid rounded mx-auto d-block border" onerror="this.src='https://via.placeholder.com/300x300?text=No+Band+Host'">
                          </div>
                      </div>

                      <h2 class="text-center fw-bold my-4">Projected Density of States</h2>
                          <div class="d-flex justify-content-center"> <projected-dos></projected-dos> </div>

                      <div class="row g-3">
                          <div class="col-md-6">
                              <h5 class="text-center text-white  text-secondary">Pristine MOF</h5>
                              <img src="data/pdos/mof/${refcode}-by-atoms.png" class="img-fluid rounded mx-auto d-block border" style="max-width:85%" onerror="this.src='https://via.placeholder.com/300x300?text=No+PDOS+Mof'">
                          </div>
                          <div class="col-md-6">
                              <h5 class="text-center text-white text-secondary">MOF@${atom}</h5>
                              <img src="data/pdos/host/${refcode}-by-atoms.png" class="img-fluid rounded mx-auto d-block border" style="max-width:85%" onerror="this.src='https://via.placeholder.com/300x300?text=No+PDOS+Host'">
                          </div>
                      </div>

                      <hr class="my-4">
                      <h4 class="fw-bold text-center text-white">Material Properties</h4>
                      <table class="table table-bordered table-hover">
                          <tbody>
                              ${desc.Bandgap ? `<tr><th>Bandgap</th><td>${desc.Bandgap}</td></tr>` : ''}
                              ${desc.Diffusivity ? `<tr><th>Diffusivity</th><td>${desc.Diffusivity}</td></tr>` : ''}
                              ${desc.EffectiveMass ? `<tr><th>Effective Mass</th><td>${desc.EffectiveMass}</td></tr>` : ''}
                              ${desc.Capacity ? `<tr><th>Theoretical Capacity</th><td>${desc.Capacity}</td></tr>` : ''}
                              ${desc.Voltage ? `<tr><th>Open Circuit Voltage</th><td>${desc.Voltage}</td></tr>` : ''}
                              ${desc.Conclusion ? `<tr><th>Conclusion</th><td>${desc.Conclusion}</td></tr>` : ''}
                          </tbody>
                      </table>

                      <hr class="my-4">
                      <h4 class="fw-bold text-center text-white">3D MOF Structure</h4>
                      <div id="viewer-${refcode}" style="width:100%; height:400px; border:1px solid #ccc; border-radius:0.5rem; background:black; position:relative;">
                      </div>
                      <div class="text-center mt-3">
                          <a href="data/cifs/${refcode}.cif" download class="btn btn-outline-primary">
                              <i class="bi bi-download"></i> Download CIF
                          </a>
                      </div>
                  </div>
              </div>
          </div>`;

      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();

      modal.addEventListener('shown.bs.modal', () => {
          const viewerElement = modal.querySelector(`#viewer-${refcode}`);
          if (viewerElement && window.visualizeStructure) {
              fetch(`data/json/json_cif/${refcode}.json`)
                  .then(res => res.json())
                  .then(data => {
                      window.visualizeStructure(data, 0.3, viewerElement);
                      viewerElement.viewer?.resize();
                  })
                  .catch(err => {
                      console.error(`Failed to load structure for ${refcode}:`, err);
                      viewerElement.innerHTML = `<p class="text-danger text-center">Could not load structure.</p>`;
                  });
          }
      });
  }
})();