class MOFChartComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/chart.js/dist/Chart.min.css">
        <style>
          :host {
            display: block;
            margin: 2rem auto;
            font-family: 'Segoe UI', sans-serif;
          }

          .card {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            padding: 1rem;
            margin-bottom: 1.5rem;
            transition: box-shadow 0.2s ease;
          }

          .card:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          }

          h4 {
            text-align: center;
            font-size: 1.1rem;
            font-weight: 600;
            color: #343a40;
            margin-bottom: 0.75rem;
          }

          canvas {
            width: 100% !important;
            height: 200px !important;
          }
        </style>

        <div class="container-fluid">
          <div class="row">
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card">
                <h4>Functional Groups</h4>
                <canvas id="functionalGroupsChart"></canvas>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card">
                <h4>Unique Atoms</h4>
                <canvas id="uniqueAtomsChart"></canvas>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card">
                <h4>Metal Sites</h4>
                <canvas id="metalSitesChart"></canvas>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-lg-3">
              <div class="card">
                <h4>Ring Systems</h4>
                <canvas id="ringSystemsChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    async connectedCallback() {
      const path = this.getAttribute('data-path');
      if (!path) return console.error('data-path attribute is required');

      try {
        const res = await fetch(path);
        const data = await res.json();
        this.plotCharts(data);
      } catch (err) {
        console.error('Failed to load JSON:', err);
      }
    }

    plotCharts(data) {
      const fg = Object.entries(data.functional_groups).filter(([_, v]) => v > 0);
      this.makeChart('functionalGroupsChart',
        fg.map(([k]) => k), fg.map(([_, v]) => v),
        '', 'rgba(54, 162, 235, 0.7)'
      );

      this.makeChart('uniqueAtomsChart',
        Object.keys(data.unique_atoms), Object.values(data.unique_atoms),
        '', 'rgba(255, 159, 64, 0.7)'
      );

      const metalLabels = Object.keys(data.metal_sites);
      const metalValues = metalLabels.map(site => data.metal_sites[site].coordination_number);
      this.makeChart('metalSitesChart',
        metalLabels, metalValues,
        '', 'rgba(153, 102, 255, 0.7)'
      );

      const ringCounts = {};
      data.ring_systems.forEach(r => ringCounts[r.size] = (ringCounts[r.size] || 0) + 1);
      this.makeChart('ringSystemsChart',
        Object.keys(ringCounts), Object.values(ringCounts),
        '', 'rgba(255, 99, 132, 0.7)'
      );
    }

    makeChart(id, labels, values, title, color) {
      const ctx = this.shadowRoot.getElementById(id).getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: title,
            data: values,
            backgroundColor: color,
            borderColor: color.replace('0.7', '1'),
            borderWidth: 1
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { maxRotation: 45, minRotation: 30 }
            },
            y: {
              grid: { display: false },
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  customElements.define('mof-chart', MOFChartComponent);
