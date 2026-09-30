import { 
  Student, 
  ServiceType, 
  UserServiceSubscription, 
  MaterialRecord, 
  AuditLogEntry, 
  SERVICE_TYPES 
} from '../types';

export function ensureUserServices(user: Student): UserServiceSubscription[] {
  if (user.services && user.services.length > 0) {
    return user.services;
  }
  // Default legacy/regular student service
  return [
    {
      type: 'aluno_regular',
      isActive: true,
      enrolledAt: user.enrollmentDate || new Date().toISOString().split('T')[0],
    },
  ];
}

export function getUserActiveServices(user: Student): ServiceType[] {
  const services = ensureUserServices(user);
  return services.filter((s) => s.isActive).map((s) => s.type);
}

export function createDefaultServiceSubscription(type: ServiceType, user: Student): UserServiceSubscription {
  const today = new Date().toISOString().split('T')[0];

  switch (type) {
    case 'aluno_regular':
      return {
        type: 'aluno_regular',
        isActive: true,
        enrolledAt: today,
      };

    case 'aluno_curso':
      return {
        type: 'aluno_curso',
        isActive: true,
        enrolledAt: today,
        courseData: {
          courseName: 'Curso de Torno & Modelagem Básica',
          startDate: today,
          endDate: '2026-10-31',
          cycle: 'Início',
          totalSessions: 8,
          completedSessions: 0,
          remainingSessions: 8,
          schedule: 'Quintas-feiras (19:00 - 22:00)',
          totalFee: 850,
          paidAmount: 0,
          pendingAmount: 850,
          paymentStatus: 'Pendente',
          notes: 'Módulo iniciante de cerâmica utilitária.',
        },
      };

    case 'cliente_queima':
      return {
        type: 'cliente_queima',
        isActive: true,
        enrolledAt: today,
        firingData: {
          jobs: [],
          totalValue: 0,
          paidValue: 0,
          pendingValue: 0,
          notes: 'Serviço de forneamento do ateliê.',
        },
      };

    case 'cliente_consultoria':
      return {
        type: 'cliente_consultoria',
        isActive: true,
        enrolledAt: today,
        consultingData: {
          contractedHours: 10,
          usedHours: 0,
          scheduledHours: 0,
          balanceHours: 10,
          hourlyRate: 150,
          totalFee: 1500,
          paidAmount: 0,
          pendingAmount: 1500,
          sessions: [],
          notes: 'Consultoria técnica de vidrados e queimas em alta temperatura.',
        },
      };

    case 'artista_coworking':
      return {
        type: 'artista_coworking',
        isActive: true,
        enrolledAt: today,
        coworkingData: {
          contractedHours: 20,
          usedHours: 0,
          scheduledHours: 0,
          balanceHours: 20,
          contractedPeriod: 'Agosto/2026',
          hourlyRate: 35,
          totalFee: 700,
          paidAmount: 0,
          pendingAmount: 700,
          bookings: [],
          notes: 'Acesso à bancada livre e torno elétrico.',
        },
      };

    case 'professor_visitante':
      return {
        type: 'professor_visitante',
        isActive: true,
        enrolledAt: today,
        teacherData: {
          agreementType: 'Sublocação',
          contractedPeriod: 'Agosto/2026',
          contractedHours: 12,
          usedHours: 0,
          remainingHours: 12,
          subleaseFee: 600,
          paidAmount: 0,
          pendingAmount: 600,
          bookings: [],
          notes: 'Sublocação para workshop ou turma aos sábados.',
        },
      };
  }
}

export interface UserFinancialBreakdown {
  serviceFee: number;
  materialsFee: number;
  otherFee: number;
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
}

export function calculateUserFinancials(
  user: Student,
  materials: MaterialRecord[] = []
): UserFinancialBreakdown {
  const services = ensureUserServices(user);
  let serviceFee = 0;
  let servicePaid = 0;

  // 1. Regular student monthly fee
  if (services.some((s) => s.type === 'aluno_regular' && s.isActive)) {
    const fee = user.monthlyPlan?.monthlyFee || 0;
    serviceFee += fee;
    if (user.duesStatus?.status === 'Pago') {
      servicePaid += fee;
    }
  }

  // 2. Course
  const courseService = services.find((s) => s.type === 'aluno_curso' && s.isActive);
  if (courseService?.courseData) {
    serviceFee += courseService.courseData.totalFee;
    servicePaid += courseService.courseData.paidAmount;
  }

  // 3. Firing client
  const firingService = services.find((s) => s.type === 'cliente_queima' && s.isActive);
  if (firingService?.firingData) {
    serviceFee += firingService.firingData.totalValue;
    servicePaid += firingService.firingData.paidValue;
  }

  // 4. Consulting
  const consultingService = services.find((s) => s.type === 'cliente_consultoria' && s.isActive);
  if (consultingService?.consultingData) {
    serviceFee += consultingService.consultingData.totalFee;
    servicePaid += consultingService.consultingData.paidAmount;
  }

  // 5. Coworking
  const coworkingService = services.find((s) => s.type === 'artista_coworking' && s.isActive);
  if (coworkingService?.coworkingData) {
    serviceFee += coworkingService.coworkingData.totalFee;
    servicePaid += coworkingService.coworkingData.paidAmount;
  }

  // 6. Teacher
  const teacherService = services.find((s) => s.type === 'professor_visitante' && s.isActive);
  if (teacherService?.teacherData) {
    const fee = teacherService.teacherData.agreementType === 'Sublocação'
      ? (teacherService.teacherData.subleaseFee || 0)
      : (teacherService.teacherData.teacherDueAmount || 0);
    serviceFee += fee;
    servicePaid += teacherService.teacherData.paidAmount;
  }

  // Materials for this user marked as 'Cobrar'
  const userMaterials = materials.filter(
    (m) => m.userId === user.id && m.compensationType === 'Cobrar'
  );
  const materialsFee = userMaterials.reduce((sum, m) => sum + m.totalPrice, 0);
  const materialsPaid = userMaterials
    .filter((m) => m.paymentStatus === 'Pago')
    .reduce((sum, m) => sum + m.totalPrice, 0);

  const totalFee = serviceFee + materialsFee;
  const paidAmount = servicePaid + materialsPaid;
  const pendingAmount = Math.max(0, totalFee - paidAmount);

  return {
    serviceFee,
    materialsFee,
    otherFee: 0,
    totalFee,
    paidAmount,
    pendingAmount,
  };
}

export function createAuditLog(
  author: string,
  category: AuditLogEntry['category'],
  newValue: string,
  options?: {
    userId?: string;
    userName?: string;
    serviceType?: ServiceType;
    previousValue?: string;
    notes?: string;
  }
): AuditLogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    author,
    category,
    newValue,
    userId: options?.userId,
    userName: options?.userName,
    serviceType: options?.serviceType,
    previousValue: options?.previousValue,
    notes: options?.notes,
  };
}
