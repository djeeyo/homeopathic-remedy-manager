import React from 'react';
import type { SelectedRemedy } from '../types';

interface ClientPrescriptionProps {
  patientName: string;
  selectedRemedies: SelectedRemedy[];
  onBack: () => void;   // ✅ important
}

export const ClientPrescription: React.FC<ClientPrescriptionProps> = ({
  patientName,
  selectedRemedies,
  onBack,
}) => {
  const hasRemedies = selectedRemedies.length > 0;

  return (
    <div className="space-y-6">
      {/* Header / Back button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-cyan-300">
          Client Prescription
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium rounded-md border border-slate-600 text-slate-100 bg-slate-800 hover:bg-slate-700 transition"
        >
          ← Back to selection
        </button>
      </div>

      {/* Client info */}
      <div className="p-6 bg-slate-800/60 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Patient</h3>
        <p className="text-slate-200">
          <span className="font-medium">Name:&nbsp;</span>
          {patientName || '—'}
        </p>
      </div>

      {/* Prescription table */}
      <div className="bg-slate-800/60 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {hasRemedies ? (
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                    Remedy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                    Abbreviation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                    Potencies
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {selectedRemedies.map((remedy) => (
                  <tr key={remedy.srNo}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-100">
                        {remedy.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">
                        {remedy.abbreviation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-200">
                        {remedy.potencies.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-400 italic">
                        Individual dosing instructions to be added by
                        practitioner.
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-slate-300">
              No remedies selected. Use the selection screen to choose remedies
              and generate a prescription.
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center">
        This prescription is a working document for professional use and does
        not replace individualized clinical judgment.
      </p>
    </div>
  );
};
