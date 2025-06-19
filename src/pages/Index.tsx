
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { LeaveCalendar } from '@/components/LeaveCalendar';
import { RequestForm } from '@/components/RequestForm';
import { RequestsList } from '@/components/RequestsList';
import { AbsenceTable } from '@/components/AbsenceTable';
import { Notifications } from '@/components/Notifications';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <LeaveCalendar />;
      case 'requests':
        return <RequestsList />;
      case 'absences':
        return <AbsenceTable />;
      case 'notifications':
        return <Notifications />;
      case 'new-request':
        return <RequestForm />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Quick Actions Bar */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('new-request')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Nouvelle demande
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Voir le calendrier
                </button>
                <button
                  onClick={() => setActiveTab('absences')}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Absences actuelles
                </button>
              </div>
              <div className="text-sm text-gray-500">
                Bienvenue dans votre espace de gestion des congés
              </div>
            </div>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
