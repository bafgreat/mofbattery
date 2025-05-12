class EffectiveMass extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div>
          <button id="toggle" class="btn btn-sm btn-outline-success mb-2">
            ➕ Effective Mass?
          </button>
          <div
            id="content"
            class="bg-dark text-light p-4 rounded shadow-sm"
            style="font-family:'Helvetica Neue', sans-serif; font-size: 0.95rem; line-height: 1.6; display: none;"
          >
            <h3 class="text-white">Effective Mass</h3>
            <div id="preview">
              <p>
                In crystals, electrons and holes do not behave like free particles. Their response to external forces such as electric fields depends on the <strong>curvature of the energy bands</strong> near a specific <em>k-point</em> (typically the Γ-point).
              </p>
              <p>
                This behavior is described using the concept of <strong>effective mass</strong>, which allows us to treat charge carriers as free particles with a modified mass that accounts for the influence of the crystal lattice.
              </p>
              <button id="expand" class="btn btn-sm btn-success mt-2">View More</button>
            </div>
            <div id="full" style="display: none;">
              <h5>Mathematically:</h5>
              <p class="text-white">
              $$m^* = \\frac{\\hbar^2}{\\frac{d^2E}{dk^2}}$$
              </p>
              <ul>
                <li><strong>ℏ</strong> is the reduced Planck constant</li>
                <li><strong>E(k)</strong> is the band energy as a function of wave vector <strong>k</strong></li>
                <li><strong>d²E/dk²</strong> is the second derivative of energy with respect to k (band curvature)</li>
              </ul>
              <h3>Sign</h3>
              <ul>
                <li><strong>Positive curvature (upward):</strong> Electron-like behavior → <strong>positive effective mass</strong></li>
                <li><strong>Negative curvature (downward):</strong> Hole-like behavior → <strong>negative effective mass</strong></li>
              </ul>
              <p>The <strong>magnitude</strong> of the effective mass indicates how easily charge carriers move:</p>
              <ul>
                <li><strong>Small effective mass:</strong> High mobility</li>
                <li><strong>Large effective mass:</strong> Low mobility</li>
              </ul>
              <h3>Anisotropy</h3>
              <p>
                If the <strong>effective mass is not the same in all directions</strong>, the material is said to be <strong>anisotropic</strong>. This means that charge carriers will move more easily in the direction with a <strong>small effective mass</strong>
                and more slowly in directions with a <strong>large effective mass</strong>. For example, the material will conduct well along the
                x-axis if the effective mass is small in that direction but show poor conductivity along the y- or z-axis where the effective mass is much larger.
              </p>
              <h3>Transport<strong></h3>
              <ul>
                <li>A small electron effective mass suggests good electronic conductivity (e.g., for electrodes).</li>
                <li>A large hole effective mass may indicate poor hole transport, limiting performance.</li>
                <li>Very large or infinite effective mass (flat bands) can signal localization — carriers do not move easily.</li>
              </ul>
              <h3>Battery Application</h3>
              <p>
                In battery applications, the <strong>effective mass</strong> provides deeper insight into the electronic properties of a material.
                <br>
                <strong>If the effective mass is small</strong>, it suggests high mobility, making the material suitable as an <strong>electrode</strong> for fast charge transport.
                <br>
                <strong>If the effective mass is large</strong>, carriers move slowly, which may be ideal for <strong>solid-state electrolytes</strong> where ionic movement dominates and blocking electron flow is beneficial.
              </p>
              <button id="collapse" class="btn btn-sm btn-secondary mt-2">🔼 View Less</button>
            </div>
          </div>
        </div>
      `;

      const toggle = this.querySelector("#toggle");
      const content = this.querySelector("#content");
      const preview = this.querySelector("#preview");
      const full = this.querySelector("#full");

      toggle.addEventListener("click", () => {
        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "block" : "none";
        toggle.innerHTML = isHidden ? "➖ Hide Explanation" : "➕ Effective Mass?";
      });

      this.querySelector("#expand").addEventListener("click", () => {
        preview.style.display = "none";
        full.style.display = "block";
      });

      this.querySelector("#collapse").addEventListener("click", () => {
        preview.style.display = "block";
        full.style.display = "none";
      });
    }
  }

  customElements.define('effective-mass', EffectiveMass);

  class BandStructure extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div>
          <button id="toggle-band" class="btn btn-sm btn-outline-success mb-2">
            ➕ Band Structure?
          </button>
          <div
            id="band-content"
            class="bg-dark text-light p-4 rounded shadow-sm"
            style="font-family:'Helvetica Neue', sans-serif; font-size: 0.95rem; line-height: 1.6; display: none;"
          >
            <h3 class="text-white">Band Structure</h3>
            <div id="band-preview">
              <p>
                The <strong>band structure</strong> of a material describes how electron energy levels vary with momentum across the crystal. It determines whether electrons can move freely or whether they are restricted.
              </p>
              <p>
                Band structures are central in identifying whether a material is a <em>conductor</em>, <em>semiconductor</em>, or <em>insulator</em>.
              </p>
              <button id="expand-band" class="btn btn-sm btn-success mt-2">View More</button>
            </div>
            <div id="band-full" style="display: none;">
              <h5>Band Structure Essentials</h5>
              <ul>
                <li><strong>Valence band:</strong> highest occupied electron states</li>
                <li><strong>Conduction band:</strong> lowest unoccupied states</li>
                <li><strong>Band gap (E<sub>g</sub>):</strong> energy difference between the valence and conduction bands</li>
                <li><strong>Fermi level:</strong> energy of the highest filled state at absolute zero</li>
              </ul>
              <h5>Classification Based on Band Gap</h5>
              <ul>
                <li><strong>Conductors:</strong> Overlapping bands → free electrons, high conductivity</li>
                <li><strong>Semiconductors:</strong> Narrow gap → thermally activated conduction</li>
                <li><strong>Insulators:</strong> Wide gap → negligible electronic conduction</li>
              </ul>
              <h5>Why This Matters in Batteries</h5>
              <p>
                Band structure helps evaluate how easily charge carriers move through a material:
              </p>
              <ul>
                <li><strong>Flat bands</strong> → localized electrons, poor transport</li>
                <li><strong>Dispersive bands</strong> → delocalized, mobile carriers</li>
              </ul>
              <h5>Battery Applications</h5>
              <p>
                In <strong>electrodes</strong>, we need materials with small or no band gaps and dispersive conduction bands to ensure fast electron transport.
              </p>
              <p>
                In contrast, <strong>electrolytes</strong> or <strong>solid-state separators</strong> should ideally exhibit large band gaps to prevent electronic leakage while allowing ionic transport, preserving electrochemical integrity.
              </p>
              <p>
                Moreover, band alignment at <strong>interfaces</strong> (e.g., between cathode and electrolyte) governs charge transfer efficiency and stability during battery cycling.
              </p>
              <button id="collapse-band" class="btn btn-sm btn-secondary mt-2">🔼 View Less</button>
            </div>
          </div>
        </div>
      `;

      const toggle = this.querySelector("#toggle-band");
      const content = this.querySelector("#band-content");
      const preview = this.querySelector("#band-preview");
      const full = this.querySelector("#band-full");

      toggle.addEventListener("click", () => {
        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "block" : "none";
        toggle.innerHTML = isHidden ? "➖ Hide Explanation" : "➕ Band Structure?";
      });

      this.querySelector("#expand-band").addEventListener("click", () => {
        preview.style.display = "none";
        full.style.display = "block";
      });

      this.querySelector("#collapse-band").addEventListener("click", () => {
        preview.style.display = "block";
        full.style.display = "none";
      });
    }
  }

  customElements.define('band-structure', BandStructure);

  class ProjectedDOS extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div>
          <button id="toggle-pdos" class="btn btn-sm btn-outline-success mb-2">
            ➕ Projected Density of States?
          </button>
          <div
            id="pdos-content"
            class="bg-dark text-light p-4 rounded shadow-sm"
            style="font-family:'Helvetica Neue', sans-serif; font-size: 0.95rem; line-height: 1.6; display: none;"
          >
            <h3 class="text-white">Projected Density of States (PDOS)</h3>
            <div id="pdos-preview">
              <p>
                PDOS reveals which atoms and orbitals contribute to the electronic states near the <strong>Fermi level</strong>, where redox activity and charge transfer occur. It decomposes the total electronic density of states into atomic and orbital components.
              </p>
              <p>
                This atomic-level insight is crucial for battery applications — it helps predict if a material can <em>conduct electrons</em>, <em>host redox reactions</em>, or <em>block electronic leakage</em>.
              </p>
              <button id="expand-pdos" class="btn btn-sm btn-success mt-2">View More</button>
            </div>
            <div id="pdos-full" style="display: none;">
              <h5>What PDOS Shows</h5>
              <ul>
                <li><strong>Total DOS:</strong> Distribution of electronic states at each energy level</li>
                <li><strong>PDOS:</strong> How much each atom or orbital contributes to that distribution</li>
                <li><strong>Fermi Level (E<sub>F</sub>):</strong> The highest occupied level at 0 K, critical for electron transfer</li>
              </ul>

              <h5>Key Interpretations</h5>
              <ul>
                <li><strong>High PDOS near E<sub>F</sub>:</strong> Atom or orbital can participate in electronic conduction or redox</li>
                <li><strong>Zero PDOS at E<sub>F</sub>:</strong> Insulating behavior from that site; useful for blocking electron leakage</li>
                <li><strong>d-orbital contributions near E<sub>F</sub>:</strong> Redox-active transition metals (e.g., Co, Ni, Fe)</li>
                <li><strong>p-orbital contributions:</strong> Often linked to ligand effects, guest molecule interaction, or delocalization</li>
              </ul>

              <h5>Pristine vs Guest-Containing Systems</h5>
              <p>
                In <strong>pristine MOFs</strong>, PDOS near E<sub>F</sub> may be minimal — indicating insulating or semiconducting behavior. But when a <strong>guest molecule</strong> (e.g., Li, Na, Zn) is introduced, it can:
              </p>
              <ul>
                <li><strong>Inject states near E<sub>F</sub>:</strong> improving conductivity and reactivity</li>
                <li><strong>Distort or hybridize orbitals:</strong> altering charge distribution and potentially forming reactive centers</li>
                <li><strong>Reduce band gap:</strong> turning an insulator into a mixed ionic-electronic conductor (MIEC)</li>
              </ul>
              <p>
                These changes explain why guest-loaded MOFs often outperform their pristine counterparts in electrochemical cycling:contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}.
              </p>

              <h5>Battery Component Insights</h5>
              <ul>
                <li>
                  <strong>Cathodes:</strong> Look for metal-centered d-states at E<sub>F</sub>. High PDOS suggests active redox behavior and fast electron transfer.
                </li>
                <li>
                  <strong>Anodes:</strong> PDOS should allow reversible lithiation/sodiation. Guest atoms often shift Fermi level and activate formerly inactive sites.
                </li>
                <li>
                  <strong>Solid Electrolytes:</strong> Desirable PDOS profile is a <strong>wide band gap</strong> (no states at E<sub>F</sub>) → avoids electronic conduction, ensuring only ionic transport.
                </li>
              </ul>

              <h5>Why PDOS Matters</h5>
              <p>
                By computing and analyzing PDOS, we can:
              </p>
              <ul>
                <li>Identify <strong>electron-conducting paths</strong> for cathode performance</li>
                <li>Detect <strong>electron-blocking layers</strong> for solid electrolyte stability</li>
                <li>Understand <strong>guest-induced changes</strong> in conductivity and redox kinetics</li>
              </ul>

              <button id="collapse-pdos" class="btn btn-sm btn-secondary mt-2">🔼 View Less</button>
            </div>
          </div>
        </div>
      `;

      const toggle = this.querySelector("#toggle-pdos");
      const content = this.querySelector("#pdos-content");
      const preview = this.querySelector("#pdos-preview");
      const full = this.querySelector("#pdos-full");

      toggle.addEventListener("click", () => {
        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "block" : "none";
        toggle.innerHTML = isHidden ? "➖ Hide Explanation" : "➕ Projected Density of States?";
      });

      this.querySelector("#expand-pdos").addEventListener("click", () => {
        preview.style.display = "none";
        full.style.display = "block";
      });

      this.querySelector("#collapse-pdos").addEventListener("click", () => {
        preview.style.display = "block";
        full.style.display = "none";
      });
    }
  }

  customElements.define('projected-dos', ProjectedDOS);

  class NEBDiffusion extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div>
          <button id="toggle-neb" class="btn btn-sm btn-outline-success mb-2">
            ➕ NEB & Diffusivity?
          </button>
          <div
            id="neb-content"
            class="bg-dark text-light p-4 rounded shadow-sm"
            style="font-family:'Helvetica Neue', sans-serif; font-size: 0.95rem; line-height: 1.6; display: none;"
          >
            <h3 class="text-white">Nudged Elastic Band (NEB) & Diffusivity</h3>
            <div id="neb-preview">
              <p>
                NEB calculations reveal how ions move through a material by mapping the minimum energy path between two stable positions.
                This helps estimate how quickly ions such as Li⁺ or Na⁺ diffuse through MOFs, electrodes, or solid electrolytes.
              </p>
              <p>
                It is an essential method for evaluating ionic conductivity and transport properties in battery materials.
              </p>
              <button id="expand-neb" class="btn btn-sm btn-success mt-2">View More</button>
            </div>

            <div id="neb-full" style="display: none;">
              <h5>NEB & Transition State Theory</h5>
              <p>
                The diffusivity $D$ is estimated using the classical transition state expression:
                $$D = \\frac{\\lambda^2 \\nu}{n} \\exp\\left(-\\frac{E_a}{k_B T}\\right)$$
              </p>
              <ul>
                <li><strong>\\(\\lambda\\):</strong> Distance between hopping sites</li>
                <li><strong>\\(\\nu\\):</strong> Attempt frequency</li>
                <li><strong>\\(n\\):</strong> Dimensionality of diffusion (1D, 2D, or 3D)</li>
                <li><strong>\\(E_a\\):</strong> Activation energy barrier</li>
                <li><strong>\\(k_B\\):</strong> Boltzmann constant</li>
                <li><strong>\\(T\\):</strong> Absolute temperature</li>
              </ul>

              <h5>Battery Relevance</h5>
              <ul>
                <li><strong>Anodes:</strong> Promotes rapid charge/discharge and minimizes dendrites.</li>
                <li><strong>Cathodes:</strong> Enables consistent redox activity over cycling.</li>
                <li><strong>Solid Electrolytes:</strong> High ionic conductivity with minimal electron leakage.</li>
              </ul>

              <h5>Methodology Summary</h5>
              <p>
                The methodology involves identifying active sites via charge analysis, inserting guest ions,
                and constructing intermediate structures between configurations. These structures are used in NEB to extract
                the migration barrier \\(E_a\\).
              </p>
              <p>
                Diffusivity is then estimated using the above equation. GFN-xTB was used to ensure scalability across thousands of MOFs,
                and directions with the lowest effective mass were chosen to reflect realistic transport pathways.
              </p>

              <button id="collapse-neb" class="btn btn-sm btn-secondary mt-2">🔼 View Less</button>
            </div>
          </div>
        </div>
      `;

      const toggle = this.querySelector("#toggle-neb");
      const content = this.querySelector("#neb-content");
      const preview = this.querySelector("#neb-preview");
      const full = this.querySelector("#neb-full");

      toggle.addEventListener("click", () => {
        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "block" : "none";
        toggle.innerHTML = isHidden
          ? "➖ Hide Explanation"
          : "➕ NEB & Diffusivity?";
        if (isHidden && window.MathJax) MathJax.typeset(); // Trigger re-render
      });

      this.querySelector("#expand-neb").addEventListener("click", () => {
        preview.style.display = "none";
        full.style.display = "block";
        if (window.MathJax) MathJax.typeset();
      });

      this.querySelector("#collapse-neb").addEventListener("click", () => {
        preview.style.display = "block";
        full.style.display = "none";
      });
    }
  }
  customElements.define('neb-diffusion', NEBDiffusion);


  class TheoreticalCapacity extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div>
          <button id="toggle-capacity" class="btn btn-sm btn-outline-success mb-2">
            ➕ Theoretical Capacity?
          </button>
          <div id="capacity-content" class="bg-dark text-light p-4 rounded shadow-sm" style="display: none; font-family: 'Helvetica Neue', sans-serif; font-size: 0.95rem;">
            <h3 class="text-white">Theoretical Capacity</h3>
            <p>
              Theoretical capacity quantifies the maximum amount of electrical charge a material can store per unit mass assuming complete and reversible redox activity.
              It is commonly expressed in milliampere-hours per gram (mAh·g⁻¹).
            </p>
            <p class="text-white">$$C_{\\text{th}} = \\frac{n \\cdot F}{3.6 \\cdot M}$$</p>
            <ul>
              <li><strong>\\(n\\):</strong> Number of inserted guest species per formula unit</li>
              <li><strong>\\(F\\):</strong> Faraday constant (96,485 C·mol⁻¹)</li>
              <li><strong>\\(M\\):</strong> Molar mass of the redox-active host system (g·mol⁻¹)</li>
              <li><strong>3.6:</strong> Unit conversion factor from coulombs to mAh</li>
            </ul>
            <h5>Application in This Study</h5>
            <p>
              In this work, the number of guest ions inserted into each MOF without structural overlap was used to calculate the theoretical capacity.
              This parameter enabled a comparative evaluation of charge-storage capability across thousands of frameworks and guest species.
              Capacity values serve as a critical metric in identifying high-performance materials for both <strong>anode</strong> and <strong>cathode</strong> roles in next-generation battery chemistries.
            </p>
            <button id="collapse-capacity" class="btn btn-sm btn-secondary mt-2">🔼 View Less</button>
          </div>
        </div>
      `;

      const toggle = this.querySelector("#toggle-capacity");
      const content = this.querySelector("#capacity-content");
      const collapse = this.querySelector("#collapse-capacity");

      toggle.addEventListener("click", () => {
        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "block" : "none";
        toggle.innerHTML = isHidden ? "➖ Hide Explanation" : "➕ Theoretical Capacity?";
        if (isHidden && window.MathJax) MathJax.typeset();
      });

      collapse.addEventListener("click", () => {
        content.style.display = "none";
        toggle.innerHTML = "➕ Theoretical Capacity?";
      });
    }
  }
  customElements.define('theoretical-capacity', TheoreticalCapacity);



  class OpenCircuitVoltage extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div>
          <button id="toggle-voltage" class="btn btn-sm btn-outline-success mb-2">
            ➕ Open-Circuit Voltage?
          </button>
          <div id="voltage-content" class="bg-dark text-light p-4 rounded shadow-sm" style="display: none; font-family: 'Helvetica Neue', sans-serif; font-size: 0.95rem;">
            <h3 class="text-white">Open-Circuit Voltage (OCV)</h3>
            <p>
              The open-circuit voltage corresponds to the maximum electrochemical potential difference between the electrodes of a battery when no external current is flowing.
              It is fundamentally governed by the thermodynamics of redox reactions occurring at the electrode interfaces.
            </p>
            <p class="text-white">$$V = -\\frac{E_{\\text{guest}_x\\text{-MOF}} - E_{\\text{guest}_{x-1}\\text{-MOF}} - E_{\\text{guest}}}{F}$$</p>
            <ul>
              <li><strong>\\(E_{\\text{guest}_x\\text{-MOF}}\\):</strong> Total energy of the MOF with \\(x\\) inserted guest species</li>
              <li><strong>\\(E_{\\text{guest}_{x-1}\\text{-MOF}}\\):</strong> Energy of the MOF with \\(x-1\\) inserted guests</li>
              <li><strong>\\(E_{\\text{guest}}\\):</strong> Energy of the isolated guest species</li>
              <li><strong>\\(F\\):</strong> Faraday constant (96,485 C·mol⁻¹)</li>
            </ul>
            <h5>Application in This Study</h5>
            <p>
              In this study, the OCV was computed for each MOF–guest pair based on sequential guest insertion energies.
              This enabled rapid classification of MOFs as candidate <strong>anode materials</strong> (lower voltage), <strong>cathode materials</strong> (higher voltage), or <strong>inactive hosts</strong>.
              The OCV, when evaluated across various metal-ion systems (Li, Na, Mg, Zn, Al), provides crucial insight into redox activity and potential compatibility.
            </p>
            <button id="collapse-voltage" class="btn btn-sm btn-secondary mt-2">🔼 View Less</button>
          </div>
        </div>
      `;

      const toggle = this.querySelector("#toggle-voltage");
      const content = this.querySelector("#voltage-content");
      const collapse = this.querySelector("#collapse-voltage");

      toggle.addEventListener("click", () => {
        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "block" : "none";
        toggle.innerHTML = isHidden ? "➖ Hide Explanation" : "➕ Open-Circuit Voltage?";
        if (isHidden && window.MathJax) MathJax.typeset();
      });

      collapse.addEventListener("click", () => {
        content.style.display = "none";
        toggle.innerHTML = "➕ Open-Circuit Voltage?";
      });
    }
  }
  customElements.define('open-circuit-voltage', OpenCircuitVoltage);


  class EnergyDensity extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div>
          <button id="toggle-energy" class="btn btn-sm btn-outline-success mb-2">
            ➕ Energy Density?
          </button>
          <div id="energy-content" class="bg-dark text-light p-4 rounded shadow-sm" style="display: none; font-family: 'Helvetica Neue', sans-serif; font-size: 0.95rem;">
            <h3 class="text-white">Energy Density</h3>
            <p>
              Energy density correspond to the total energy a battery material can store and deliver per unit mass and is a combination of both the open circuit voltage and the theortical capacity.
            </p>
            <p class="text-white">$$E_{\\text{density}} = V_{\\text{avg}} \\cdot C_{\\text{th}}$$</p>
            <ul>
              <li><strong>\\(V_{\\text{avg}}\\):</strong> Average voltage during operation</li>
              <li><strong>\\(C_{\\text{th}}\\):</strong> Theoretical capacity (mAh/g)</li>
            </ul>
            <h5>Application in This Stud</h5>
            <p>
              This provided a clear performance benchmark for comparing MOF candidates across different metal-ion chemistries,
              and help prioritize materials with both high capacity and usable voltage.
            </p>
            <button id="collapse-energy" class="btn btn-sm btn-secondary mt-2">🔼 View Less</button>
          </div>
        </div>
      `;

      const toggle = this.querySelector("#toggle-energy");
      const content = this.querySelector("#energy-content");
      const collapse = this.querySelector("#collapse-energy");

      toggle.addEventListener("click", () => {
        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "block" : "none";
        toggle.innerHTML = isHidden ? "➖ Hide Explanation" : "➕ Energy Density?";
        if (isHidden && window.MathJax) MathJax.typeset();
      });

      collapse.addEventListener("click", () => {
        content.style.display = "none";
        toggle.innerHTML = "➕ Energy Density?";
      });
    }
  }
  customElements.define('energy-density', EnergyDensity);
