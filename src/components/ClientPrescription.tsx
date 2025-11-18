
import React from 'react';
import type { SelectedRemedy } from '../types';

interface ClientPrescriptionProps {
  patientName: string;
  selectedRemedies: SelectedRemedy[];
  onNewClient: () => void;
  onEditSelection: () => void;
}

const PrintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Z" />
    </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const ExportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


export const ClientPrescription: React.FC<ClientPrescriptionProps> = ({
  patientName,
  selectedRemedies,
  onNewClient,
  onEditSelection,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Remedy Name', 'Abbreviation', 'Potencies'];
    const rows = selectedRemedies.map(remedy => [
      `"${remedy.name.replace(/"/g, '""')}"`, // Handle quotes in names
      `"${remedy.abbreviation.replace(/"/g, '""')}"`,
      `"${remedy.potencies.join(' | ')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if(link.download !== undefined) { // feature detection
        const url = URL.createObjectURL(blob);
        const safePatientName = patientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.setAttribute('href', url);
        link.setAttribute('download', `${safePatientName || 'prescription'}_remedies.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex justify-between items-center mb-6 print:hidden flex-wrap gap-4">
            <div className="flex items-center gap-2">
                 <button
                    onClick={onEditSelection}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900"
                >
                    <PencilIcon className="h-5 w-5"/>
                    Edit Selection
                </button>
                <button
                    onClick={onNewClient}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 border border-slate-600"
                >
                    <PlusIcon className="h-5 w-5"/>
                    New Client
                </button>
            </div>

            <div className="flex items-center gap-4">
                 <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900"
                >
                    <ExportIcon className="h-5 w-5"/>
                    Export CSV
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 shadow-lg shadow-cyan-900/20"
                >
                    <PrintIcon className="h-5 w-5"/>
                    Print Prescription
                </button>
            </div>
        </div>
      
        <div className="bg-white text-slate-800 p-8 md:p-12 rounded-lg shadow-2xl printable-area relative">
            <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Prescription</h1>
                    <p className="text-slate-500 mt-1">Homeopathic Care Center</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-500 font-medium">Date: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        
            <div className="mb-10 p-4 bg-slate-50 rounded-md print:bg-transparent print:p-0 print:mb-6 border border-transparent print:border-b-slate-200 print:rounded-none">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-1">Patient Name</span>
                <p className="text-2xl text-slate-900 font-medium">{patientName}</p>
            </div>
        
            <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-200 pb-2">Rx</h2>
                <div className="space-y-4" role="list">
                    {selectedRemedies.map((remedy) => (
                        <div key={remedy.srNo} className="break-inside-avoid py-3 border-b border-slate-100 last:border-0" role="listitem">
                            <div className="flex items-baseline justify-between">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {remedy.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-mono">
                                        {remedy.abbreviation}
                                    </p>
                                </div>
                                <div className="text-lg font-bold text-slate-900 text-right bg-slate-100 px-3 py-1 rounded print:bg-transparent print:p-0 print:border print:border-slate-300">
                                    {remedy.potencies.join(', ')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 print:block hidden">
                <p>This prescription was generated by the Homeopathic Remedy Manager.</p>
            </div>
        </div>
        <style>
          {`
            @media print {
                body {
                    background-color: white !important;
                }
                .printable-area {
                    box-shadow: none !important;
                    margin: 0;
                    max-width: 100%;
                    border-radius: 0;
                    padding: 0 !important;
                }
                /* Hide all UI elements except the printable area */
                body > *:not(#root), #root > *:not(main), main > *:not(.printable-area) {
                    display: none !important;
                }
                -webkit-print-color-adjust: exact;
            }
          `}
        </style>
    </div>
  );
};
