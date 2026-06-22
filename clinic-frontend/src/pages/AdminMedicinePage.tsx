import React, { useState } from 'react';
import MedicineDashboard from '../components/admin/medicine/MedicineDashboard';
import MedicineInventory from '../components/admin/medicine/MedicineInventory';
import MedicineSuppliers from '../components/admin/medicine/MedicineSuppliers';
import MedicineImport from '../components/admin/medicine/MedicineImport';
import MedicineSell from '../components/admin/medicine/MedicineSell';
import MedicineReports from '../components/admin/medicine/MedicineReports';
import MedicineNotes from '../components/admin/medicine/MedicineNotes';

type ViewState = 'DASHBOARD' | 'INVENTORY' | 'SUPPLIERS' | 'IMPORT' | 'SELL' | 'REPORTS' | 'NOTES';

export default function AdminMedicinePage() {
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');

  // Hàm chuyển về Dashboard dùng chung cho các màn hình phụ
  const goBack = () => setActiveView('DASHBOARD');

  return (
    <div className="min-h-screen bg-gray-100/50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Render View động */}
        {activeView === 'DASHBOARD' && <MedicineDashboard onNavigate={setActiveView} />}
        {activeView === 'INVENTORY' && <MedicineInventory onBack={goBack} />}
        {activeView === 'SUPPLIERS' && <MedicineSuppliers onBack={goBack} />}
        {activeView === 'IMPORT'    && <MedicineImport onBack={goBack} />}
        {activeView === 'SELL'      && <MedicineSell onBack={goBack} />}
        {activeView === 'REPORTS'   && <MedicineReports onBack={goBack} />}
        {activeView === 'NOTES'     && <MedicineNotes onBack={goBack} />}

      </div>
    </div>
  );
}