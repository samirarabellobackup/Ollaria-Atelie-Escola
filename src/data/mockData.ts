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

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_ATTENDANCE: ClassAttendance[] = [];

export const INITIAL_FIRINGS: FiringItem[] = [];

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
