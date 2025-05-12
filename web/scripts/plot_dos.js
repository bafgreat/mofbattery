(function () {
    function loadGzippedJSON(url) {
      return fetch(url)
        .then(res => res.arrayBuffer())
        .then(buffer => {
          const decompressed = new TextDecoder("utf-8").decode(pako.inflate(new Uint8Array(buffer)));
          return JSON.parse(decompressed);
        });
    }

    function createPDOSPlot(container, jsonData) {
      const fermi = jsonData.fermi_ev;
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);

      const shiftBox = document.createElement('input');
      shiftBox.type = 'checkbox';
      shiftBox.checked = true;

      const range = document.createElement('input');
      range.type = 'range';
      range.min = 1;
      range.max = 10;
      range.value = 5;

      const rangeLabel = document.createElement('span');
      rangeLabel.textContent = '±5 eV';

      container.appendChild(document.createElement('br'));
      container.appendChild(document.createTextNode('Shift Fermi: '));
      container.appendChild(shiftBox);
      container.appendChild(document.createElement('br'));
      container.appendChild(document.createTextNode('Window: '));
      container.appendChild(range);
      container.appendChild(rangeLabel);

      let chart;

      function update() {
        const shift = shiftBox.checked;
        const windowSize = parseFloat(range.value);
        rangeLabel.textContent = `±${windowSize} eV`;

        const energies = jsonData.energies_ev.map(e => shift ? e - fermi : e);
        const nE = energies.length;
        const filteredIndices = energies.map((e, i) => Math.abs(e) <= windowSize ? i : -1).filter(i => i !== -1);

        const atomMap = {};
        const symbols = jsonData.symbols;
        const atoms = jsonData.atoms;
        const pdos = jsonData.raw_pdos;

        for (let i = 0; i < atoms.length; i++) {
          const a = atoms[i] - 1;
          const sym = symbols[a];
          if (!atomMap[sym]) atomMap[sym] = new Array(nE).fill(0);
          for (let j = 0; j < nE; j++) {
            atomMap[sym][j] += pdos[i][j];
          }
        }

        const datasets = [];
        const colors = {};
        let index = 0;
        const allSymbols = Object.keys(atomMap).sort();

        for (const sym of allSymbols) {
          const rawY = atomMap[sym];
          const y = filteredIndices.map(i => rawY[i]);
          const x = filteredIndices.map(i => energies[i]);

          const color = ATOM_COLORS[sym] || `hsl(${index * 37 % 360}, 70%, 50%)`;
          colors[sym] = color;

          datasets.push({
            label: sym,
            data: x.map((xi, j) => ({ x: xi, y: y[j] })),
            fill: true,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 0,
            stack: 'total',
            pointRadius: 0
          });
          index += 1;
        }

        if (chart) chart.destroy();
        chart = new Chart(canvas, {
          type: 'line',
          data: { datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            elements: { line: { tension: 0 } },
            plugins: {
              legend: { position: 'right' },
              tooltip: { mode: 'index', intersect: false }
            },
            scales: {
              x: {
                type: 'linear',
                title: { display: true, text: 'Energy (eV)' },
                stacked: false
              },
              y: {
                title: { display: true, text: 'PDOS' },
                stacked: true
              }
            }
          }
        });
      }

      shiftBox.addEventListener('change', update);
      range.addEventListener('input', update);
      update();
    }

    window.initAllPDOS = function () {
      const containers = document.querySelectorAll('.pdos-container');
      containers.forEach(container => {
        const url = container.dataset.json;
        if (url) {
          loadGzippedJSON(url).then(data => createPDOSPlot(container, data));
        }
      });
    };

    // ATOM_COLORS globally available here (trimmed for brevity in demo)
    const ATOM_COLORS = {
      H: '#B3E3F5', C: '#909090', N: '#3050F8', O: '#FF0D0D', F: '#90E050',
      Na: '#AB5CF2', Mg: '#8AFF00', Al: '#BFA6A6', Si: '#F0C8A0', P: '#FF8000',
      S: '#FFFF30', Cl: '#1FF01F', K: '#8F40D4', Ca: '#3DFF00', Fe: '#E06633',
      Co: '#F090A0', Ni: '#50D050', Cu: '#C88033', Zn: '#7D80B0'
      // ... extend as needed
    };
  })();
