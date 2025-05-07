class MOFChartComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
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

          .card {
            background:black;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            padding: 1rem;
            margin-bottom: 1.5rem;
            transition: box-shadow 0.2s ease;
            height: 100%;
          }

          .card:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          }

          h4 {
            text-align: center;
            font-size: 1.1rem;
            font-weight: 600;
            color:white;
            margin-bottom: 1rem;
          }

          .chart-wrapper {
            position: relative;
            width: 100%;
            aspect-ratio: 2 / 1; /* Maintain 2:1 ratio without squashing */
          }

          canvas {
            width: 100% !important;
            height: 100% !important;
          }
        </style>

        <div class="container-fluid">
          <div class="row">
            <div class="col-12 col-sm-6 my-2">
              <div class="card">
                <h4>Functional Groups</h4>
                <div class="chart-wrapper">
                  <canvas id="functionalGroupsChart"></canvas>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6 my-4">
              <div class="card">
                <h4>Unique Atoms</h4>
                <div class="chart-wrapper">
                  <canvas id="uniqueAtomsChart"></canvas>
                </div>
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
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { maxRotation: 45, minRotation: 30, color: 'white', FontSize: 12 },
            },
            y: {
              grid: { display: false },
              ticks: { color: 'white', FontSize: 12 },
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  customElements.define('mof-chart', MOFChartComponent);
