import pybel
from rdkit import Chem
from rdkit.Chem import AllChem

class FunctionalGroupAnalyzer:
    """
    A class to analyze CIF structures for functional groups, ring types, and macrocycles
    using RDKit and Open Babel.
    """

    SMARTS_PATTERNS = {
        # --- Acids ---
        "Carboxylic Acid": "C(=O)[OH]",
        "Sulfonic Acid": "S(=O)(=O)[OH]",
        "Phenol": "c[OH]",
        "Thiols": "[#16X2H]",

        # --- Basic Groups ---
        "Primary Amine": "[NX3;H2][CX4]",
        "Secondary Amine": "[NX3;H1][CX4][CX4]",
        "Tertiary Amine": "[NX3]([CX4])[CX4]",
        "Guanidine": "NC(=N)N",
        "Pyridine-like": "n1ccccc1",

        # --- Carbonyl Derivatives ---
        "Ketone": "C(=O)[#6]",
        "Aldehyde": "[CX3H1](=O)[#6]",
        "Amide": "C(=O)N",
        "Ester": "C(=O)OC",
        "Urea": "NC(=O)N",
        "Thioamide": "C(=S)N",
        "Imide": "C(=O)NC(=O)",
        "Anhydride": "C(=O)OC(=O)",

        # --- Nitriles, Imines, Isocyanates ---
        "Nitrile": "C#N",
        "Imine": "C=N",
        "Isocyanate": "N=C=O",

        # --- Ethers, Sulfides ---
        "Ether": "[OD2]([#6])[#6]",
        "Thioether (Sulfide)": "[#16X2]([#6])[#6]",
        "Disulfide": "[#16X2]-[#16X2]",

        # --- Halides ---
        "Halide (F)": "[F]",
        "Halide (Cl)": "[Cl]",
        "Halide (Br)": "[Br]",
        "Halide (I)": "[I]",

        # --- Phosphorus / Sulfur ---
        "Phosphate": "P(=O)(O)(O)O",
        "Phosphine": "P([#6])([#6])[#6]",
        "Sulfonamide": "S(=O)(=O)N",

        # --- Rings / Aromatics ---
        "3-membered ring": "[R3]",
        "4-membered ring": "[R4]",
        "5-membered ring": "[R5]",
        "6-membered ring": "[R6]",
        "7-membered ring": "[R7]",
        "Macrocycle (≥8 atoms)": "[R8,R9,R10,R11,R12,R13,R14,R15,R16]",
        "Aromatic Ring (6 atoms)": "a1aaaaa1",
        "Heterocycle (N/O/S)": "[R][#7,#8,#16]",

        # --- Macrocycles / Frameworks ---
        "Porphyrin-like": "C1=CC2=CC3=CC=C(N3)C=C4C=CC(=N4)C=C5C=CC(=N5)C=C1N2",
        "Phthalocyanine-like": "C1=CC2=C(C=C1)N=C3C=CC(=N3)C=C4C=CC(=N4)C=N2",
        "Crown Ether (18-crown-6)": "C1COCCOCCOCCOC1",
        "Cyclodextrin-like": "[C@H]1(O[C@H](CO)[C@@H](O)[C@H](O)[C@H](O)[C@H]1O)"
    }
    METALS = {
        'Li', 'Na', 'K', 'Rb', 'Cs',
        'Mg', 'Ca', 'Sr', 'Ba',
        'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
        'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd',
        'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg',
        'Al', 'Ga', 'In', 'Tl', 'Sn', 'Pb', 'Bi',
        'La', 'Ce', 'Pr', 'Nd', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy',
        'Ho', 'Er', 'Tm', 'Yb', 'Lu',
        'Th', 'Pa', 'U', 'Np', 'Pu'
    }

    def __init__(self, cif_path):
        """
        Initialize the analyzer with a CIF file path.

        Parameters:
            cif_path (str): Path to the .cif file to analyze.
        """
        self.cif_path = cif_path
        self.rdkit_mol = self._load_rdkit_mol()

    def _load_rdkit_mol(self):
        """
        Convert the CIF file to an RDKit molecule.

        Returns:
            rdkit.Chem.Mol: RDKit molecule object.
        """
        mol = next(pybel.readfile("cif", self.cif_path))
        smiles = mol.write("smi").split()[0]
        rdmol = Chem.MolFromSmiles(smiles)
        if rdmol:
            Chem.Kekulize(rdmol, clearAromaticFlags=True)
        else:
            raise ValueError("Failed to parse CIF to RDKit Mol.")
        return rdmol

    def count_functional_groups(self):
        """
        Count occurrences of defined SMARTS patterns in the molecule.

        Returns:
            dict: Dictionary of functional group labels and match counts.
        """
        results = {}
        for label, smarts in self.SMARTS_PATTERNS.items():
            patt = Chem.MolFromSmarts(smarts)
            if patt is not None:
                matches = self.rdkit_mol.GetSubstructMatches(patt)
                results[label] = len(matches)
        return results

    def analyze_metal_sites(self):
        """
        Analyze metal atoms and their chemical environments.

        Returns:
            dict: Dictionary where keys are metal atoms (e.g. "Cu_12"),
                  and values include coordination number and bonded atom types.
        """
        metal_envs = {}
        for atom in self.rdkit_mol.GetAtoms():
            symbol = atom.GetSymbol()
            if symbol in self.METALS:
                metal_idx = atom.GetIdx()
                neighbors = atom.GetNeighbors()
                donor_types = [n.GetSymbol() for n in neighbors]
                metal_envs[f"{symbol}_{metal_idx}"] = {
                    "coordination_number": len(donor_types),
                    "donor_atoms": donor_types
                }
        return metal_envs


if __name__ == "__main__":
    cif_file = "your_structure.cif"  
    analyzer = FunctionalGroupAnalyzer(cif_file)
    results = analyzer.count_functional_groups()
    for group, count in results.items():
        print(f"{group}: {count}")
