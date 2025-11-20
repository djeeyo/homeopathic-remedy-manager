// src/components/RemedySelectionForm.tsx
import React, { useState, useMemo } from "react";
import type { Remedy, ClientSelections, Potency } from "../types";
import { POTENCIES } from "../types";
import {
  REMEDY_KEYNOTES,
  type RemedyKeynotes,
} from "../constants/remedyKeynotes";

interface RemedySelectionFormProps {
  remedies: Remedy[];
  patientName: string;
  setPatientName: (name: string) => void;
  selections: ClientSelections;
  setSelections: React.Dispatch<React.SetStateAction<ClientSelections>>;
  onGenerate: () => void;
}

// Helper to get keynotes safely
function getKeynotesFor(abbreviation: string): RemedyKeynotes | null {
  const key = abbreviation?.trim() || "";
  return (REMEDY_KEYNOTES as Record<string, RemedyKeynotes | undefined>)[key] || null;
}

export const RemedySelectionForm: React.FC<RemedySelectionFormProps> = ({
  remedies,
  patientName,
  setPatientName,
  selections,
  setSelections,
  onGenerate,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeAbbreviation, setActiveAbbreviation] = useState<string | null>(
    remedies[0]?.abbreviation ?? null
  );

  // Filter remedies by name or abbreviation
  const filteredRemedies = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return remedies;

    return remedies.filter((r) => {
      const name = r.name?.toLowerCase() ?? "";
      const abbr = r.abbreviation?.toLowerCase() ?? "";
      return name.includes(term) || abbr.includes(term);
    });
  }, [remedies, searchTerm]);

  // Currently highlighted remedy (for keynotes display)
  const activeRemedy = useMemo(() => {
    if (!activeAbbreviation) return filteredRemedies[0] ?? null;
    return (
      filteredRemedies.find(
        (r) => r.abbreviation.trim() === activeAbbreviation.trim()
      ) ?? filteredRemedies[0] ?? null
    );
  }, [filteredRemedies, activeAbbreviation]);

  // Keynotes for highlighted remedy
  const activeKeynotes: RemedyKeynotes | null = useMemo(() => {
    if (!activeRemedy) return null;
    return getKeynotesFor(activeRemedy.abbreviation);
  }, [activeRemedy]);

  // Count selected potencies
  const selectionCount = useMemo(() => {
    return Object.values(selections).reduce((total, potencies) => {
      return total + (potencies ? potencies.size : 0);
    }, 0);
  }, [selections]);

  const handleTogglePotency = (srNo: string, potency: Potency) => {
    setSelections((prev: ClientSelections) => {
      const existing = prev[srNo] ?? new Set<Potency>();
      const nextSet = new Set<Potency>(existing);

      if (nextSet.has(potency)) {
        nextSet.delete(potency);
      } else {
        nextSet.add(potency);
      }

      const next: ClientSelections = { ...prev };
      if (nextSet.size === 0) {
        delete next[srNo];
      } else {
        next[srNo] = nextSet;
      }
      return next;
    });
  };

  const handleRowClick = (remedy: Remedy) => {
    setActiveAbbreviation(remedy.abbreviation);
  };

  const handleGenerateClick = () => {
    if (!patientName.trim()) {
      alert("Please enter a patient name before generating a prescription.");
      return;
    }
    if (selectionCount === 0) {
      alert("Please select at least one remedy/potency.");
      return;
    }
    onGenerate();
  };

  return (
    <div className="space-y-4">
      {/* STICKY TOP: Patient + Search + Keynotes */}
      <div className="space-y-4 sticky top-0 z-20 bg-slate-900 pt-4 pb-2">
        {/* Client & Remedy Selection */}
        <section className="bg-slate-800 rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Client &amp; Remedy Selection
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Patient Name */}
            <div>
              <label
                htmlFor="patientName"
                className="block text-sm font-medium text-slate-200 mb-1"
              >
                Patient Name
              </label>
              <input
                id="patientName"
                type="text"
                className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Enter patient&apos;s full name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>

            {/* Search Remedies */}
            <div>
              <label
                htmlFor="remedySearch"
                className="block text-sm font-medium text-slate-200 mb-1"
              >
                Search Remedies
              </label>
              <input
                id="remedySearch"
                type="text"
                className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Filter by name or abbreviation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Remedy Keynotes */}
        <section className="bg-slate-800 rounded-lg shadow-sm p-4 max-h-64 overflow-y-auto">
          <h2 className="text-lg font-semibold text-slate-100 mb-2">
            Remedy Keynotes
          </h2>
          {activeRemedy ? (
            <>
              <h3 className="text-base font-semibold text-cyan-300 mb-1">
                {activeRemedy.name}{" "}
                <span className="text-xs text-slate-400">
                  ({activeRemedy.abbreviation})
                </span>
              </h3>
              {activeKeynotes ? (
                <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-100">
                  <div className="space-y-1">
                    <div>
                      <p className="font-semibold text-cyan-200">
                        Mental &amp; Emotional Themes
                      </p>
                      <p>{activeKeynotes.mentalEmotionalThemes}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-cyan-200">
                        General Themes
                      </p>
                      <p>{activeKeynotes.generalThemes}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-cyan-200">
                        Key Local Symptoms
                      </p>
                      <p>{activeKeynotes.keyLocalSymptoms}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <p className="font-semibold text-cyan-200">Worse from</p>
                      <p>{activeKeynotes.worseFrom}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-cyan-200">Better from</p>
                      <p>{activeKeynotes.betterFrom}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-cyan-200">
                        Sphere / Notes
                      </p>
                      <p>{activeKeynotes.notesSphere}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-300">
                  No keynotes found for this remedy in your RemedyKeynotesSheet.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-300">
              Click on a remedy in the list below to view keynotes.
            </p>
          )}
        </section>
      </div>

      {/* SCROLLING REMEDY LIST */}
      <section className="bg-slate-800 rounded-lg shadow-sm overflow-y-auto max-h-[calc(100vh-260px)]">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 sticky top-0 z-10">
            <tr className="text-left text-slate-300">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Abbreviation</th>
              {POTENCIES.map((pot) => (
                <th key={pot} className="px-4 py-2 text-center">
                  {pot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRemedies.map((remedy) => {
              const isActive =
                activeRemedy &&
                remedy.abbreviation.trim() ===
                  activeRemedy.abbreviation.trim();
              const selectedForRemedy = selections[remedy.srNo];

              return (
                <tr
                  key={remedy.srNo}
                  className={`border-t border-slate-700 cursor-pointer ${
                    isActive
                      ? "bg-slate-700/70 hover:bg-slate-700"
                      : "hover:bg-slate-700/40"
                  }`}
                  onClick={() => handleRowClick(remedy)}
                >
                  <td className="px-4 py-2 text-slate-100">
                    {remedy.name}
                  </td>
                  <td className="px-4 py-2 text-slate-200">
                    {remedy.abbreviation}
                  </td>
                  {POTENCIES.map((potency) => {
                    const isChecked = selectedForRemedy?.has(potency) ?? false;
                    return (
                      <td
                        key={potency}
                        className="px-4 py-2 text-center"
                        onClick={(e) => {
                          e.stopPropagation(); // don’t change active row when clicking checkbox
                          handleTogglePotency(remedy.srNo, potency);
                        }}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                          checked={isChecked}
                          onChange={() =>
                            handleTogglePotency(remedy.srNo, potency)
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* BOTTOM BAR */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm">
            {selectionCount}{" "}
            {selectionCount === 1 ? "remedy" : "remedies"} selected
          </span>
          <button
            type="button"
            onClick={handleGenerateClick}
            disabled={selectionCount === 0 || !patientName.trim()}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-500 hover:bg-cyan-400 text-slate-900"
          >
            Generate Prescription
          </button>
        </div>
      </div>
    </div>
  );
};
