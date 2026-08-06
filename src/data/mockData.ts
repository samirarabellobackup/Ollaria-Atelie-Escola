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
    name: 'Mariana Silva Campos',
    email: 'mariana.silva@gmail.com',
    password: generateStudentPassword('Mariana Silva Campos'),
    phone: '(11) 99123-4567',
    cpf: '123.456.789-00',
    enrollmentDate: '2026-01-15',
    preferredSchedule: 'Terças-feiras (14:00 às 17:00)',
    emergencyContact: 'Carlos Silva (Esposo) - (11) 99123-0000',
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
        { id: 'pay-101', month: 'Julho/2026', date: '2026-07-08', amount: 380, method: 'Pix', status: 'Pago' },
        { id: 'pay-102', month: 'Agosto/2026', date: '2026-08-05', amount: 380, method: 'Pix', status: 'Pago' },
      ],
    },
    permissions: {
      canViewFirings: true,
      canViewFinancials: true,
      canViewProjectStatus: true,
      canViewAttendance: true,
      canRegisterAbsenceInAdvance: true,
    },
    notes: 'Iniciou com torno mecânico. Demonstra muito interesse em esmaltes rústicos e engobes.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'std-2',
    name: 'Lucas Eduardo Prado',
    email: 'lucas.prado@hotmai.com',
    password: generateStudentPassword('Lucas Eduardo Prado'),
    phone: '(11) 98234-5678',
    cpf: '234.567.890-11',
    enrollmentDate: '2026-03-01',
    preferredSchedule: 'Quintas-feiras (18:30 às 21:30)',
    emergencyContact: 'Beatriz Prado (Mãe) - (11) 98234-1111',
    experienceLevel: 'Intermediário',
    status: 'Ativo',
    googleFormsOrigin: true,
    monthlyPlan: DEFAULT_PLANS[1],
    duesStatus: {
      currentMonth: 'Agosto/2026',
      status: 'Pendente',
      dueDate: '2026-08-10',
      amount: 680,
      paymentHistory: [
        { id: 'pay-201', month: 'Julho/2026', date: '2026-07-10', amount: 680, method: 'Cartão', status: 'Pago' },
      ],
    },
    permissions: {
      canViewFirings: true,
      canViewFinancials: true,
      canViewProjectStatus: true,
      canViewAttendance: true,
      canRegisterAbsenceInAdvance: true,
    },
    notes: 'Trabalha com esculturas manuais de grande porte. Cuidado ao empilhar no forno.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'std-3',
    name: 'Camila Fernandes Ribeiro',
    email: 'camila.fernandes@outlook.com',
    password: generateStudentPassword('Camila Fernandes Ribeiro'),
    phone: '(11) 97345-6789',
    cpf: '345.678.901-22',
    enrollmentDate: '2026-05-10',
    preferredSchedule: 'Sábados (09:00 às 12:00)',
    emergencyContact: 'Patricia Ribeiro (Irmã) - (11) 97345-0000',
    experienceLevel: 'Iniciante',
    status: 'Ativo',
    googleFormsOrigin: true,
    monthlyPlan: DEFAULT_PLANS[0],
    duesStatus: {
      currentMonth: 'Agosto/2026',
      status: 'Vencido',
      dueDate: '2026-08-05',
      amount: 380,
      paymentHistory: [
        { id: 'pay-301', month: 'Julho/2026', date: '2026-07-04', amount: 380, method: 'Pix', status: 'Pago' },
      ],
    },
    permissions: {
      canViewFirings: true,
      canViewFinancials: true,
      canViewProjectStatus: true,
      canViewAttendance: true,
      canRegisterAbsenceInAdvance: false,
    },
    notes: 'Avisar por WhatsApp sobre a renovação mensal e taxa da 2ª queima.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
  },
  {
    id: 'std-4',
    name: 'Roberto Mendes de Oliveira',
    email: 'roberto.mendes@yahoo.com',
    password: generateStudentPassword('Roberto Mendes de Oliveira'),
    phone: '(11) 96456-7890',
    cpf: '456.789.012-33',
    enrollmentDate: '2026-06-20',
    preferredSchedule: 'Quartas-feiras (14:00 às 17:00)',
    emergencyContact: 'Renata Mendes (Esposa) - (11) 96456-1111',
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
        { id: 'pay-401', month: 'Julho/2026', date: '2026-07-03', amount: 920, method: 'Pix', status: 'Pago' },
        { id: 'pay-402', month: 'Agosto/2026', date: '2026-08-02', amount: 920, method: 'Pix', status: 'Pago' },
      ],
    },
    permissions: {
      canViewFirings: true,
      canViewFinancials: true,
      canViewProjectStatus: true,
      canViewAttendance: true,
      canRegisterAbsenceInAdvance: true,
    },
    notes: 'Utiliza técnica de placas e modelagem manual rústica. Usa argila tabaco e terracota.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  },
];

export const INITIAL_ATTENDANCE: ClassAttendance[] = [
  // Mariana (std-1) - 4 classes per month
  { id: 'att-1', studentId: 'std-1', date: '2026-08-04', time: '14:00 - 17:00', status: 'Presença', monthCycle: '2026-08', notes: 'Praticou centralização no torno' },
  { id: 'att-2', studentId: 'std-1', date: '2026-08-11', time: '14:00 - 17:00', status: 'Agendada', monthCycle: '2026-08' },
  { id: 'att-3', studentId: 'std-1', date: '2026-08-18', time: '14:00 - 17:00', status: 'Agendada', monthCycle: '2026-08' },
  { id: 'att-4', studentId: 'std-1', date: '2026-08-25', time: '14:00 - 17:00', status: 'Agendada', monthCycle: '2026-08' },

  // Lucas (std-2) - 8 classes per month
  { id: 'att-5', studentId: 'std-2', date: '2026-08-01', time: '18:30 - 21:30', status: 'Presença', monthCycle: '2026-08', notes: 'Avanço na escultura rústica' },
  { id: 'att-6', studentId: 'std-2', date: '2026-08-03', time: '18:30 - 21:30', status: 'Desmarcado', monthCycle: '2026-08', notes: 'Avisou com 48h de antecedência' },
  { id: 'att-7', studentId: 'std-2', date: '2026-08-06', time: '18:30 - 21:30', status: 'Presença', monthCycle: '2026-08' },
  { id: 'att-8', studentId: 'std-2', date: '2026-08-10', time: '18:30 - 21:30', status: 'Agendada', monthCycle: '2026-08' },

  // Camila (std-3) - 4 classes per month
  { id: 'att-9', studentId: 'std-3', date: '2026-08-02', time: '09:00 - 12:00', status: 'Perdida', monthCycle: '2026-08', notes: 'Não compareceu e não avisou em tempo hábil' },
  { id: 'att-10', studentId: 'std-3', date: '2026-08-09', time: '09:00 - 12:00', status: 'Agendada', monthCycle: '2026-08' },
  { id: 'att-11', studentId: 'std-3', date: '2026-08-16', time: '09:00 - 12:00', status: 'Agendada', monthCycle: '2026-08' },
  { id: 'att-12', studentId: 'std-3', date: '2026-08-23', time: '09:00 - 12:00', status: 'Agendada', monthCycle: '2026-08' },

  // Roberto (std-4) - 12 classes
  { id: 'att-13', studentId: 'std-4', date: '2026-08-01', time: '14:00 - 17:00', status: 'Presença', monthCycle: '2026-08' },
  { id: 'att-14', studentId: 'std-4', date: '2026-08-05', time: '14:00 - 17:00', status: 'Presença', monthCycle: '2026-08' },
  { id: 'att-15', studentId: 'std-4', date: '2026-08-08', time: '14:00 - 17:00', status: 'Agendada', monthCycle: '2026-08' },
];

export const INITIAL_FIRINGS: FiringItem[] = [
  {
    id: 'fir-1',
    studentId: 'std-1',
    pieceName: 'Vaso Orgânico Terracota',
    category: 'Vaso',
    type: 'Dupla (Biscoito + Esmalte)',
    weightKg: 0.65,
    dimensions: '14 x 18 cm',
    unitCostPerKg: 50.0,
    totalCost: 32.50,
    paymentStatus: 'A Pagar',
    stage: '1ª Queima (Biscoito)',
    createdAt: '2026-08-01',
    notes: 'Aguardando lote de alta temperatura (1220°C).',
    photoUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'fir-2',
    studentId: 'std-1',
    pieceName: 'Conjunto de 2 Xícaras de Café',
    category: 'Caneca/Xícara',
    type: 'Biscoito',
    weightKg: 0.35,
    dimensions: '8 x 7 cm cada',
    unitCostPerKg: 35.0,
    totalCost: 12.25,
    paymentStatus: 'Pago',
    paidAt: '2026-08-04',
    stage: 'Esmaltação',
    createdAt: '2026-07-28',
    notes: 'Esmaltada em verde celadon por imersão.',
    photoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'fir-3',
    studentId: 'std-2',
    pieceName: 'Escultura Busto Abstrato',
    category: 'Escultura',
    type: 'Dupla (Biscoito + Esmalte)',
    weightKg: 1.85,
    dimensions: '22 x 30 cm',
    unitCostPerKg: 50.0,
    totalCost: 92.50,
    paymentStatus: 'A Pagar',
    stage: 'Secagem',
    createdAt: '2026-08-03',
    notes: 'Secando em prateleira inferior com plástico leve para evitar rachaduras.',
    photoUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'fir-4',
    studentId: 'std-3',
    pieceName: 'Prato Decorativo de Frutas',
    category: 'Prato/Tigela',
    type: 'Esmalte',
    weightKg: 0.90,
    dimensions: '26 cm diâmetro',
    unitCostPerKg: 50.0,
    totalCost: 45.00,
    paymentStatus: 'A Pagar',
    stage: '2ª Queima (Esmalte)',
    createdAt: '2026-07-25',
    firingDate: '2026-08-05',
    notes: 'Queima de alta temperatura em andamento.',
    photoUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'fir-5',
    studentId: 'std-4',
    pieceName: 'Jarra para Água Rústica',
    category: 'Utensílio',
    type: 'Dupla (Biscoito + Esmalte)',
    weightKg: 1.10,
    dimensions: '18 x 24 cm',
    unitCostPerKg: 50.0,
    totalCost: 55.00,
    paymentStatus: 'Pago',
    paidAt: '2026-08-02',
    stage: 'Concluído (Pronto p/ Retirar)',
    createdAt: '2026-07-15',
    firingDate: '2026-07-30',
    notes: 'Tudo OK, embalado com papel de seda na estante de retiradas.',
    photoUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400',
  }
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
