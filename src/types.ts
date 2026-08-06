export type UserRole = 'admin' | 'student';

export interface AdminAuth {
  email: string;
  is2FAVerified: boolean;
  twoFactorCode?: string;
  twoFactorExpiry?: number;
}

export interface StudentPermissions {
  canViewFirings: boolean;
  canViewFinancials: boolean;
  canViewProjectStatus: boolean;
  canViewAttendance: boolean;
  canRegisterAbsenceInAdvance: boolean;
}

export interface MonthlyPlan {
  id: string;
  name: string;
  classesPerMonth: number;
  monthlyFee: number; // In R$
  dueDay: number; // Day of month (e.g., 5, 10, 15)
}

export interface PaymentRecord {
  id: string;
  month: string; // e.g., "Agosto/2026"
  date: string;
  amount: number;
  method: 'Pix' | 'Cartão' | 'Dinheiro' | 'Boleto';
  status: 'Pago' | 'Pendente' | 'Vencido';
  notes?: string;
}

export interface StudentDuesStatus {
  currentMonth: string;
  status: 'Pago' | 'Pendente' | 'Vencido';
  dueDate: string; // YYYY-MM-DD
  amount: number;
  paymentHistory: PaymentRecord[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  enrollmentDate: string; // YYYY-MM-DD
  preferredSchedule: string; // e.g., "Terças-feiras (14:00 - 17:00)"
  emergencyContact: string;
  experienceLevel: 'Iniciante' | 'Intermediário' | 'Avançado';
  monthlyPlan: MonthlyPlan;
  duesStatus: StudentDuesStatus;
  permissions: StudentPermissions;
  notes: string; // Internal studio notes (Admin only)
  avatarUrl?: string;
  status: 'Ativo' | 'Trancado' | 'Inativo';
  googleFormsOrigin?: boolean;
  password?: string;
}

export type ClassAttendanceStatus = 'Presença' | 'Desmarcado' | 'Perdida' | 'Agendada';

export interface ClassAttendance {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "14:00 - 17:00"
  status: ClassAttendanceStatus;
  notes?: string;
  monthCycle: string; // YYYY-MM
}

export type FiringType = 'Biscoito' | 'Esmalte' | 'Dupla (Biscoito + Esmalte)';
export type FiringStage = 
  | 'Modelagem' 
  | 'Secagem' 
  | '1ª Queima (Biscoito)' 
  | 'Esmaltação' 
  | '2ª Queima (Esmalte)' 
  | 'Concluído (Pronto p/ Retirar)';

export interface FiringItem {
  id: string;
  studentId: string;
  pieceName: string;
  category: 'Vaso' | 'Caneca/Xícara' | 'Prato/Tigela' | 'Escultura' | 'Utensílio' | 'Outro';
  type: FiringType;
  weightKg: number;
  dimensions?: string;
  unitCostPerKg: number; // R$ per kg
  totalCost: number; // R$
  paymentStatus: 'A Pagar' | 'Pago';
  paidAt?: string;
  firingDate?: string;
  stage: FiringStage;
  notes?: string;
  createdAt: string;
  photoUrl?: string;
}

export interface StudioAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  type: 'Aviso' | 'Evento' | 'Feriado' | 'Queima Agendada';
  important?: boolean;
}

export interface GoogleFormsImportPayload {
  timestamp?: string;
  name: string;
  email: string;
  phone: string;
  planName: string;
  preferredSchedule: string;
  experienceLevel: string;
  emergencyContact: string;
  notes?: string;
  password?: string;
}

export interface StudioRates {
  biscoitoRatePerKg: number; // default R$ 35
  esmalteRatePerKg: number; // default R$ 50
  studioName: string;
  studioEmail: string;
  studioAddress: string;
  studioPhone: string;
}
