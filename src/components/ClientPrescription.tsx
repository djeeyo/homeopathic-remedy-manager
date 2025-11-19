// src/components/ClientPrescription.tsx
import React from 'react';
import type { SelectedRemedy } from '../types';

export interface ClientPrescriptionProps {
  patientName: string;
  selectedRemedies: SelectedRemedy[];
  onBack: () => void;     // ✅ this is the key line
}

export const ClientPrescription: React.FC<ClientPrescriptionProps> = ({
  patientName,
  selectedRemedies,
  onBack,
}) => {
  const today = new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-gradient-to-r from-cyan-600/90 to-blue-700/90 shadow-lg">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            Homeopathic Remedy Manager
          </h1>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center px-3 py-1.5 text-sm rounded-md border border-slate-200/40 bg-slate-900/40 hover:bg-slate-800/80 transition"
          >
            ← Back to selection
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="bg-slate-900/70 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-slate-800 px-6 py-4 bg-slate-900/80">
            <h2 className="text-xl font-semibold text-slate-50">
              Remedy Prescription
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Date:{' '}
              <span className="font-medium text-slate-200">
                {today}
              </span>
            </p>
          </div>

          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Patient
            </p>
            <p className="text-base font-medium text-slate-100">
              {patientName || '—'}
            </p>
          </div>

          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Selected Remedies
            </p>

            {selectedRemedies.length === 0 ? (
              <p className="text-sm text-slate-400">
                No remedies selected.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-slate-300 border-b border-slate-800">
                      <th className="py-2 pr-4 text-left font-semibold">
                        Remedy
                      </th>
                      <th className="py-2 px-4 text-left font-semibold">
                        Abbreviation
                      </th>
                      <th className="py-2 px-4 text-left font-semibold">
                        Potencies
                      </th>
                      <th className="py-2 px-4 text-left font-semibold">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRemedies.map((remedy) => (
                      <tr
                        key={`${remedy.srNo}-${Array.from(
                          remedy.potencies,
                        ).join(',')}`}
                        className="border-b border-slate-800/80 last:border-0"
                      >
                        <td className="py-3 pr-4 align-top text-slate-100">
                          {remedy.name}
                        </td>
                        <td className="py-3 px-4 align-top text-slate-300">
                          {remedy.abbreviation}
                        </td>
                        <td className="py-3 px-4 align-top text-slate-200">
                          {Array.from(remedy.potencies).join(', ')}
                        </td>
                        <td className="py-3 px-4 align-top text-slate-400 text-xs italic">
                          Individual dosing instructions to be added by
                          practitioner.
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <p className="mt-8 text-[11px] text-center text-slate-500">
          This prescription is a working document for professional use
          and does not replace individualized clinical judgment.
        </p>
        <p className="mt-1 text-[11px] text-center text-slate-600">
          Built for practitioners with care. © {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
};
