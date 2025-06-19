
import { Employee, LeaveRequest, CurrentAbsence, Notification, LeaveBalance } from '../types/leave';

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sophie Martin',
    email: 'sophie.martin@entreprise.fr',
    department: 'Développement',
    position: 'Développeuse Senior'
  },
  {
    id: '2',
    name: 'Pierre Dubois',
    email: 'pierre.dubois@entreprise.fr',
    department: 'Marketing',
    position: 'Chef de Projet'
  },
  {
    id: '3',
    name: 'Marie Lefebvre',
    email: 'marie.lefebvre@entreprise.fr',
    department: 'RH',
    position: 'Responsable RH'
  },
  {
    id: '4',
    name: 'Jean Moreau',
    email: 'jean.moreau@entreprise.fr',
    department: 'Ventes',
    position: 'Commercial Senior'
  },
  {
    id: '5',
    name: 'Camille Bernard',
    email: 'camille.bernard@entreprise.fr',
    department: 'Développement',
    position: 'Développeuse Frontend'
  }
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: '1',
    employee: mockEmployees[0],
    type: 'annual',
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-07-26'),
    reason: 'Vacances d\'été en famille',
    status: 'pending',
    submittedAt: new Date('2024-06-20')
  },
  {
    id: '2',
    employeeId: '2',
    employee: mockEmployees[1],
    type: 'sick',
    startDate: new Date('2024-06-25'),
    endDate: new Date('2024-06-27'),
    reason: 'Grippe',
    status: 'approved',
    submittedAt: new Date('2024-06-24'),
    approvedBy: 'Marie Lefebvre'
  },
  {
    id: '3',
    employeeId: '4',
    employee: mockEmployees[3],
    type: 'personal',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-01'),
    reason: 'Rendez-vous médical',
    status: 'approved',
    submittedAt: new Date('2024-06-28'),
    approvedBy: 'Marie Lefebvre'
  }
];

export const mockCurrentAbsences: CurrentAbsence[] = [
  {
    id: '1',
    employee: mockEmployees[1],
    type: 'sick',
    startDate: new Date('2024-06-25'),
    endDate: new Date('2024-06-27'),
    daysRemaining: 1
  },
  {
    id: '2',
    employee: mockEmployees[4],
    type: 'annual',
    startDate: new Date('2024-06-24'),
    endDate: new Date('2024-06-28'),
    daysRemaining: 2
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'request',
    title: 'Nouvelle demande de congé',
    message: 'Sophie Martin a soumis une demande de congés annuels',
    timestamp: new Date('2024-06-20T09:30:00'),
    read: false,
    userId: 'manager'
  },
  {
    id: '2',
    type: 'approval',
    title: 'Demande approuvée',
    message: 'Votre demande de congé maladie a été approuvée',
    timestamp: new Date('2024-06-24T14:15:00'),
    read: true,
    userId: '2'
  }
];

export const mockLeaveBalance: LeaveBalance = {
  annual: 25,
  sick: 10,
  personal: 5,
  used: {
    annual: 8,
    sick: 2,
    personal: 1
  }
};

export const leaveTypeLabels = {
  annual: 'Congés annuels',
  sick: 'Congé maladie',
  maternity: 'Congé maternité',
  personal: 'Congé personnel',
  emergency: 'Congé d\'urgence',
  unpaid: 'Congé sans solde'
};

export const statusLabels = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
  cancelled: 'Annulé'
};

export const departmentOptions = [
  'Tous les départements',
  'Développement',
  'Marketing',
  'RH',
  'Ventes',
  'Finance',
  'Support'
];
