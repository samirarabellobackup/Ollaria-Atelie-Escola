import { Student, ClassAttendance, FiringItem, StudioAnnouncement, StudioRates, MonthlyPlan } from '../types';

export function generateStudentPassword(fullName: string): string {
  if (!fullName) return 'aluno2026';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'aluno2026';
  
  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
  
  const cleanFirst = firstName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanLast = lastName ? lastName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : '';
  
  return `${cleanFirst}${cleanLast}2026`;
}

export const DEFAULT_PLANS: MonthlyPlan[] = [
  {
    id: 'plan-4',
    name: 'Plano Regular (4 Aulas / mês)',
    classesPerMonth: 4,
    monthlyFee: 380,
    dueDay: 10,
  },
  {
    id: 'plan-8',
    name: 'Plano Intensivo (8 Aulas / mês)',
    classesPerMonth: 8,
    monthlyFee: 680,
    dueDay: 10,
  },
  {
    id: 'plan-12',
    name: 'Plano Livre (12 Aulas / mês)',
    classesPerMonth: 12,
    monthlyFee: 920,
    dueDay: 5,
  }
];

export const INITIAL_RATES: StudioRates = {
  biscoitoRatePerKg: 35.0,
  esmalteRatePerKg: 50.0,
  studioName: 'Ollaria Ateliê de Cerâmica',
  studioEmail: 'ollariaatelie@gmail.com',
  studioAddress: 'Rua das Cerâmicas, 240 - Ateliê Central',
  studioPhone: '(11) 98765-4321',
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'Sofia Martins Vasconcelos',
    email: 'sofia.martins@gmail.com',
    password: generateStudentPassword('Sofia Martins Vasconcelos'),
    phone: '(11) 98877-6655',
    cpf: '567.890.123-44',
    enrollmentDate: '2026-07-01',
    preferredSchedule: 'Terças-feiras (14:00 às 17:00)',
    emergencyContact: 'Marcelo Vasconcelos (Pai) - (11) 98877-0000',
    experienceLevel: 'Iniciante',
    status: 'Ativo',
    googleFormsOrigin: true,
    monthlyPlan: DEFAULT_PLANS[0],
    duesStatus: {
      currentMonth: 'Agosto/2026',
      status: 'Pago',
      dueDate: '2026-08-10',
      amount: 380,
      paymentHistory: [
        { id: 'pay-101', month: 'Agosto/2026', date: '2026-08-04', amount: 380, method: 'Pix', status: 'Pago' },
      ],
    },
    permissions: {
      canViewFirings: true,
      canViewFinancials: true,
      canViewProjectStatus: true,
      canViewAttendance: true,
      canRegisterAbsenceInAdvance: true,
    },
    notes: 'Inscrita via Formulário de Matrícula do Google Forms. Foco em cerâmica utilitária.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'std-2',
    name: 'Beatriz Lima Prado',
    email: 'beatriz.lima@gmail.com',
    password: generateStudentPassword('Beatriz Lima Prado'),
    phone: '(11) 97766-5544',
    cpf: '678.901.234-55',
    enrollmentDate: '2026-07-12',
    preferredSchedule: 'Quintas-feiras (18:30 às 21:30)',
    emergencyContact: 'Fernando Prado (Irmão) - (11) 97766-0000',
    experienceLevel: 'Intermediário',
    status: 'Ativo',
    googleFormsOrigin: true,
    monthlyPlan: DEFAULT_PLANS[1],
    duesStatus: {
      currentMonth: 'Agosto/2026',
      status: 'Pendente',
      dueDate: '2026-08-10',
      amount: 680,
      paymentHistory: [],
    },
    permissions: {
      canViewFirings: true,
      canViewFinancials: true,
      canViewProjectStatus: true,
      canViewAttendance: true,
      canRegisterAbsenceInAdvance: true,
    },
    notes: 'Sincronizada da Planilha do Google Forms. Foco em esmaltação e torneamento.',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'std-3',
    name: 'Gabriel de Souza Castro',
    email: 'gabriel.castro@gmail.com',
    password: generateStudentPassword('Gabriel de Souza Castro'),
    phone: '(11) 96655-4433',
    cpf: '789.012.345-66',
    enrollmentDate: '2026-07-20',
    preferredSchedule: 'Sábados (09:00 às 12:00)',
    emergencyContact: 'Juliana Castro (Mãe) - (11) 96655-0000',
    experienceLevel: 'Avançado',
    status: 'Ativo',
    googleFormsOrigin: true,
    monthlyPlan: DEFAULT_PLANS[2],
    duesStatus: {
      currentMonth: 'Agosto/2026',
      status: 'Pago',
      dueDate: '2026-08-05',
      amount: 920,
      paymentHistory: [
        { id: 'pay-301', month: 'Agosto/2026', date: '2026-08-01', amount: 920, method: 'Pix', status: 'Pago' },
      ],
    },
    permissions: {
      canViewFirings: true,
      canViewFinancials: true,
      canViewProjectStatus: true,
      canViewAttendance: true,
      canRegisterAbsenceInAdvance: true,
    },
    notes: 'Matrícula efetuada via formulário. Faz esculturas em grês e raku.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
  },
];

export const INITIAL_ATTENDANCE: ClassAttendance[] = [
  // Sofia (std-1)
  { id: 'att-1', studentId: 'std-1', date: '2026-08-04', time: '14:00 - 17:00', status: 'Presença', monthCycle: '2026-08', notes: 'Praticou modelagem de canecas utilitárias' },
  { id: 'att-2', studentId: 'std-1', date: '2026-08-11', time: '14:00 - 17:00', status: 'Agendada', monthCycle: '2026-08' },
  { id: 'att-3', studentId: 'std-1', date: '2026-08-18', time: '14:00 - 17:00', status: 'Agendada', monthCycle: '2026-08' },
  { id: 'att-4', studentId: 'std-1', date: '2026-08-25', time: '14:00 - 17:00', status: 'Agendada', monthCycle: '2026-08' },

  // Beatriz (std-2)
  { id: 'att-5', studentId: 'std-2', date: '2026-08-01', time: '18:30 - 21:30', status: 'Presença', monthCycle: '2026-08', notes: 'Esmaltação de tigelas em alta temperatura' },
  { id: 'att-6', studentId: 'std-2', date: '2026-08-06', time: '18:30 - 21:30', status: 'Presença', monthCycle: '2026-08' },
  { id: 'att-7', studentId: 'std-2', date: '2026-08-13', time: '18:30 - 21:30', status: 'Agendada', monthCycle: '2026-08' },
  { id: 'att-8', studentId: 'std-2', date: '2026-08-20', time: '18:30 - 21:30', status: 'Agendada', monthCycle: '2026-08' },

  // Gabriel (std-3)
  { id: 'att-9', studentId: 'std-3', date: '2026-08-01', time: '09:00 - 12:00', status: 'Presença', monthCycle: '2026-08', notes: 'Escultura de vaso rústico' },
  { id: 'att-10', studentId: 'std-3', date: '2026-08-08', time: '09:00 - 12:00', status: 'Agendada', monthCycle: '2026-08' },
  { id: 'att-11', studentId: 'std-3', date: '2026-08-15', time: '09:00 - 12:00', status: 'Agendada', monthCycle: '2026-08' },
  { id: 'att-12', studentId: 'std-3', date: '2026-08-22', time: '09:00 - 12:00', status: 'Agendada', monthCycle: '2026-08' },
];

export const INITIAL_FIRINGS: FiringItem[] = [
  {
    id: 'fir-1',
    studentId: 'std-1',
    pieceName: 'Conjunto de 2 Xícaras Utilitárias',
    category: 'Caneca/Xícara',
    type: 'Dupla (Biscoito + Esmalte)',
    weightKg: 0.65,
    dimensions: '10 x 12 cm',
    unitCostPerKg: 50.0,
    totalCost: 32.50,
    paymentStatus: 'A Pagar',
    stage: '1ª Queima (Biscoito)',
    createdAt: '2026-08-01',
    notes: 'Aguardando lote de biscoito.',
    photoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'fir-2',
    studentId: 'std-2',
    pieceName: 'Tigela Oval Esmaltada Verde Celadon',
    category: 'Prato/Tigela',
    type: 'Esmalte',
    weightKg: 0.85,
    dimensions: '20 x 15 cm',
    unitCostPerKg: 50.0,
    totalCost: 42.50,
    paymentStatus: 'Pago',
    paidAt: '2026-08-04',
    stage: '2ª Queima (Esmalte)',
    createdAt: '2026-07-28',
    notes: 'Esmaltada por imersão.',
    photoUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'fir-3',
    studentId: 'std-3',
    pieceName: 'Escultura Busto Grês Raku',
    category: 'Escultura',
    type: 'Dupla (Biscoito + Esmalte)',
    weightKg: 1.85,
    dimensions: '22 x 30 cm',
    unitCostPerKg: 50.0,
    totalCost: 92.50,
    paymentStatus: 'A Pagar',
    stage: 'Secagem',
    createdAt: '2026-08-03',
    notes: 'Secando em prateleira para evitar rachaduras.',
    photoUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=400',
  },
];

export const INITIAL_ANNOUNCEMENTS: StudioAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Nova Queima de Biscoito Agendada',
    content: 'O forno de biscoito será carregado na próxima quinta-feira às 18h. Favor identificar todas as suas peças secas até quarta-feira ao meio-dia.',
    date: '2026-08-05',
    author: 'Ollaria Ateliê',
    type: 'Queima Agendada',
    important: true,
  },
  {
    id: 'ann-2',
    title: 'Workshop de Esmaltação e Sobreposição',
    content: 'Teremos um mini-workshop sobre preparação de esmaltes artesanais no dia 22 de Agosto. Vagas limitadas para alunos matriculados.',
    date: '2026-08-01',
    author: 'Ollaria Ateliê',
    type: 'Evento',
    important: false,
  },
  {
    id: 'ann-3',
    title: 'Lembrete: Atualização das Regras de Limpeza dos Tornos',
    content: 'Pedimos a todos os alunos que limpem a bacia do torno e as ferramentas ao término de cada aula. A colaboração mantém nosso espaço agradável para todos!',
    date: '2026-07-28',
    author: 'Equipe de Gestão',
    type: 'Aviso',
    important: false,
  }
];
