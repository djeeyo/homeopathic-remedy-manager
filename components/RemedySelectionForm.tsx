
import React, { useState, useMemo } from 'react';
import type { Remedy, Potency, ClientSelections } from '../types';
import { POTENCIES } from '../types';

interface RemedySelectionFormProps {
  remedies: Remedy[];
  patientName: string;
  setPatientName: (name: string) => void;
  selections: ClientSelections;
  setSelections: React.Dispatch<React.SetStateAction<ClientSelections>>;
  onGenerate: () => void;
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

export const RemedySelectionForm: React.FC<RemedySelectionFormProps> = ({
  remedies,
  patientName,
  setPatientName,
  selections,
  setSelections,
  onGenerate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectionChange = (srNo: string, potency: Potency) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      const currentPotencies = new Set(newSelections[srNo]);

      if (currentPotencies.has(potency)) {
        currentPotencies.delete(potency);
      } else {
        currentPotencies.add(potency);
      }

      if (currentPotencies.size === 0) {
        delete newSelections[srNo];
      } else {
        newSelections[srNo] = currentPotencies;
      }
      return newSelections;
    });
  };

  const filteredRemedies = useMemo(() => {
    if (!searchTerm) return remedies;
    const lowercasedFilter = searchTerm.toLowerCase();
    return remedies.filter(remedy =>
      remedy.name.toLowerCase().includes(lowercasedFilter) ||
      remedy.abbreviation.toLowerCase().includes(lowercasedFilter)
    );
  }, [remedies, searchTerm]);
  
  const selectionCount = Object.keys(selections).length;
  const isFormValid = patientName.trim() !== '' && selectionCount > 0;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-800/50 rounded-lg shadow-xl animate-fade-in">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">Client & Remedy Selection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="patientName" className="block text-sm font-medium text-slate-300 mb-1">
              Patient Name
            </label>
            <input
              id="patientName"
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient's full name"
              className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>
          <div className="relative">
            <label htmlFor="searchRemedy" className="block text-sm font-medium text-slate-300 mb-1">
              Search Remedies
            </label>
             <div className="relative">
                <input
                  id="searchRemedy"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by name or abbreviation..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 pl-10 pr-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"/>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg shadow-xl overflow-hidden animate-fade-in-delay">
        <div className="overflow-x-auto">
            <div className="h-[60vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Abbreviation</th>
                            <th scope="col" colSpan={3} className="px-6 py-3 text-center text-xs font-medium text-cyan-300 uppercase tracking-wider">Potency</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                        {filteredRemedies.map((remedy) => (
                        <tr key={remedy.srNo} className={`transition-colors ${selections[remedy.srNo] ? 'bg-cyan-900/30' : 'hover:bg-slate-700/50'}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-200">{remedy.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-400">{remedy.abbreviation}</div>
                            </td>
                            {POTENCIES.map(potency => (
                                <td key={potency} className="px-6 py-4 whitespace-nowrap text-center">
                                    <label className="flex items-center justify-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selections[remedy.srNo]?.has(potency) || false}
                                            onChange={() => handleSelectionChange(remedy.srNo, potency)}
                                            className="h-5 w-5 rounded bg-slate-700 border-slate-500 text-cyan-500 focus:ring-cyan-600 cursor-pointer"
                                        />
                                        <span className="text-sm text-slate-300">{potency}</span>
                                    </label>
                                </td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
      
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 flex items-center justify-center md:justify-end">
         <div className="flex items-center gap-4">
            <span className="text-slate-300">
                {selectionCount} {selectionCount === 1 ? 'remedy' : 'remedies'} selected
            </span>
            <button
              onClick={onGenerate}
              disabled={!isFormValid}
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-cyan-500/30"
            >
              Generate Prescription
            </button>
         </div>
      </div>
    </div>
  );
};
   