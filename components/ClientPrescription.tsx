import React from 'react';
import type { SelectedRemedy } from '../types';

interface ClientPrescriptionProps {
  patientName: string;
  selectedRemedies: SelectedRemedy[];
  onBack: () => void;
}

const ClientPrescription: React.FC<ClientPrescriptionProps> = ({
  patientName,
  selectedRemedies,
  onBack,
}) => {
  const today = new Date().toLocaleDateString();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!selectedRemedies.length) return;

    const header = ['Remedy Name', 'Abbreviation', 'Potencies'];
    const rows = selectedRemedies.map((r) => [
      r.name,
      r.abbreviation,
      (r.potencies ?? []).join(' / '),
    ]);

    const csvContent = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const value = cell ?? '';
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      )
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remedy-prescription-${today.replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header bar is still coming from App.tsx – this component handles only the inner content */}
      <main className="px-4 py-8 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Top actions */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 rounded-md bg-slate-800 text-slate-100 text-sm font-medium hover:bg-slate-700 border border-slate-600 transition"
            >
              ← New Client Form
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center px-4 py-2 rounded-md bg-slate-800 text-slate-100 text-sm font-medium hover:bg-slate-700 border border-slate-600 transition"
              >
                ⬇️ Export CSV
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400 transition"
              >
                🖨️ Print
              </button>
            </div>
          </div>

          {/* Centered prescription card */}
          <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700 max-w-3xl mx-auto">
            <div className="px-6 py-5 border-b border-slate-700">
              <h1 className="text-2xl font-semibold text-slate-50">
                Remedy Prescription
              </h1>
              <p className="mt-1 text-sm text-slate-400">Date: {today}</p>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Patient info */}
              <section>
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">
                  Patient
                </h2>
                <p className="text-sm text-slate-200">
                  <span className="font-medium">Name:</span>{' '}
                  {patientName || '—'}
                </p>
              </section>

              {/* Selected remedies */}
              <section>
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
                  Selected Remedies
                </h2>

                {selectedRemedies.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No remedies selected for this prescription.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-700">
                    {selectedRemedies.map((remedy) => (
                      <div
                        key={remedy.srNo ?? `${remedy.name}-${remedy.abbreviation}`}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-100 truncate">
                            {remedy.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {remedy.abbreviation}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm font-semibold text-slate-100">
                            {(remedy.potencies ?? []).join(' / ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="px-6 py-4 border-t border-slate-700 text-center">
              <p className="text-[11px] text-slate-500">
                This prescription is a working document for professional use and
                does not replace individualized clinical judgment.
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                Built for practitioners with care. © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPrescription;
