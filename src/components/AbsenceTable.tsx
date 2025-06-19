
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { mockCurrentAbsences, leaveTypeLabels } from '@/utils/mockData';

export function AbsenceTable() {
  const getTypeColor = (type: string) => {
    const colors = {
      annual: 'bg-blue-100 text-blue-800 border-blue-300',
      sick: 'bg-red-100 text-red-800 border-red-300',
      personal: 'bg-green-100 text-green-800 border-green-300',
      maternity: 'bg-purple-100 text-purple-800 border-purple-300',
      emergency: 'bg-orange-100 text-orange-800 border-orange-300',
      unpaid: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[type as keyof typeof colors] || colors.annual;
  };

  const isReturningToday = (endDate: Date) => {
    const today = new Date();
    return endDate.toDateString() === today.toDateString();
  };

  const isReturningTomorrow = (endDate: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return endDate.toDateString() === tomorrow.toDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Absences actuelles</h1>
        <div className="text-sm text-gray-500">
          {mockCurrentAbsences.length} personne(s) actuellement absente(s)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Résumé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Total absences</span>
              <span className="text-xl font-bold text-blue-600">{mockCurrentAbsences.length}</span>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-600">Retours prévus</h4>
              {mockCurrentAbsences
                .filter(absence => isReturningToday(absence.endDate) || isReturningTomorrow(absence.endDate))
                .map(absence => (
                  <div key={absence.id} className="flex items-center justify-between text-sm">
                    <span>{absence.employee.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      isReturningToday(absence.endDate) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isReturningToday(absence.endDate) ? "Aujourd'hui" : 'Demain'}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Absence Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personnel en congé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-medium text-gray-600">Employé</th>
                    <th className="text-left p-3 font-medium text-gray-600">Service</th>
                    <th className="text-left p-3 font-medium text-gray-600">Type</th>
                    <th className="text-left p-3 font-medium text-gray-600">Période</th>
                    <th className="text-left p-3 font-medium text-gray-600">Retour</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCurrentAbsences.map((absence) => (
                    <tr key={absence.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{absence.employee.name}</p>
                          <p className="text-sm text-gray-500">{absence.employee.position}</p>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{absence.employee.department}</td>
                      <td className="p-3">
                        <Badge className={getTypeColor(absence.type)}>
                          {leaveTypeLabels[absence.type as keyof typeof leaveTypeLabels]}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span>{absence.startDate.toLocaleDateString('fr-FR')}</span>
                          <ArrowRight size={14} className="text-gray-400" />
                          <span>{absence.endDate.toLocaleDateString('fr-FR')}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className={`text-sm font-medium ${
                            isReturningToday(absence.endDate) ? 'text-green-600' :
                            isReturningTomorrow(absence.endDate) ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {absence.daysRemaining === 0 ? "Aujourd'hui" :
                             absence.daysRemaining === 1 ? 'Demain' :
                             `Dans ${absence.daysRemaining} jours`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCurrentAbsences.map((absence) => (
          <Card key={absence.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">{absence.employee.name}</h3>
                  <p className="text-sm text-gray-500">{absence.employee.department}</p>
                </div>
                <Badge className={getTypeColor(absence.type)}>
                  {leaveTypeLabels[absence.type as keyof typeof leaveTypeLabels]}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Départ :</span>
                  <span className="font-medium">{absence.startDate.toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Retour :</span>
                  <span className="font-medium">{absence.endDate.toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Durée :</span>
                  <span className="font-medium">
                    {Math.ceil((absence.endDate.getTime() - absence.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} jours
                  </span>
                </div>
              </div>

              {(isReturningToday(absence.endDate) || isReturningTomorrow(absence.endDate)) && (
                <div className={`mt-3 p-2 rounded-lg text-center text-sm font-medium ${
                  isReturningToday(absence.endDate) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  Retour {isReturningToday(absence.endDate) ? "aujourd'hui" : 'demain'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
