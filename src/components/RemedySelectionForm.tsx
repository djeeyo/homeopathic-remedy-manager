import React, { useState, useMemo } from 'react';
import type { Remedy, ClientSelections, Potency } from '../types';
import { POTENCIES } from '../types';
import {
  REMEDY_KEYNOTES,
  type RemedyKeynotes,
} from '../constants/remedyKeynotes';

interface RemedySelectionFormProps {
  remedies: Remedy[];
  patientName: string;
  setPatientName: (name: string) => void;
  selections: ClientSelections;
  setSelections: (s: ClientSelections) => void; // <- simple setter, no callback
  onGenerate: () => void;
}

export const RemedySelectionForm: React.FC<RemedySelectionFormProps> = ({
  remedies,
  patientName,
  setPatientName,
  selections,
  setSelections,
  onGenerate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedRemedy, setFocusedRemedy] = useState<Remedy | null>(null);

  // --- filtering / sorting ---
  const sortedAndFilteredRemedies = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? remedies.filter((r) => {
          const name = r.name.toLowerCase();
          const abbr = r.abbreviation.toLowerCase();
          return name.includes(term) || abbr.includes(term);
        })
      : remedies;

    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [remedies, searchTerm]);

  // --- selections (no setState callback, TS-friendly) ---
  const handleTogglePotency = (
    srNo: string,
    potency: Potency,
    checked: boolean,
  ) => {
    // clone existing selections deeply (clone Sets)
    const next: ClientSelections = {};
    for (const [key, set] of Object.entries(selections)) {
      next[key] = new Set(set) as Set<Potency>;
    }

    const currentSet = next[srNo] ?? new Set<Potency>();

    if (checked) {
      currentSet.add(potency);
    } else {
      currentSet.delete(potency);
    }

    if (currentSet.size === 0) {
      delete next[srNo];
    } else {
      next[srNo] = currentSet;
    }

    setSelections(next);
  };

  const selectionCount = Object.keys(selections).length;

  // --- keynotes lookup (by abbreviation) ---
  const currentKeynotes: RemedyKeynotes | null = useMemo(() => {
    if (!focusedRemedy) return null;
    const abbr = focusedRemedy.abbreviation;
    return REMEDY_KEYNOTES[abbr] ?? null;
  }, [focusedRemedy]);

  const handleRowClick = (remedy: Remedy) => {
    setFocusedRemedy(remedy);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Please enter a patient name before generating a prescription.');
      return;
    }
    if (selectionCount === 0) {
      alert('Please select at least one remedy.');
      return;
    }
    onGenerate();
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {/* Client info + search */}
      <section className="bg-slate-800/80 rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Client &amp; Remedy Selection
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient's full name"
              className="w-full rounded-md bg-slate-900/80 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Search Remedies
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name or abbreviation..."
              className="w-full rounded-md bg-slate-900/80 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* Keynotes panel */}
      <section className="bg-slate-800/80 rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-2">
          Remedy Keynotes
        </h2>

        {focusedRemedy ? (
          <div className="space-y-3">
            <h3 className="text-base md:text-lg font-semibold text-cyan-300">
              {focusedRemedy.name}{' '}
              <span className="text-xs md:text-sm text-slate-400">
                ({focusedRemedy.abbreviation})
              </span>
            </h3>

            {currentKeynotes ? (
              <div className="space-y-2 text-sm text-slate-200">
                <div>
                  <p className="font-semibold text-cyan-200">
                    Mental &amp; Emotional Themes
                  </p>
                  <p>{currentKeynotes.mentalEmotionalThemes}</p>
                </div>
                <div>
                  <p className="font-semibold text-cyan-200">General Themes</p>
                  <p>{currentKeynotes.generalThemes}</p>
                </div>
                <div>
                  <p className="font-semibold text-cyan-200">
                    Key Local Symptoms
                  </p>
                  <p>{currentKeynotes.keyLocalSymptoms}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  <div>
                    <p className="font-semibold text-cyan-200">Worse from</p>
                    <p>{currentKeynotes.worseFrom}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-cyan-200">Better from</p>
                    <p>{currentKeynotes.betterFrom}</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-cyan-200">Sphere / Notes</p>
                  <p>{currentKeynotes.notesSphere}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300">
                No keynotes found for this remedy in your RemedyKeynotesSheet.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-300">
            Hover over or click on a remedy in the list below to view its
            keynotes here.
          </p>
        )}
      </section>

      {/* Remedy table */}
      <section className="bg-slate-800/80 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700 text-sm">
            <thead className="bg-slate-900/70">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Abbreviation
                </th>
                {POTENCIES.map((potency) => (
                  <th
                    key={potency}
                    className="px-4 py-3 text-center font-medium text-slate-300"
                  >
                    {potency}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sortedAndFilteredRemedies.map((remedy) => {
                const selectedSet = selections[remedy.srNo];

                return (
                  <tr
                    key={remedy.srNo}
                    className={`cursor-pointer transition-colors ${
                      focusedRemedy?.srNo === remedy.srNo
                        ? 'bg-slate-700/70'
                        : 'hover:bg-slate-800/80'
                    }`}
                    onClick={() => handleRowClick(remedy)}
                  >
                    <td className="px-4 py-3 text-slate-100">{remedy.name}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {remedy.abbreviation}
                    </td>
                    {POTENCIES.map((potency) => (
                      <td
                        key={potency}
                        className="px-4 py-3 text-center"
                        onClick={(e) => e.stopPropagation()} // let checkbox be clickable
                      >
                        <input
                          type="checkbox"
                          checked={selectedSet?.has(potency) ?? false}
                          onChange={(e) =>
                            handleTogglePotency(
                              remedy.srNo,
                              potency,
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom bar */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 flex items-center gap-4">
          <span className="text-sm text-slate-300">
            {selectionCount}{' '}
            {selectionCount === 1 ? 'remedy' : 'remedies'} selected
          </span>
          <button
            type="submit"
            className="ml-auto inline-flex items-center px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectionCount === 0 || !patientName.trim()}
          >
            Generate Prescription
          </button>
        </div>
      </section>
    </form>
  );
};
