export type UserRole = 'admin' | 'student';

export type ServiceType = 
  | 'aluno_regular'
  | 'aluno_curso'
  | 'cliente_queima'
  | 'cliente_consultoria'
  | 'artista_coworking'
  | 'professor_visitante';

export interface ServiceTypeMeta {
  id: ServiceType;
  name: string;
  badgeColor: string;
  description: string;
}

export const SERVICE_TYPES: Record<ServiceType, ServiceTypeMeta> = {
  aluno_regular: {
    id: 'aluno_regular',
    name: 'Aluno Regular',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Aulas recorrentes com plano mensal',
  },
  aluno_curso: {
    id: 'aluno_curso',
    name: 'Aluno Curso',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    description: 'Cursos fechados com início, duração e término',
  },
  cliente_queima: {
    id: 'cliente_queima',
    name: 'Cliente Queima',
    badgeColor: 'bg-red-100 text-red-900 border-red-300',
    description: 'Uso avulso ou contínuo do forno do ateliê',
  },
  cliente_consultoria: {
    id: 'cliente_consultoria',
    name: 'Cliente Consultoria',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    description: 'Pacote de horas de consultoria técnica e artística',
  },
  artista_coworking: {
    id: 'artista_coworking',
    name: 'Artista Coworking',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Locação de espaço, bancada, torno e ateliê compartilhado',
  },
  professor_visitante: {
    id: 'professor_visitante',
    name: 'Professor Visitante',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Sublocação de espaço ou percentual sobre turmas',
  },
};

export type FiringJobStatus =
  | 'Aguardando recebimento'
  | 'Recebida'
  | 'Aguardando queima'
  | 'Agendada'
  | 'Em queima'
  | 'Queima concluída'
  | 'Aguardando retirada'
  | 'Retirada'
  | 'Cancelada';

export interface FiringJobItem {
  id: string;
  entryDate: string; // YYYY-MM-DD
  jobCode: string; // e.g., "Q-2026-08"
  firingType: string; // Biscoito, Esmalte Baixa (980°), Alta (1240°), etc.
  temperature: string; // e.g., "1220°C"
  pieceCount: number;
  deliveredPieces: number;
  status: FiringJobStatus;
  notes?: string;
  expectedDate?: string;
  completedDate?: string;
  totalCost: number;
  paymentStatus: 'Pago' | 'Pendente';
  paymentMethod?: 'Pix' | 'Cartão' | 'Dinheiro' | 'Boleto';
  paidAt?: string;
}

export interface ConsultingSession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  hours: number;
  status: 'Realizado' | 'Agendado' | 'Cancelado';
  topic: string;
  consultant: string;
  notes?: string;
}

export interface CoworkingBooking {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  hours: number;
  station: string; // e.g., "Torno 03", "Bancada Central"
  status: 'Solicitado' | 'Confirmado' | 'Realizado' | 'Cancelado';
  notes?: string;
}

export interface TeacherBooking {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "14:00 - 18:00"
  hours: number;
  description: string;
  status: 'Agendado' | 'Realizado' | 'Cancelado';
}

// Configs for individual services
export interface CourseServiceData {
  courseName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  cycle: 'Início' | 'Desenvolvimento' | 'Conclusão';
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  schedule: string; // e.g., "Quintas-feiras (19:00 - 22:00)"
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'Pago' | 'Pendente' | 'Parcial';
  notes?: string;
}

export interface FiringClientServiceData {
  jobs: FiringJobItem[];
  totalValue: number;
  paidValue: number;
  pendingValue: number;
  notes?: string;
}

export interface ConsultingServiceData {
  contractedHours: number;
  usedHours: number;
  scheduledHours: number;
  balanceHours: number; // contracted - used - scheduled
  hourlyRate: number;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  sessions: ConsultingSession[];
  notes?: string;
}

export interface CoworkingServiceData {
  contractedHours: number;
  usedHours: number;
  scheduledHours: number;
  balanceHours: number;
  contractedPeriod: string; // e.g., "Agosto/2026"
  hourlyRate: number;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  bookings: CoworkingBooking[];
  notes?: string;
}

export interface VisitingTeacherServiceData {
  agreementType: 'Sublocação' | 'Percentual sobre turma';
  // If Sublocação:
  contractedPeriod?: string;
  contractedHours?: number;
  usedHours?: number;
  remainingHours?: number;
  subleaseFee?: number;
  // If Percentual:
  className?: string;
  classPeriod?: string;
  studentCount?: number;
  classTotalRevenue?: number;
  agreedPercentage?: number; // e.g., 40%
  teacherDueAmount?: number; // classTotalRevenue * (agreedPercentage / 100)
  // Shared:
  paidAmount: number;
  pendingAmount: number;
  bookings: TeacherBooking[];
  notes?: string;
}

export interface UserServiceSubscription {
  type: ServiceType;
  isActive: boolean;
  enrolledAt: string;
  courseData?: CourseServiceData;
  firingData?: FiringClientServiceData;
  consultingData?: ConsultingServiceData;
  coworkingData?: CoworkingServiceData;
  teacherData?: VisitingTeacherServiceData;
}

// Materials Module
export interface MaterialRecord {
  id: string;
  userId: string;
  userName: string;
  serviceType: ServiceType;
  materialName: string;
  quantity: number;
  unit: string; // e.g., 'kg', 'g', 'unidade', 'litro'
  unitPrice: number;
  totalPrice: number; // quantity * unitPrice
  date: string; // YYYY-MM-DD
  compensationType: 'Cobrar' | 'Repor' | 'Incluído no serviço';
  paymentStatus?: 'Pendente' | 'Pago';
  paidAt?: string;
  notes?: string;
}

// Change Requests Module
export interface ProfileChangeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  field: 'name' | 'phone' | 'whatsapp' | 'address' | 'cpf' | 'emergencyContact' | 'email';
  fieldLabel: string;
  currentValue: string;
  requestedValue: string;
  requestedAt: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado';
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// Audit Log / History Module
export interface AuditLogEntry {
  id: string;
  userId?: string;
  userName?: string;
  serviceType?: ServiceType;
  category: 'Pagamento' | 'Queima' | 'Agendamento' | 'Horas' | 'Material' | 'Alteração Cadastral' | 'Serviço' | 'Aulas' | 'Geral';
  date: string; // YYYY-MM-DD HH:mm:ss
  author: string; // "Administração" or User Name
  previousValue?: string;
  newValue: string;
  notes?: string;
}

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
  whatsapp?: string;
  address?: string;
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
  services?: UserServiceSubscription[];
}

export type AppUser = Student;

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
