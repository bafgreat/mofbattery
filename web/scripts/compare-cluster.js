class ClusterComparison extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
       @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');
      :host {
        display: block;
        padding: 1.5 rem;
        font-family: 'Playfair Display', serif;
        letter-spacing: 0.5px;
        line-height: 1.6;
        background-color:#083c5d;
      }

      h2.section-title {
        text-align: center;
        font-weight: 700;
        margin: 2rem 0 1rem;
        color: white;
        font-size: 2rem;
        }

      .chart-card {
          background:black;
          border-radius: 1rem;
          padding: 1rem;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          height: 100%;
        }

      .chart-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        text-align: center;
        color: white;
      }

        canvas {
          width: 100% !important;
          height: 500px !important;
          color: transparent;
        }

        .cluster-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
          color: white;
        }

        .cluster-box {
        background: #eaf6ff;
        border: 2px solid #4A90E2;
        border-radius: 0.75rem;
        padding: 1rem;
        text-align: center;
        font-weight: 600;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s;
        color: #333;
        }

    .cluster-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
      }

    @media (min-width: 768px) {
        .cluster-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

    .cluster-box:hover {
        background:aqua;
        transform: translateY(-2px);
      }

        .table-section {
          margin-top: 2rem;
        }

        .clickable {
          cursor: pointer;
        }

        .clickable:hover {
        background-color: #e1f0ff;
        }

    table {
        background-color:transparent; ;
        border-radius: 0.5rem;
        overflow: hidden;
      }

      th {
        background-color:transparent;
        text-align: center;
        font-weight: 600;
        color: #333;
        font-size: 1rem;
      }

      td {
        text-align: center;
        font-size: 0.95rem;
        color: #444;
      }

      .viewer-section {
        margin-top: 1.5rem;
        padding: 1rem;
        background:transparent;
        border: 1px solid #ccc;
        border-radius: 0.5rem;
        font-size: 1,5rem;
      }

      .viewer-section h4 {
        text-align: center;
        color: #4A90E2;
      }

        .viewer-section p {
          text-align: center;
          color: #666;
        }

        .viewer-canvas {
          width: 200%;
          height: 300px;
          border: 1px solid #ccc;
          border-radius: 0.5rem;
          background: transparent;
        }
      </style>

      <div class="container-fluid">
        <h2 class="section-title">Cluster Comparison Charts</h2>
        <div class="row row-cols-1 row-cols-lg-2 g-4" id="chartRow"></div>

        <h2 class="section-title">Select Cluster</h2>
        <div class="cluster-grid"></div>

        <div id="tablesContainer" class="table-section"></div>
      </div>
    `;
  }


  async connectedCallback() {
    this.chartColors = ['#4A90E2', '#50E3C2', '#9013FE', '#F5A623'];

    const atom = document.documentElement.getAttribute('data-atom');
    const path = this.getAttribute('data-path');
    if (!atom || !path) return console.error('Missing atom or data-path');

    try {
      const res = await fetch(path);
      const data = await res.json();
      const clusters = data[atom];
      if (!clusters) return console.warn(`No data found for atom "${atom}"`);
      this.clusters = clusters;
      this.renderCharts(clusters);
      this.renderClusterButtons(clusters);
    } catch (err) {
      console.error('Error loading JSON:', err);
    }
  }

  // renderCharts(clusters) {
  //   const chartRow = this.shadowRoot.getElementById('chartRow');
  //   const properties = ['AV_Volume_fraction', 'Number_of_channels', 'PLD_A', 'LCD_A'];
  //   const colors = ['#4dc9f6', '#f67019', '#f53794', '#537bc4'];

  //   properties.forEach((prop, i) => {
  //     const valuesByCluster = {};
  //     Object.entries(clusters).forEach(([clusterId, entries]) => {
  //       valuesByCluster[clusterId] = entries.map(entry => entry[prop]).filter(v => v !== undefined && v !== null);
  //     });

  //     const labels = Object.keys(valuesByCluster);
  //     const values = labels.map(c => {
  //       const vals = valuesByCluster[c];
  //       const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  //       return parseFloat(mean.toFixed(3));
  //     });

  //     const canvasId = `${prop.replace(/[^a-zA-Z0-9]/g, '')}Chart`;

  //     const col = document.createElement('div');
  //     col.innerHTML = `
  //       <div class="chart-card">
  //         <div class="chart-title">${prop.replace(/_/g, ' ')}</div>
  //         <canvas id="${canvasId}"></canvas>
  //       </div>
  //     `;
  //     chartRow.appendChild(col);

  //     const ctx = col.querySelector('canvas').getContext('2d');
  //     new Chart(ctx, {
  //       type: 'bar',
  //       data: {
  //         labels,
  //         datasets: [{
  //           label: prop,
  //           data: values,
  //           backgroundColor: colors,
  //           borderColor: colors,
  //           borderWidth: 1
  //         }]
  //       },
  //       options: {
  //         responsive: true,
  //         maintainAspectRatio: false,
  //         plugins: { legend: { display: false } },
  //         scales: {
  //           y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { display: false } },
  //           x: { grid: { display: false } }
  //         }
  //       }
  //     });
  //   });
  // }

  createFrequencyChartByCluster(title, dataKey, clusters, container, chartIdPrefix = 'freq') {
    const clusterIds = Object.keys(clusters);
    const valueSet = new Set();

    // Build valueSet across all clusters
    clusterIds.forEach(clusterId => {
      clusters[clusterId].forEach(entry => {
        const val = entry[dataKey];
        if (val !== undefined && val !== null) {
          const value = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val;
          valueSet.add(value);
        }
      });
    });

    const allValues = Array.from(valueSet);

    // Create datasets for Chart.js
    const datasets = clusterIds.map((clusterId, idx) => {
      const freq = {};
      allValues.forEach(val => (freq[val] = 0));
      clusters[clusterId].forEach(entry => {
        const val = entry[dataKey];
        if (val !== undefined && val !== null) {
          const value = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val;
          freq[value]++;
        }
      });

      return {
        label: `Cluster ${clusterId}`,
        data: allValues.map(v => freq[v]),
        backgroundColor: this.chartColors[idx % this.chartColors.length]

      };
    });

    const canvasId = `${chartIdPrefix}_${dataKey}`;

    const col = document.createElement('div');
    col.className = 'col-12'; // full width for readability
    col.innerHTML = `
      <div class="chart-card">
        <div class="chart-title text-white">${title}</div>
        <canvas id="${canvasId}"></canvas>
      </div>
    `;
    container.appendChild(col);

    const ctx = col.querySelector('canvas').getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: allValues,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 12 } , color: 'white' , usePointStyle: true }
          },
        },
        scales: {
          x: {
            title: { display: true, color:"white", text: title, font: { size: 14 } },
            ticks: { color: 'white', font: { size: 12 } },
            stacked: false
          },
          y: {
            beginAtZero: true,
            title: { display: true, color:"white", text: 'Count', font: { size: 14 } },
            ticks: { color: 'white', font: { size: 12 } },
            grid: { color: '#f0f0f0' },
          }
        }
      }
    });
  }


  renderCharts(clusters) {
    const chartRow = this.shadowRoot.getElementById('chartRow');
    chartRow.innerHTML = '';

    const properties = [
      { key: 'PLD_A', label: 'PLD (Å)' },
      { key: 'LCD_A', label: 'LCD (Å)' },
      { key: 'ASA_m^2/cm^3', label: 'ASA (m²/cm³)' },
      { key: 'AV_A^3', label: 'Accessive Volume (Å³)' },
      { key: 'AV_Volume_fraction', label: 'Void Fraction' },
      { key: 'cn', label: 'Coordination Number' }
    ];

    const colors = ['#4A90E2', '#50E3C2', '#9013FE', '#F5A623'];

    properties.forEach((prop, i) => {
      const canvasId = `${prop.key.replace(/[^a-zA-Z0-9]/g, '')}Scatter`;

      const col = document.createElement('div');
      col.className = 'col my-4';
      col.innerHTML = `
        <div class="chart-card">
          <div class="chart-title">Energy vs ${prop.label}</div>
          <canvas id="${canvasId}"></canvas>
        </div>
      `;
      chartRow.appendChild(col);

      const datasets = Object.entries(clusters).map(([clusterId, entries], idx) => ({
        label: `Cluster ${clusterId}`,
        data: entries
          .filter(e => e[prop.key] != null && e.energy != null)
          .map(e => ({ x: +e.energy, y: +e[prop.key], refcode: e.refcode || 'N/A' })),
        backgroundColor: colors[idx % colors.length],
        pointRadius: 4,
        pointHoverRadius: 6
      }));

      const ctx = col.querySelector('canvas').getContext('2d');

      new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 10,
                color: 'white',
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: ctx => `(${ctx.raw.x}, ${ctx.raw.y}) → ${ctx.raw.refcode}`
              }
            },
            zoom: {
              zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: 'xy'
              },
              pan: {
                enabled: true,
                mode: 'xy',
                modifierKey: 'ctrl'
              }
            }
          },
          scales: {
            x: {
              title: { display: true,  color:"white", text: 'Energy (kcal/mol)' , font: { size: 14 } },
              ticks: { precision: 0, color: 'white', font: { size: 12 } },
              grid: { drawOnChartArea: false }

            },
            y: {
              title: { display: true, color:'white',  text: prop.label, font: { size: 14 } },
              grid: { color: 'white' },
              ticks: { color: 'white', font: { size: 12 } },
            }
          }
        }
      });
    });

    // Frequency bar charts
this.createFrequencyChartByCluster('OMS (Open Metal Site) by Cluster', 'is_open', clusters, chartRow);
this.createFrequencyChartByCluster('Number of Channels by Cluster', 'Number_of_channels', clusters, chartRow);

  }

  renderClusterButtons(clusters) {
    const container = this.shadowRoot.querySelector('.cluster-grid');
    container.innerHTML = '';
    Object.keys(clusters).forEach(clusterId => {
      const btn = document.createElement('div');
      btn.className = 'cluster-box';
      btn.dataset.cluster = clusterId;
      btn.innerText = `Cluster ${clusterId}`;
      btn.addEventListener('click', () => this.renderClusterTable(clusterId));
      container.appendChild(btn);
    });
  }

  renderClusterTable(clusterId) {
    const container = this.shadowRoot.getElementById('tablesContainer');
    container.innerHTML = '';
    const entries = this.clusters[clusterId];

    const table = document.createElement('table');
    table.className = 'table table-hover table-bordered table-striped bg-light rounded-3 shadow-md';
    table.innerHTML = `
      <thead class="table-info">
        <tr>
          <th>Refcode</th>

          <th>BDE (kcal/mol)</th>
        </tr>
      </thead>
      <tbody>
        ${entries.map((entry, i) => `
          <tr class="clickable" data-index="${i}" data-cluster="${clusterId}">
            <td>${entry.refcode || ''}</td>

            <td>${entry['energy'] || ''}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    container.appendChild(table);

    table.querySelectorAll('tr.clickable').forEach(row => {
      row.addEventListener('click', async () => {
        const cluster = row.dataset.cluster;
        const index = row.dataset.index;
        const entry = this.clusters[cluster][index];
        const refcode = entry.refcode;

        // Clean shadow DOM
        const container = this.shadowRoot.getElementById('tablesContainer');
        container.querySelectorAll('.viewer-section').forEach(v => v.remove());

        // Highlight selected row
        table.querySelectorAll('tr').forEach(r => r.classList.remove('table-primary'));
        row.classList.add('table-primary');

        // Add viewer info inside shadow DOM
        const viewerSection = document.createElement('div');
        viewerSection.className = 'viewer-section';
        viewerSection.innerHTML = `
          <h4 class="text-center text-white mb-2">Refcode: ${refcode}</h4>
          <mof-chart data-path="data/json/cheminformatic/${refcode}.json"></mof-chart>
          // <p class="text-muted text-center mt-3"> </p>
        `;
        container.appendChild(viewerSection);

        // Clear global viewer area in light DOM
        const globalViewer = document.getElementById('global-viewer-container');
        globalViewer.innerHTML = '';

        // Create Bootstrap viewer card in light DOM
        const viewerCard = document.createElement('div');
        viewerCard.className = 'card border-0 my-4';
        viewerCard.innerHTML = `
      <div class="card-body">
        <h5 class="card-title text-center"> 3D Structure of ${refcode}</h5>
        <div id="viewer-${refcode}" class="mx-auto my-4"></div>
        <div class="text-center">
          <a href="data/cifs/${refcode}.cif" download class="btn btn-outline-primary">
            <i class="bi bi-download"></i> Download CIF
          </a>
        </div>
      </div>
    `;

        globalViewer.appendChild(viewerCard);

        const viewerDiv = document.getElementById(`viewer-${refcode}`);
        Object.assign(viewerDiv.style, {
          width: '100%',
          maxWidth: '960px',
          height: '400px',
          borderRadius: '0.5rem',
          background: '#fff',
          margin: '0 auto',
          position: 'relative' // required for child canvas positioning
        });

        try {
          const res = await fetch(`data/json/json_cif/${refcode}.json`);
          const structureData = await res.json();

          if (
            !structureData.positions ||
            !structureData.symbols ||
            structureData.positions.length !== structureData.symbols.length
          ) {
            viewerDiv.innerHTML = `<div class="text-danger text-center">Invalid structure data.</div>`;
            return;
          }

          if (typeof window.visualizeStructure === 'function') {
            window.visualizeStructure(structureData, 0.3, viewerDiv);
          } else {
            viewerDiv.innerHTML = `<p class="text-danger text-center">Structure viewer not available.</p>`;
          }
        } catch (err) {
          console.error(`Failed to load structure for ${refcode}:`, err);
          viewerDiv.innerHTML = `<p class="text-danger text-center">Could not load structure file.</p>`;
        }
      });





    });
  }
}

customElements.define('cluster-comparison', ClusterComparison);

// <th>ASA (m²/cm³)</th>
// <th>Void Fraction</th>
// <th>LCD (Å)</th>
// <th>PLD (Å)</th>
// <th># Channels</th>
// <th>CN</th>
// <th>Metal</th>
// <th>OMS</th>


// <td>${entry['ASA_m^2/cm^3'] || ''}</td>
// <td>${entry['AV_Volume_fraction'] || ''}</td>
// <td>${entry['LCD_A'] || ''}</td>
// <td>${entry['PLD_A'] || ''}</td>
// <td>${entry['Number_of_channels'] || ''}</td>
// <td>${entry['cn'] || ''}</td>
// <td>${entry['metal'] || ''}</td>
// <td>${entry['is_open'] ? 'Yes' : 'No'}</td>