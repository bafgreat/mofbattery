import inspect
import json
import re
from scm.plams import *
import matplotlib.pyplot as plt
import numpy as np

import numpy as np
import matplotlib.pyplot as plt

def latexify_label(lbl):
    """Convert a raw k-point label to LaTeX-safe format for matplotlib."""
    if not lbl:
        return ""

    # Special case for Gamma
    if lbl.upper() in ["G", "GAMMA"]:
        return r"$\Gamma$"

    # Format powers and subscripts
    lbl = re.sub(r"\^(\d+)", r"^{\1}", lbl)     # E^1 -> E^{1}
    lbl = re.sub(r"_(\d+)", r"_{\1}", lbl)      # M_1 -> M_{1}

    return f"${lbl}$"

def my_plot_band_structure(
    x, y_spin_up, y_spin_down=None, labels=None,
    fermi_energy=None, zero=None, ax=None,
    fermi_line_kwargs=None
):
    """
    Enhanced band structure plot with clear visibility and styling improvements.
    """

    if zero is None:
        zero = 0
    elif zero == "fermi":
        assert fermi_energy is not None
        zero = fermi_energy

    labels = labels or []
    labels = [latexify_label(lbl) for lbl in labels]
    print(labels)

    if ax is None:
        _, ax = plt.subplots(figsize=(12,8))

    # Plot spin-up bands
    ax.plot(x, y_spin_up - zero, "-", color='#A1BE95', alpha=1, linewidth=1)

    # Plot spin-down bands if present with improved colors
    if y_spin_down is not None:
        ax.plot(x, y_spin_down - zero, "--", color='#F98866',alpha=0.8, linewidth=1)

    # Set ticks and labels
    tick_x, tick_labels = [], []
    for xx, lbl in zip(x, labels):
        if lbl and (len(tick_x) == 0 or not np.isclose(xx, tick_x[-1])):
            tick_x.append(xx)
            tick_labels.append(lbl)

    ax.set_xticks(tick_x)
    ax.set_xticklabels(tick_labels, fontsize=12)

    # Vertical momentum lines as thick black lines
    for xx in tick_x:
        ax.axvline(xx, color="#73605B", linestyle="-", linewidth=2.5)

    # Draw clearly distinguishable Fermi level
    if fermi_energy is not None:
        line_opts = {'color': 'darkgreen', 'linestyle': '-', 'linewidth': 2}
        if fermi_line_kwargs:
            line_opts.update(fermi_line_kwargs)
        ax.axhline(fermi_energy - zero, **line_opts, label='Fermi level')

    # Identify VBM and CBM points
        all_bands = [y_spin_up] if y_spin_down is None else [y_spin_up, y_spin_down]
        vbm_energy, cbm_energy, vbm_kx, cbm_kx = -np.inf, np.inf, None, None

        for bands in all_bands:
            vbm_mask = bands <= fermi_energy
            cbm_mask = bands > fermi_energy

            if np.any(vbm_mask):
                vbm_local = bands[vbm_mask].max()
                if vbm_local > vbm_energy:
                    vbm_energy = vbm_local
                    vbm_kx = x[np.where(bands == vbm_local)[0][0]]

            if np.any(cbm_mask):
                cbm_local = bands[cbm_mask].min()
                if cbm_local < cbm_energy:
                    cbm_energy = cbm_local
                    cbm_kx = x[np.where(bands == cbm_local)[0][0]]

        # Plot VBM and CBM clearly
        ax.plot(vbm_kx, vbm_energy - zero, color="#1E2761", marker='o', markersize=8, label="VBM")
        ax.plot(cbm_kx, cbm_energy - zero, color="#7A2048",marker='o',  markersize=8, label="CBM")

        # Annotate the band gap
        band_gap = cbm_energy - vbm_energy
        # if band_gap > 0:
        #     ax.annotate(
        #         f"Gap = {band_gap:.2f} eV",
        #         xy=(0.05, 0.95),
        #         xycoords="axes fraction",
        #         fontsize=12,
        #         color="black",
        #         bbox=dict(boxstyle="round,pad=0.4", fc="white", ec="gray", alpha=0.9)
        #     )


    # plt.tight_layout()
    # plt.show()

    return ax


def plot_band(job):
    x, y_up, y_down, labels, fermi = job.results.get_band_structure(unit="eV")
    print(f"Fermi energy: {fermi} eV")
    ax = my_plot_band_structure(
    x, y_up, y_down,
    labels=labels,
    fermi_energy=fermi,
    zero=fermi,  # or 'fermi' if you want to align to 0
    fermi_line_kwargs={'color': '#408EC6', 'linewidth': 2.5, 'linestyle': '--'}
    )
    ax.set_ylim(-5, 5)
    ax.set_ylabel("Energy (eV)", fontsize=16)
    ax.set_xlabel("k-path", fontsize=16)

    ax.legend(loc="upper right", fontsize=11)
    plt.tight_layout()
    plt.show()


def write_json(filename, data):
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)

HaToEv = 27.2113845249047
path_to_band = "/Volumes/scratch/hpc-prf-pfmof/Battery_Result_folder/Redox/MOFs_bands/Ca_cluster_4/ams.results/band.rkf"
job = AMSJob.load_external(path_to_band)

plot_band(job)
# rkf = KFFile(path_to_band)
# femi = rkf.read_section('BandStructure').get('FermiEnergy')*HaToEv
# print(femi)

# dos = rkf.read_section('DOS')
# write_json('dos.json', dos)

# 'BandStructure', 'DOS', 'band_curves', 'EffectiveMass', 'ElectrostaticEmbeddingType'
# print(inspect.signature(job.results.get_rkf_skeleton).parameters.items())

# ax = plot_band_structure(*job.results.get_band_structure(unit="eV"),
#                          fermi_energy=femi,
#                          zero=None,
#                          fermi_line_kwargs={'linestyle': '-', 'linewidth': 2, 'color': 'black'}
#                          )
# ax.set_ylim(-5, 5)
# ax.set_ylabel("$E(eV)")
# ax.set_xlabel("Path")
# plt.show()
# print(job.results.get_band_structure())
# ax = plot_band_structure(*job.results.get_band_structure(unit="eV"), zero="vbmax")