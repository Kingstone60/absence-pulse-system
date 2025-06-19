
export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  avatar?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee: Employee;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  submittedAt: Date;
  approvedBy?: string;
  comments?: string;
}

export interface CurrentAbsence {
  id: string;
  employee: Employee;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
}

export type LeaveType = 
  | 'annual'
  | 'sick'
  | 'maternity'
  | 'personal'
  | 'emergency'
  | 'unpaid';

export type LeaveStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface Notification {
  id: string;
  type: 'request' | 'approval' | 'rejection' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  userId: string;
}

export interface LeaveBalance {
  annual: number;
  sick: number;
  personal: number;
  used: {
    annual: number;
    sick: number;
    personal: number;
  };
}
