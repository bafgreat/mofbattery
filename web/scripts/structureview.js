(function () {
  const ATOM_COLORS = {
    'H': '#FFFFFF', 'He': '#D9FFFF', 'Li': '#CC80FF', 'Be': '#C2FF00', 'B': '#FFB5B5',
    'C': '#909090', 'N': '#3050F8', 'O': '#FF0D0D', 'F': '#90E050', 'Ne': '#B3E3F5',
    'Na': '#AB5CF2', 'Mg': '#8AFF00', 'Al': '#BFA6A6', 'Si': '#F0C8A0', 'P': '#FF8000',
    'S': '#FFFF30', 'Cl': '#1FF01F', 'Ar': '#80D1E3', 'K': '#8F40D4', 'Ca': '#3DFF00',
    'Sc': '#E6E6E6', 'Ti': '#BFC2C7', 'V': '#A6A6AB', 'Cr': '#8A99C7', 'Mn': '#9C7AC7',
    'Fe': '#E06633', 'Co': '#F090A0', 'Ni': '#50D050', 'Cu': '#C88033', 'Zn': '#7D80B0',
    'Ga': '#C28F8F', 'Ge': '#668F8F', 'As': '#BD80E3', 'Se': '#FFA100', 'Br': '#A62929',
    'Kr': '#5CB8D1', 'Rb': '#702EB0', 'Sr': '#00FF00', 'Y': '#94FFFF', 'Zr': '#94E0E0',
    'Nb': '#73C2C9', 'Mo': '#54B5B5', 'Tc': '#3B9E9E', 'Ru': '#248F8F', 'Rh': '#0A7D8C',
    'Pd': '#006985', 'Ag': '#C0C0C0', 'Cd': '#FFD98F', 'In': '#A67573', 'Sn': '#668080',
    'Sb': '#9E63B5', 'Te': '#D47A00', 'I': '#940094', 'Xe': '#429EB0', 'Cs': '#57178F',
    'Ba': '#00C900', 'La': '#70D4FF', 'Ce': '#FFFFC7', 'Pr': '#D9FFC7', 'Nd': '#C7FFC7',
    'Pm': '#A3FFC7', 'Sm': '#8FFFC7', 'Eu': '#61FFC7', 'Gd': '#45FFC7', 'Tb': '#30FFC7',
    'Dy': '#1FFFC7', 'Ho': '#00FF9C', 'Er': '#00E675', 'Tm': '#00D452', 'Yb': '#00BF38',
    'Lu': '#00AB24', 'Hf': '#4DC2FF', 'Ta': '#4DA6FF', 'W': '#2194D6', 'Re': '#267DAB',
    'Os': '#266696', 'Ir': '#175487', 'Pt': '#D0D0E0', 'Au': '#FFD123', 'Hg': '#B8B8D0',
    'Tl': '#A6544D', 'Pb': '#575961', 'Bi': '#9E4FB5', 'Po': '#AB5C00', 'At': '#754F45',
    'Rn': '#428296', 'Fr': '#420066', 'Ra': '#007D00', 'Ac': '#70ABFA', 'Th': '#00BAFF',
    'Pa': '#00A1FF', 'U': '#008FFF', 'Np': '#0080FF', 'Pu': '#006BFF', 'Am': '#545CF2',
    'Cm': '#785CE3', 'Bk': '#8A4FE3', 'Cf': '#A136D4', 'Es': '#B31FD4', 'Fm': '#B31FBA',
    'Md': '#B30DA6', 'No': '#BD0D87', 'Lr': '#C70066', 'Rf': '#CC0059', 'Db': '#D1004F',
    'Sg': '#D90045', 'Bh': '#E00038', 'Hs': '#E6002E', 'Mt': '#EB0026', 'X': 'black'
  };

  const COVALENT_RADII = {
    "H": 0.30, "He": 0.99, "Li": 1.52, "Be": 1.12, "B": 0.88, "C": 0.77, "N": 0.70, "O": 0.66,
    "F": 0.64, "Ne": 1.60, "Na": 1.86, "Mg": 1.60, "Al": 1.43, "Si": 1.17, "P": 1.10, "S": 1.04,
    "Cl": 0.99, "Ar": 1.92, "K": 2.31, "Ca": 1.97, "Sc": 1.60, "Ti": 1.46, "V": 1.31, "Cr": 1.25,
    "Mn": 1.29, "Fe": 1.26, "Co": 1.25, "Ni": 1.24, "Cu": 1.28, "Zn": 1.33, "Ga": 1.41, "Ge": 1.22,
    "As": 1.21, "Se": 1.17, "Br": 1.14, "Kr": 1.97, "Rb": 2.44, "Sr": 2.15, "Y": 1.80, "Zr": 1.57,
    "Nb": 1.41, "Mo": 1.36, "Tc": 1.35, "Ru": 1.33, "Rh": 1.34, "Pd": 1.38, "Ag": 1.44, "Cd": 1.49,
    "In": 1.66, "Sn": 1.62, "Sb": 1.41, "Te": 1.37, "I": 1.33, "Xe": 2.17, "Cs": 2.62, "Ba": 2.17,
    "La": 1.88, "Ce": 1.818, "Pr": 1.824, "Nd": 1.814, "Pm": 1.834, "Sm": 1.804, "Eu": 2.084,
    "Gd": 1.804, "Tb": 1.773, "Dy": 1.781, "Ho": 1.762, "Er": 1.761, "Tm": 1.759, "Yb": 1.922,
    "Lu": 1.738, "Hf": 1.57, "Ta": 1.43, "W": 1.37, "Re": 1.37, "Os": 1.34, "Ir": 1.35, "Pt": 1.38,
    "Au": 1.44, "Hg": 1.52, "Tl": 1.71, "Pb": 1.75, "Bi": 1.70, "Po": 1.40, "At": 1.40, "Rn": 2.40,
    "Fr": 2.70, "Ra": 2.20, "Ac": 2.00, "Th": 1.79, "Pa": 1.63, "U": 1.56, "Np": 1.55, "Pu": 1.59,
    "Am": 1.73, "Cm": 1.74, "Bk": 1.70, "Cf": 1.86, "Es": 1.86, "Fm": 2.00, "Md": 2.00, "No": 2.00,
    "Lr": 2.00, "Rf": 2.00, "Db": 2.00, "Sg": 2.00, "Bh": 2.00, "Hs": 2.00, "Mt": 2.00, "default": 0.20
  };

  function visualizeStructure(data, tolerance = 0.3, viewerElement = document.getElementById('viewer')) {
    if (!viewerElement || !data || !data.positions || !data.symbols || !data.cell) {
      console.error("Invalid input or missing DOM element");
      return;
    }

    if (typeof $3Dmol === "undefined" || typeof math === "undefined") {
      console.error("3Dmol.js and math.js must be loaded first.");
      viewerElement.innerHTML = `<p class="text-danger text-center">3Dmol.js and math.js required.</p>`;
      return;
    }

    const { cell, positions, symbols } = data;
    const viewer = $3Dmol.createViewer(viewerElement, {
      backgroundColor: 'black',

      defaultcolors: $3Dmol.elementColors.defaultColors
    });

    const invCell = math.inv(cell);

    function wrapToCell(cart) {
      const frac = math.multiply(invCell, cart);
      const wrappedFrac = frac.map(f => ((f % 1) + 1) % 1);
      return math.multiply(cell, wrappedFrac);
    }

    const wrappedPositions = positions.map(pos => wrapToCell(pos));

    wrappedPositions.forEach((pos, i) => {
      const elem = symbols[i];
      viewer.addSphere({
        center: { x: pos[0], y: pos[1], z: pos[2] },
        radius: COVALENT_RADII[elem] || COVALENT_RADII.default,
        color: ATOM_COLORS[elem] || ATOM_COLORS['X']
      });
    });

    for (let i = 0; i < wrappedPositions.length; i++) {
      for (let j = i + 1; j < wrappedPositions.length; j++) {
        const pos1 = wrappedPositions[i];
        const pos2 = wrappedPositions[j];
        const dist = euclidean(pos1, pos2);
        const r1 = COVALENT_RADII[symbols[i]] || 0.7;
        const r2 = COVALENT_RADII[symbols[j]] || 0.7;
        if (dist < r1 + r2 + tolerance) {
          viewer.addCylinder({
            start: { x: pos1[0], y: pos1[1], z: pos1[2] },
            end: { x: pos2[0], y: pos2[1], z: pos2[2] },
            radius: 0.1,
            color: 'gray'
          });
        }
      }
    }

    drawUnitCell(viewer, cell);

    viewer.zoomTo();
    viewer.render();
  }

  function drawUnitCell(viewer, cell) {
    const origin = [0, 0, 0];
    const a = cell[0];
    const b = cell[1];
    const c = cell[2];

    const vertices = [
      origin,
      a,
      b,
      c,
      math.add(a, b),
      math.add(a, c),
      math.add(b, c),
      math.add(math.add(a, b), c)
    ];

    const edges = [
      [0,1], [0,2], [0,3],
      [1,4], [1,5],
      [2,4], [2,6],
      [3,5], [3,6],
      [4,7], [5,7], [6,7]
    ];

    edges.forEach(([startIdx, endIdx]) => {
      const start = vertices[startIdx];
      const end = vertices[endIdx];
      viewer.addCylinder({
        start: { x: start[0], y: start[1], z: start[2] },
        end: { x: end[0], y: end[1], z: end[2] },
        radius: 0.05,
        color: 'white',
        fromCap: 1,
        toCap: 1
      });
    });
  }

  function euclidean(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    const dz = a[2] - b[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // Export globally
  window.ATOM_COLORS = ATOM_COLORS;
  window.COVALENT_RADII = COVALENT_RADII;
  window.visualizeStructure = visualizeStructure;
})();
