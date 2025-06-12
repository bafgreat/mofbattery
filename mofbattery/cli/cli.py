import argparse
import json
import os
from mofbattery.cheminformatic.analyser import FunctionalGroupAnalyzer
from mofbattery.read_write.filetyper import ams_bandstructure_input


def main():
    """
    Main function to parse command line arguments and run the analysis.
    """
    parser = argparse.ArgumentParser(description="Analyze a CIF structure for functional groups, metal sites, and ring systems.")
    parser.add_argument("cif_file", help="Path to the CIF file to analyze.")
    args = parser.parse_args()

    analyzer = FunctionalGroupAnalyzer(args.cif_file)
    summary = analyzer.summarize_chemical_features()

    base_name = os.path.basename(args.cif_file).split(".")[0]
    json_file = f"{base_name}.json"
    txt_file = f"{base_name}.txt"

    # Print to console
    print("\nFunctional Groups:")
    for group, count in summary["functional_groups"].items():
        if count > 0:
            print(f"  {group}: {count}")

    print("\nUnique Atom Counts:")
    for atom, count in summary["unique_atoms"].items():
        print(f"  {atom}: {count}")

    print("\nMetal Sites:")
    if summary["metal_sites"]:
        for metal, env in summary["metal_sites"].items():
            print(f"  {metal}:")
            print(f"    Coordination Number: {env['coordination_number']}")
            print(f"    Donor Atoms: {', '.join(env['donor_atoms'])}")
    else:
        print("  No metal centers detected.")

    print("\nRing Systems:")
    for i, ring in enumerate(summary["ring_systems"], 1):
        print(f"  Ring {i}:")
        print(f"    Description: {ring['description']}")
        print(f"    Atom Indices: {ring['atom_indices']}")

    with open(json_file, "w") as jf:
        json.dump(summary, jf, indent=4)
    print(f"\nJSON summary written to: {json_file}")

    with open(txt_file, "w") as tf:
        tf.write("Functional Groups:\n")
        for group, count in summary["functional_groups"].items():
            if count > 0:
                tf.write(f"  {group}: {count}\n")

        tf.write("\nUnique Atom Counts:\n")
        for atom, count in summary["unique_atoms"].items():
            tf.write(f"  {atom}: {count}\n")

        tf.write("\nMetal Sites:\n")
        if summary["metal_sites"]:
            for metal, env in summary["metal_sites"].items():
                tf.write(f"  {metal}:\n")
                tf.write(f"    Coordination Number: {env['coordination_number']}\n")
                tf.write(f"    Donor Atoms: {', '.join(env['donor_atoms'])}\n")
        else:
            tf.write("  No metal centers detected.\n")

        tf.write("\nRing Systems:\n")
        for i, ring in enumerate(summary["ring_systems"], 1):
            tf.write(f"  Ring {i}:\n")
            tf.write(f"    Description: {ring['description']}\n")
            tf.write(f"    Atom Indices: {ring['atom_indices']}\n")

    print(f"Text summary written to: {txt_file}")


def ams_bandstructure():
    """
    Function to generate AMS band structure input.
    """
    parser = argparse.ArgumentParser(description="Generate AMS band structure input.")
    parser.add_argument("cif_file", help="Path to the CIF file.")
    args = parser.parse_args()

    # Generate AMS band structure input
    ams_bandstructure_input(args.cif_file)
    print(f"AMS band structure input generated for: {args.cif_file}")


