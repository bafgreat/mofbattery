import argparse
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from matplotlib.lines import Line2D
from matplotlib.gridspec import GridSpec
from mofbattery.es.plot_dos import PDOSPlotter, ATOM_COLORS
from mofbattery.es.band_structure import BandStructure, filter_xticks_and_labels


def plot_combined(rkf_path, ylim=(-5, 5), shift_to_fermi=True, energy_window=0.2, save_path='combined.png'):

    fig = plt.figure(figsize=(14, 8), dpi=150)
    # gs = GridSpec(1, 2, width_ratios=[5, 2], wspace=0.05)
    gs = GridSpec(1, 2, width_ratios=[5, 2], wspace=0.05)


    ax_band = fig.add_subplot(gs[0])
    ax_pdos = fig.add_subplot(gs[1], sharey=ax_band)

    band_plotter = BandStructure(rkf_path, ylim=ylim, shift_to_fermi=shift_to_fermi)
    energies = band_plotter.get_energies()
    kpath, xtick_locs, xtick_labels_raw = band_plotter.get_kpoints_and_labels()
    fermi = band_plotter.get_fermi_energy()
    shift = fermi if shift_to_fermi else 0

    xtick_labels_latex = [band_plotter.latexify_label(lbl) for lbl in xtick_labels_raw]
    xtick_locs, xtick_labels = filter_xticks_and_labels(xtick_locs, xtick_labels_latex)

    colors = plt.cm.viridis(np.linspace(0, 1, energies.shape[2]))
    linestyles = ['-', '--']
    for spin in range(energies.shape[0]):
        for band in range(energies.shape[2]):
            ax_band.plot(kpath, energies[spin, :, band] - shift,
                         color=colors[band],
                         lw=1.2,
                         linestyle=linestyles[spin] if energies.shape[0] == 2 else '-')

    ax_band.set_ylabel("Energy (eV)", fontsize=14)
    ax_band.set_xticks(xtick_locs)
    ax_band.set_xticklabels(xtick_labels, fontsize=12)
    for x in xtick_locs:
        ax_band.axvline(x, color='gray', linestyle='--', linewidth=0.8)
    ax_band.axhline(0 if shift_to_fermi else fermi, color='darkred', linestyle='--', lw=1)
    ax_band.set_ylim(*ylim)

    # --- Band Gap Annotation ---
    gap = band_plotter.get_band_gap()
    gap_label = f'Gap: {gap:.2f} eV'

    # --- PDOS ---
    pdos_plotter = PDOSPlotter(rkf_path, ylim=ylim, shift_to_fermi=shift_to_fermi)
    energies_ev, full_energies_ev, raw_pdos, atoms, lvals, symbols, energy_mask, fermi_ev = pdos_plotter.load_data()

    bottom = np.zeros_like(energies_ev)
    all_handles = []
    seen = set()
    for symbol in sorted(set(symbols), key=lambda s: symbols.count(s), reverse=True):
        if symbol in seen:
            continue
        seen.add(symbol)

        indices = [i for i, s in enumerate(symbols) if s == symbol]
        basis_indices = np.concatenate([np.where(atoms == (idx + 1))[0] for idx in indices])
        pdos = raw_pdos[basis_indices, :]
        pdos_sum = pdos.sum(axis=0)[energy_mask]
        color = ATOM_COLORS.get(symbol, 'gray')
        ax_pdos.fill_betweenx(energies_ev, bottom, bottom + pdos_sum, color=color, label=symbol)
        bottom += pdos_sum
        all_handles.append((Rectangle((0, 0), 1, 1, color=color), symbol))

    # --- Total DOS ---
    # --- Total DOS ---
    total_dos = raw_pdos.sum(axis=0)[energy_mask]
    total_dos_line, = ax_pdos.plot(total_dos, energies_ev, color='black', linestyle='-', linewidth=2.5, label='Total DOS')

    fermi_line = ax_pdos.axhline(0 if shift_to_fermi else fermi_ev, color='darkred', linestyle='--', lw=2.5, label='Fermi')

    ax_pdos.set_xlabel("DOS", fontsize=14)
    ax_pdos.tick_params(labelleft=False)
    ax_pdos.set_xlim(left=0)
    all_handles_sorted = sorted(all_handles, key=lambda h: h[1])
    handles, labels = zip(*all_handles_sorted) if all_handles_sorted else ([], [])

    handles += (total_dos_line, fermi_line)
    labels += ("Total DOS", "Fermi")

    # --- Legend in PDOS bottom-right ---
    # all_handles_sorted = sorted(all_handles, key=lambda h: h[1])
    # handles, labels = zip(*all_handles_sorted)
    # handles, labels = zip(*all_handles_sorted) if all_handles_sorted else ([], [])


    # Add Fermi + gap annotation
    # handles += (
    #     Line2D([0], [0], color='darkred', linestyle='--', lw=1),
    #     Line2D([0], [0], color='none')
    # )
    # labels += ("Fermi", "Total DOS")

    ax_pdos.legend(
        handles,
        labels,
        loc='upper left',
        bbox_to_anchor=(1.05, 1.02),
        fontsize=14,
        frameon=False,
        ncol=1,
        borderpad=0.6,
        labelspacing=0.5,
        handletextpad=0.5,
        handlelength=1.2
    )


    # Save and show
    # plt.subplots_adjust(right=0.88)
    plt.subplots_adjust(left=0.08, right=0.88, bottom=0.1, top=0.95, wspace=0.1)

    # plt.tight_layout()
    plt.savefig(save_path, bbox_inches='tight')
    plt.show()



def main():
    parser = argparse.ArgumentParser(description="Plot combined Band Structure and PDOS from AMS BAND RKF")
    parser.add_argument("rkf_path", help="Path to the band.rkf file")
    parser.add_argument("--save_path", default="combined.png", help="Path to save the combined plot")
    parser.add_argument("--ylim", nargs=2, type=float, default=[-5, 5], help="Energy limits for the Y-axis (eV)")
    parser.add_argument("--shift_to_fermi", action="store_true", help="Shift energy axis so Fermi level is at 0")
    parser.add_argument("--window", type=float, default=0.2, help="Energy window around Fermi level (eV)")

    args = parser.parse_args()

    plot_combined(
        rkf_path=args.rkf_path,
        ylim=tuple(args.ylim),
        shift_to_fermi=args.shift_to_fermi,
        energy_window=args.window,
        save_path=args.save_path
    )


if __name__ == "__main__":
    main()
# rkf_path = '/Users/Dinga_1/nocscratch/Battery_Result_folder/Bands_calculation/MOFs_band/ASAMAK/ams.results/band.rkf'

# plot_combined(rkf_path, ylim=(-8, 2), shift_to_fermi=False, energy_window=0.2, save_path='combined.png')