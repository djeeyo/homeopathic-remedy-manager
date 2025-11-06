
import React, { useState, useMemo } from 'react';
import { RemedySelectionForm } from './components/RemedySelectionForm';
import { ClientPrescription } from './components/ClientPrescription';
import { masterRemedyList } from './constants/remedyData';
import type { ClientSelections, SelectedRemedy, Remedy } from './types';

enum AppView {
  Selection,
  Prescription,
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.Selection);
  const [patientName, setPatientName] = useState<string>('');
  const [selections, setSelections] = useState<ClientSelections>({});

  const handleGeneratePrescription = () => {
    if (patientName.trim() && Object.keys(selections).length > 0) {
      setView(AppView.Prescription);
    }
  };

  const handleNewClient = () => {
    setPatientName('');
    setSelections({});
    setView(AppView.Selection);
  };

  const selectedRemedies: SelectedRemedy[] = useMemo(() => {
    const allRemediesMap = new Map<string, Remedy>(masterRemedyList.map(r => [r.srNo, r]));
    // FIX: Use Object.keys to avoid type inference issues with Object.entries.
    return Object.keys(selections)
      .map((srNo) => {
        const remedyDetails = allRemediesMap.get(srNo);
        if (remedyDetails) {
          const potencies = selections[srNo];
          return {
            ...remedyDetails,
            potencies: Array.from(potencies),
          };
        }
        return null;
      })
      .filter((r): r is SelectedRemedy => r !== null)
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [selections]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 shadow-lg text-center">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
          Homeopathic Remedy Manager
        </h1>
      </header>
      <main className="p-4 md:p-8">
        {view === AppView.Selection ? (
          <RemedySelectionForm
            remedies={masterRemedyList}
            patientName={patientName}
            setPatientName={setPatientName}
            selections={selections}
            setSelections={setSelections}
            onGenerate={handleGeneratePrescription}
          />
        ) : (
          <ClientPrescription
            patientName={patientName}
            selectedRemedies={selectedRemedies}
            onBack={handleNewClient}
          />
        )}
      </main>
       <footer className="text-center p-4 text-slate-500 text-sm">
        <p>Built for practitioners with care. © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
