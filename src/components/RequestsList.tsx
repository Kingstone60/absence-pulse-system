
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Check, X, Eye } from 'lucide-react';
import { mockLeaveRequests, leaveTypeLabels, statusLabels, departmentOptions } from '@/utils/mockData';

export function RequestsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [requests, setRequests] = useState(mockLeaveRequests);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || 
                             departmentFilter === 'Tous les départements' ||
                             request.employee.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleApprove = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' as const, approvedBy: 'Manager' } : req
    ));
  };

  const handleReject = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' as const } : req
    ));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const calculateDuration = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des demandes</h1>
        <div className="text-sm text-gray-500">
          {filteredRequests.length} demande(s) trouvée(s)
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Rechercher par nom ou département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Refusé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par département" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de congés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-600">Employé</th>
                  <th className="text-left p-3 font-medium text-gray-600">Département</th>
                  <th className="text-left p-3 font-medium text-gray-600">Type</th>
                  <th className="text-left p-3 font-medium text-gray-600">Période</th>
                  <th className="text-left p-3 font-medium text-gray-600">Durée</th>
                  <th className="text-left p-3 font-medium text-gray-600">Statut</th>
                  <th className="text-left p-3 font-medium text-gray-600">Soumis le</th>
                  <th className="text-left p-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{request.employee.name}</p>
                        <p className="text-sm text-gray-500">{request.employee.position}</p>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{request.employee.department}</td>
                    <td className="p-3">
                      <span className="text-sm">
                        {leaveTypeLabels[request.type as keyof typeof leaveTypeLabels]}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <div>
                        <p>{request.startDate.toLocaleDateString('fr-FR')}</p>
                        <p className="text-gray-500">au {request.endDate.toLocaleDateString('fr-FR')}</p>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {calculateDuration(request.startDate, request.endDate)} jour(s)
                    </td>
                    <td className="p-3">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {request.submittedAt.toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <X size={14} />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye size={14} />
                        </Button>
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
  );
}
