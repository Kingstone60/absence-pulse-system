
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import { mockLeaveRequests, mockCurrentAbsences, mockLeaveBalance } from '@/utils/mockData';

export function Dashboard() {
  const pendingRequests = mockLeaveRequests.filter(req => req.status === 'pending').length;
  const currentAbsences = mockCurrentAbsences.length;
  const totalUsedDays = mockLeaveBalance.used.annual + mockLeaveBalance.used.sick + mockLeaveBalance.used.personal;
  const totalAvailableDays = mockLeaveBalance.annual + mockLeaveBalance.sick + mockLeaveBalance.personal;

  const stats = [
    {
      title: 'Demandes en attente',
      value: pendingRequests,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Absences actuelles',
      value: currentAbsences,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Jours utilisés',
      value: totalUsedDays,
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Taux d\'utilisation',
      value: `${Math.round((totalUsedDays / totalAvailableDays) * 100)}%`,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Solde des congés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Congés annuels</span>
                <span>{mockLeaveBalance.used.annual}/{mockLeaveBalance.annual} jours</span>
              </div>
              <Progress 
                value={(mockLeaveBalance.used.annual / mockLeaveBalance.annual) * 100}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Congés maladie</span>
                <span>{mockLeaveBalance.used.sick}/{mockLeaveBalance.sick} jours</span>
              </div>
              <Progress 
                value={(mockLeaveBalance.used.sick / mockLeaveBalance.sick) * 100}
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Congés personnels</span>
                <span>{mockLeaveBalance.used.personal}/{mockLeaveBalance.personal} jours</span>
              </div>
              <Progress 
                value={(mockLeaveBalance.used.personal / mockLeaveBalance.personal) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demandes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockLeaveRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{request.employee.name}</p>
                    <p className="text-xs text-gray-500">
                      {request.startDate.toLocaleDateString('fr-FR')} - {request.endDate.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status === 'pending' ? 'En attente' :
                     request.status === 'approved' ? 'Approuvé' : 'Refusé'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
