// src/components/ClientPrescription.tsx
import React, { useState } from "react";
import type { SelectedRemedy } from "../types";

interface ClientPrescriptionProps {
  patientName: string;
  selectedRemedies: SelectedRemedy[];
  onBack: () => void;
}

export const ClientPrescription: React.FC<ClientPrescriptionProps> = ({
  patientName,
  selectedRemedies,
  onBack,
}) => {
  const today = new Date();

  const formattedDate = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const [dosingInstructions, setDosingInstructions] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (selectedRemedies.length === 0) {
      alert("No remedies selected to export.");
      return;
    }

    const headers = ["Remedy", "Abbreviation", "Potencies"];

    const rows = selectedRemedies.map((r) => {
      const safeName = `"${r.name.replace(/"/g, '""')}"`;
      const safeAbbrev = `"${r.abbreviation.replace(/"/g, '""')}"`;
      const potencies = `"${(r.potencies || []).join("; ")}"`;
      return [safeName, safeAbbrev, potencies].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const safeDate = formattedDate.replace(/\//g, "-");
    link.download = `remedy-prescription-${safeDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-100">
          Remedy Prescription
        </h2>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 rounded-md text-sm font-medium border border-slate-600 text-slate-100 hover:bg-slate-800"
          >
            ← Back to selection
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-md text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-sm"
          >
            Export CSV
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 rounded-md text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-sm"
          >
            Print
          </button>
        </div>
      </div>

      {/* Prescription card (printable area) */}
      <section className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <div>
            <div className="text-sm text-slate-400">Date</div>
            <div className="text-sm font-medium text-slate-100">
              {formattedDate}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-400">Patient Name</div>
            <div className="text-sm font-semibold text-slate-100">
              {patientName || "—"}
            </div>
          </div>
        </div>

        {/* Dosing instructions input (used for Notes column) */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            Dosing Instructions / Notes
          </h3>
          <p className="text-xs text-slate-400 mb-2">
            Whatever you type here will appear under "Notes" for each remedy in
            the printout. Leave blank to use the default text.
          </p>
          <textarea
            value={dosingInstructions}
            onChange={(e) => setDosingInstructions(e.target.value)}
            placeholder="e.g. Take 1 pellet 30C under the tongue once daily for 5 days, then pause and reassess..."
            className="w-full min-h-[96px] rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-t border-slate-800">
            <thead>
              <tr className="bg-slate-800/80 text-slate-100">
                <th className="text-left px-3 py-2 font-semibold">Remedy</th>
                <th className="text-left px-3 py-2 font-semibold">
                  Abbreviation
                </th>
                <th className="text-left px-3 py-2 font-semibold">
                  Potencies
                </th>
                <th className="text-left px-3 py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {selectedRemedies.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-slate-400"
                  >
                    No remedies selected.
                  </td>
                </tr>
              ) : (
                selectedRemedies.map((remedy) => (
                  <tr
                    key={remedy.srNo}
                    className="border-b border-slate-800 text-slate-100"
                  >
                    <td className="px-3 py-2">{remedy.name}</td>
                    <td className="px-3 py-2">{remedy.abbreviation}</td>
                    <td className="px-3 py-2">
                      {(remedy.potencies || []).join(", ")}
                    </td>
                    <td className="px-3 py-2 text-slate-400 whitespace-pre-line">
                      {dosingInstructions.trim()
                        ? dosingInstructions
                        : "Individual dosing instructions to be added by practitioner."}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-slate-500 text-center">
          This prescription is a working document for professional use and does
          not replace individualized clinical judgment.
        </p>

        <p className="mt-1 text-xs text-slate-500 text-center">
          Built for practitioners with care. © {new Date().getFullYear()}
        </p>
      </section>
    </div>
  );
};

export default ClientPrescription;

