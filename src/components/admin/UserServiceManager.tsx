import React, { useState } from 'react';
import { 
  Student, 
  ServiceType, 
  SERVICE_TYPES, 
  UserServiceSubscription, 
  CourseServiceData,
  FiringClientServiceData,
  FiringJobItem,
  FiringJobStatus,
  ConsultingServiceData,
  ConsultingSession,
  CoworkingServiceData,
  CoworkingBooking,
  VisitingTeacherServiceData,
  TeacherBooking
} from '../../types';
import { 
  ensureUserServices, 
  createDefaultServiceSubscription,
  createAuditLog
} from '../../data/serviceHelpers';
import { 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Clock, 
  Flame, 
  BookOpen, 
  Briefcase, 
  Sparkles, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface UserServiceManagerProps {
  student: Student;
  onUpdateStudent: (updated: Student) => void;
  onAddAuditLog?: (entry: any) => void;
}

const FIRING_JOB_STATUSES: FiringJobStatus[] = [
  'Aguardando recebimento',
  'Recebida',
  'Aguardando queima',
  'Agendada',
  'Em queima',
  'Queima concluída',
  'Aguardando retirada',
  'Retirada',
  'Cancelada'
];

export const UserServiceManager: React.FC<UserServiceManagerProps> = ({
  student,
  onUpdateStudent,
  onAddAuditLog,
}) => {
  const services = ensureUserServices(student);
  const [activeServiceTab, setActiveServiceTab] = useState<ServiceType>(
    services.find((s) => s.isActive)?.type || 'aluno_regular'
  );

  // New Firing Job state
  const [newJobCode, setNewJobCode] = useState(`Q-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [newJobType, setNewJobType] = useState('Esmalte Alta Temperatura (1220°C)');
  const [newJobTemp, setNewJobTemp] = useState('1220°C');
  const [newJobPieces, setNewJobPieces] = useState(5);
  const [newJobCost, setNewJobCost] = useState(120);

  // New Consulting Session state
  const [newConsultingDate, setNewConsultingDate] = useState(new Date().toISOString().split('T')[0]);
  const [newConsultingHours, setNewConsultingHours] = useState(2);
  const [newConsultingTopic, setNewConsultingTopic] = useState('Formulação de Vidrados');
  const [newConsultingNotes, setNewConsultingNotes] = useState('');

  // New Coworking Booking state
  const [newCoworkingDate, setNewCoworkingDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCoworkingTime, setNewCoworkingTime] = useState('14:00 - 18:00');
  const [newCoworkingHours, setNewCoworkingHours] = useState(4);
  const [newCoworkingStation, setNewCoworkingStation] = useState('Torno 02');

  // Toggle or add service
  const handleToggleService = (type: ServiceType) => {
    const existing = services.find((s) => s.type === type);
    let updatedServices: UserServiceSubscription[];

    if (existing) {
      // Toggle active status
      updatedServices = services.map((s) =>
        s.type === type ? { ...s, isActive: !s.isActive } : s
      );
    } else {
      // Add new service subscription
      const newSub = createDefaultServiceSubscription(type, student);
      updatedServices = [...services, newSub];
    }

    onUpdateStudent({
      ...student,
      services: updatedServices,
    });

    if (onAddAuditLog) {
      onAddAuditLog(
        createAuditLog(
          'Administração',
          'Serviço',
          `Serviço ${SERVICE_TYPES[type].name} ${existing?.isActive ? 'desativado' : 'ativado'} para ${student.name}`,
          { userId: student.id, userName: student.name, serviceType: type }
        )
      );
    }
  };

  // Update specific service data
  const updateServiceData = (type: ServiceType, updater: (sub: UserServiceSubscription) => UserServiceSubscription) => {
    const updatedServices = services.map((s) => (s.type === type ? updater(s) : s));
    onUpdateStudent({
      ...student,
      services: updatedServices,
    });
  };

  const activeSub = services.find((s) => s.type === activeServiceTab);

  return (
    <div className="space-y-6 text-xs text-stone-800">
      {/* Services Switchboard & Activation Bar */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-serif font-bold text-stone-900 text-sm">
              Serviços Contratados por {student.name}
            </h4>
            <p className="text-[11px] text-stone-500">
              Um único usuário pode possuir múltiplos serviços ativos simultaneamente. Ative ou desative conforme o contrato.
            </p>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">
            {services.filter((s) => s.isActive).length} de 6 serviços ativos
          </span>
        </div>

        {/* 6 Services Quick Toggle Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {(Object.keys(SERVICE_TYPES) as ServiceType[]).map((type) => {
            const meta = SERVICE_TYPES[type];
            const sub = services.find((s) => s.type === type);
            const isActive = sub?.isActive || false;

            return (
              <button
                type="button"
                key={type}
                onClick={() => {
                  handleToggleService(type);
                  setActiveServiceTab(type);
                }}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  isActive
                    ? `${meta.badgeColor} shadow-sm font-bold ring-1 ring-amber-600/30`
                    : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider truncate">
                    {meta.name}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-700' : 'bg-stone-300'}`} />
                </div>
                <span className="text-[9px] font-normal line-clamp-1">
                  {isActive ? 'Ativo na conta' : 'Clique p/ ativar'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs for Active Services */}
      <div className="flex border-b border-stone-200 bg-white px-2 pt-2 space-x-1 sm:space-x-2 overflow-x-auto rounded-t-xl">
        {services
          .filter((s) => s.isActive)
          .map((s) => {
            const meta = SERVICE_TYPES[s.type];
            return (
              <button
                key={s.type}
                type="button"
                onClick={() => setActiveServiceTab(s.type)}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 shrink-0 ${
                  activeServiceTab === s.type
                    ? 'border-amber-800 text-amber-950 font-extrabold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <span>{meta.name}</span>
              </button>
            );
          })}
      </div>

      {/* Active Service Manager Details */}
      {activeSub && activeSub.isActive ? (
        <div className="bg-white p-5 rounded-b-2xl border border-t-0 border-stone-200 shadow-sm space-y-6">
          
          {/* SERVICE 1: ALUNO REGULAR */}
          {activeServiceTab === 'aluno_regular' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-amber-50 p-4 rounded-xl border border-amber-200">
                <div>
                  <h5 className="font-bold text-amber-950 text-sm">Plano Regular de Aulas Recorrentes</h5>
                  <p className="text-xs text-amber-800">
                    Plano atual: <b>{student.monthlyPlan.name}</b> (R$ {student.monthlyPlan.monthlyFee},00 / mês)
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-900 bg-white px-3 py-1 rounded-lg border border-amber-300">
                  {student.monthlyPlan.classesPerMonth} aulas / mês
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Turma & Horário Recorrente</label>
                  <input
                    type="text"
                    value={student.preferredSchedule}
                    onChange={(e) => onUpdateStudent({ ...student, preferredSchedule: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Data de Matrícula</label>
                  <input
                    type="date"
                    value={student.enrollmentDate}
                    onChange={(e) => onUpdateStudent({ ...student, enrollmentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <p className="text-[11px] text-stone-500 italic">
                * O agendamento de chamadas diárias e histórico de presenças podem ser gerenciados na aba "Chamada & Presenças".
              </p>
            </div>
          )}

          {/* SERVICE 2: ALUNO CURSO */}
          {activeServiceTab === 'aluno_curso' && (
            <div className="space-y-5">
              {(() => {
                const cData: CourseServiceData = activeSub.courseData || {
                  courseName: 'Curso de Torno & Cerâmica',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: '2026-10-31',
                  cycle: 'Início',
                  totalSessions: 8,
                  completedSessions: 0,
                  remainingSessions: 8,
                  schedule: 'Quintas (19:00 - 22:00)',
                  totalFee: 850,
                  paidAmount: 0,
                  pendingAmount: 850,
                  paymentStatus: 'Pendente',
                };

                const updateCourse = (newFields: Partial<CourseServiceData>) => {
                  const updated = { ...cData, ...newFields };
                  // Recalculate remaining and pending
                  updated.remainingSessions = Math.max(0, updated.totalSessions - updated.completedSessions);
                  updated.pendingAmount = Math.max(0, updated.totalFee - updated.paidAmount);
                  updated.paymentStatus = updated.pendingAmount === 0 ? 'Pago' : updated.paidAmount > 0 ? 'Parcial' : 'Pendente';
                  updateServiceData('aluno_curso', (sub) => ({ ...sub, courseData: updated }));
                };

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <h5 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-orange-700" />
                          <span>Ciclo do Curso: Início → Desenvolvimento → Conclusão</span>
                        </h5>
                        <p className="text-xs text-stone-500">
                          Cursos têm início e término determinados. O histórico permanece disponível após o término.
                        </p>
                      </div>

                      {/* Cycle Selector */}
                      <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                        {(['Início', 'Desenvolvimento', 'Conclusão'] as const).map((cycle) => (
                          <button
                            type="button"
                            key={cycle}
                            onClick={() => updateCourse({ cycle })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              cData.cycle === cycle
                                ? 'bg-orange-800 text-white shadow-sm'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            {cycle}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Nome do Curso</label>
                        <input
                          type="text"
                          value={cData.courseName}
                          onChange={(e) => updateCourse({ courseName: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Data de Início</label>
                        <input
                          type="date"
                          value={cData.startDate}
                          onChange={(e) => updateCourse({ startDate: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Data de Término</label>
                        <input
                          type="date"
                          value={cData.endDate}
                          onChange={(e) => updateCourse({ endDate: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Total de Encontros</label>
                        <input
                          type="number"
                          min="1"
                          value={cData.totalSessions}
                          onChange={(e) => updateCourse({ totalSessions: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Encontros Realizados</label>
                        <input
                          type="number"
                          min="0"
                          max={cData.totalSessions}
                          value={cData.completedSessions}
                          onChange={(e) => updateCourse({ completedSessions: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-emerald-800"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Encontros Restantes</label>
                        <div className="px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl font-bold text-stone-800">
                          {cData.remainingSessions}
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Horário / Dias</label>
                        <input
                          type="text"
                          value={cData.schedule}
                          onChange={(e) => updateCourse({ schedule: e.target.value })}
                          placeholder="Ex: Seg e Qua 19h"
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Valor do Curso (R$)</label>
                        <input
                          type="number"
                          value={cData.totalFee}
                          onChange={(e) => updateCourse({ totalFee: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-bold font-serif"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Valor Pago (R$)</label>
                        <input
                          type="number"
                          value={cData.paidAmount}
                          onChange={(e) => updateCourse({ paidAmount: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-bold font-serif text-emerald-700"
                        />
                      </div>
                      <div>
                        <span className="block font-semibold text-stone-700 mb-1">Valor Pendente</span>
                        <div className="px-3 py-2 bg-white border border-stone-200 rounded-xl font-bold font-serif text-red-700">
                          R$ {cData.pendingAmount.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* SERVICE 3: CLIENTE QUEIMA */}
          {activeServiceTab === 'cliente_queima' && (
            <div className="space-y-5">
              {(() => {
                const fData: FiringClientServiceData = activeSub.firingData || {
                  jobs: [],
                  totalValue: 0,
                  paidValue: 0,
                  pendingValue: 0,
                };

                const handleAddJob = (e: React.FormEvent) => {
                  e.preventDefault();
                  const newJob: FiringJobItem = {
                    id: `job-${Date.now()}`,
                    entryDate: new Date().toISOString().split('T')[0],
                    jobCode: newJobCode,
                    firingType: newJobType,
                    temperature: newJobTemp,
                    pieceCount: Number(newJobPieces),
                    deliveredPieces: 0,
                    status: 'Recebida',
                    totalCost: Number(newJobCost),
                    paymentStatus: 'Pendente',
                  };

                  const updatedJobs = [newJob, ...fData.jobs];
                  const totalValue = updatedJobs.reduce((sum, j) => sum + j.totalCost, 0);
                  const paidValue = updatedJobs.filter((j) => j.paymentStatus === 'Pago').reduce((sum, j) => sum + j.totalCost, 0);
                  const pendingValue = totalValue - paidValue;

                  updateServiceData('cliente_queima', (sub) => ({
                    ...sub,
                    firingData: { jobs: updatedJobs, totalValue, paidValue, pendingValue },
                  }));

                  // Reset form fields
                  setNewJobCode(`Q-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
                };

                const handleToggleJobPaid = (jobId: string) => {
                  const updatedJobs = fData.jobs.map((j) =>
                    j.id === jobId
                      ? {
                          ...j,
                          paymentStatus: j.paymentStatus === 'Pago' ? ('Pendente' as const) : ('Pago' as const),
                          paidAt: j.paymentStatus === 'Pago' ? undefined : new Date().toISOString().split('T')[0],
                        }
                      : j
                  );
                  const totalValue = updatedJobs.reduce((sum, j) => sum + j.totalCost, 0);
                  const paidValue = updatedJobs.filter((j) => j.paymentStatus === 'Pago').reduce((sum, j) => sum + j.totalCost, 0);
                  const pendingValue = totalValue - paidValue;

                  updateServiceData('cliente_queima', (sub) => ({
                    ...sub,
                    firingData: { jobs: updatedJobs, totalValue, paidValue, pendingValue },
                  }));
                };

                const handleUpdateJobStatus = (jobId: string, status: FiringJobStatus) => {
                  const updatedJobs = fData.jobs.map((j) => (j.id === jobId ? { ...j, status } : j));
                  updateServiceData('cliente_queima', (sub) => ({
                    ...sub,
                    firingData: { ...fData, jobs: updatedJobs },
                  }));
                };

                const handleDeleteJob = (jobId: string) => {
                  const updatedJobs = fData.jobs.filter((j) => j.id !== jobId);
                  const totalValue = updatedJobs.reduce((sum, j) => sum + j.totalCost, 0);
                  const paidValue = updatedJobs.filter((j) => j.paymentStatus === 'Pago').reduce((sum, j) => sum + j.totalCost, 0);
                  const pendingValue = totalValue - paidValue;

                  updateServiceData('cliente_queima', (sub) => ({
                    ...sub,
                    firingData: { jobs: updatedJobs, totalValue, paidValue, pendingValue },
                  }));
                };

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <h5 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-red-700" />
                          <span>Lotes de Queima do Cliente</span>
                        </h5>
                        <p className="text-xs text-stone-500">
                          Controle de temperatura, quantidade de peças, status no forno e financeiro do serviço de queima.
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold font-serif text-stone-900">
                          Pendente: R$ {fData.pendingValue.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          Total: R$ {fData.totalValue.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    {/* Add Firing Job Form */}
                    <form onSubmit={handleAddJob} className="bg-red-50/60 p-4 rounded-xl border border-red-200 space-y-3">
                      <h6 className="font-bold text-red-950 uppercase text-[11px] flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Cadastrar Novo Lote de Queima para este Cliente</span>
                      </h6>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Identificação / Código</label>
                          <input
                            type="text"
                            required
                            value={newJobCode}
                            onChange={(e) => setNewJobCode(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Tipo de Queima</label>
                          <select
                            value={newJobType}
                            onChange={(e) => setNewJobType(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                          >
                            <option value="Biscoito Baixa (980°C)">Biscoito Baixa (980°C)</option>
                            <option value="Esmalte Baixa (980°C - 1050°C)">Esmalte Baixa (980°C - 1050°C)</option>
                            <option value="Esmalte Média (1180°C)">Esmalte Média (1180°C)</option>
                            <option value="Esmalte Alta Temperatura (1220°C)">Esmalte Alta (1220°C)</option>
                            <option value="Esmalte Alta Temperatura (1240°C)">Esmalte Alta (1240°C)</option>
                            <option value="Lustre / Ouro (750°C)">Lustre / Ouro (750°C)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Temperatura</label>
                          <input
                            type="text"
                            value={newJobTemp}
                            onChange={(e) => setNewJobTemp(e.target.value)}
                            placeholder="Ex: 1220°C"
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Qtd Peças</label>
                          <input
                            type="number"
                            min="1"
                            value={newJobPieces}
                            onChange={(e) => setNewJobPieces(parseInt(e.target.value) || 1)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Valor (R$)</label>
                          <input
                            type="number"
                            min="0"
                            value={newJobCost}
                            onChange={(e) => setNewJobCost(parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold font-serif"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg text-xs shadow-sm transition flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Lote</span>
                        </button>
                      </div>
                    </form>

                    {/* Jobs Table */}
                    <div className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden">
                      {fData.jobs.length === 0 ? (
                        <p className="p-8 text-center text-stone-400">Nenhum lote de queima cadastrado para este cliente.</p>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-stone-100 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200">
                            <tr>
                              <th className="px-3 py-2.5">Código / Data</th>
                              <th className="px-3 py-2.5">Tipo & Temp</th>
                              <th className="px-3 py-2.5">Peças</th>
                              <th className="px-3 py-2.5">Status da Queima</th>
                              <th className="px-3 py-2.5">Valor & Pagamento</th>
                              <th className="px-3 py-2.5 text-right">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 bg-white">
                            {fData.jobs.map((job) => (
                              <tr key={job.id} className="hover:bg-stone-50">
                                <td className="px-3 py-2.5">
                                  <p className="font-bold text-stone-900">{job.jobCode}</p>
                                  <p className="text-[10px] text-stone-400">{job.entryDate}</p>
                                </td>
                                <td className="px-3 py-2.5">
                                  <p className="font-medium text-stone-800">{job.firingType}</p>
                                  <span className="text-[10px] text-red-800 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                                    {job.temperature}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 font-bold text-stone-800">
                                  {job.pieceCount} peças
                                </td>
                                <td className="px-3 py-2.5">
                                  <select
                                    value={job.status}
                                    onChange={(e) => handleUpdateJobStatus(job.id, e.target.value as FiringJobStatus)}
                                    className="bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-700"
                                  >
                                    {FIRING_JOB_STATUSES.map((st) => (
                                      <option key={st} value={st}>
                                        {st}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-3 py-2.5">
                                  <p className="font-serif font-bold text-stone-900">
                                    R$ {job.totalCost.toFixed(2).replace('.', ',')}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleJobPaid(job.id)}
                                    className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                                      job.paymentStatus === 'Pago'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    }`}
                                  >
                                    {job.paymentStatus === 'Pago' ? '✓ Pago' : 'Pendente'}
                                  </button>
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="p-1 text-stone-400 hover:text-red-700 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* SERVICE 4: CLIENTE CONSULTORIA */}
          {activeServiceTab === 'cliente_consultoria' && (
            <div className="space-y-5">
              {(() => {
                const cData: ConsultingServiceData = activeSub.consultingData || {
                  contractedHours: 10,
                  usedHours: 0,
                  scheduledHours: 0,
                  balanceHours: 10,
                  hourlyRate: 150,
                  totalFee: 1500,
                  paidAmount: 0,
                  pendingAmount: 1500,
                  sessions: [],
                };

                const updateConsulting = (fields: Partial<ConsultingServiceData>) => {
                  const updated = { ...cData, ...fields };
                  updated.balanceHours = Math.max(0, updated.contractedHours - updated.usedHours - updated.scheduledHours);
                  updated.totalFee = updated.contractedHours * updated.hourlyRate;
                  updated.pendingAmount = Math.max(0, updated.totalFee - updated.paidAmount);
                  updateServiceData('cliente_consultoria', (sub) => ({ ...sub, consultingData: updated }));
                };

                const handleAddSession = (e: React.FormEvent) => {
                  e.preventDefault();
                  const newSession: ConsultingSession = {
                    id: `cs-${Date.now()}`,
                    date: newConsultingDate,
                    startTime: '14:00',
                    endTime: '16:00',
                    hours: Number(newConsultingHours),
                    status: 'Realizado',
                    topic: newConsultingTopic.trim() || 'Consultoria Técnica',
                    consultant: 'Ollaria Ateliê',
                    notes: newConsultingNotes.trim() || undefined,
                  };

                  const updatedSessions = [newSession, ...cData.sessions];
                  const usedHours = updatedSessions.filter((s) => s.status === 'Realizado').reduce((sum, s) => sum + s.hours, 0);
                  const scheduledHours = updatedSessions.filter((s) => s.status === 'Agendado').reduce((sum, s) => sum + s.hours, 0);

                  updateConsulting({
                    sessions: updatedSessions,
                    usedHours,
                    scheduledHours,
                  });
                  setNewConsultingNotes('');
                };

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <h5 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-purple-700" />
                          <span>Controle de Horas & Atendimentos de Consultoria</span>
                        </h5>
                        <p className="text-xs text-stone-500">
                          Horas contratadas, utilizadas e agendadas com cálculo automático de saldo disponível.
                        </p>
                      </div>

                      <span className="text-xs font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-xl">
                        R$ {cData.hourlyRate},00 / hora
                      </span>
                    </div>

                    {/* Hours Dashboard */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200">
                        <span className="text-[10px] font-bold text-purple-900 uppercase">Horas Contratadas</span>
                        <p className="text-2xl font-serif font-bold text-purple-950 mt-1">{cData.contractedHours}h</p>
                      </div>

                      <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] font-bold text-stone-500 uppercase">Horas Utilizadas</span>
                        <p className="text-2xl font-serif font-bold text-emerald-800 mt-1">{cData.usedHours}h</p>
                      </div>

                      <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] font-bold text-stone-500 uppercase">Horas Agendadas</span>
                        <p className="text-2xl font-serif font-bold text-amber-800 mt-1">{cData.scheduledHours}h</p>
                      </div>

                      <div className="bg-purple-900 text-purple-50 p-3.5 rounded-xl shadow-sm">
                        <span className="text-[10px] font-bold text-purple-300 uppercase">Saldo Disponível</span>
                        <p className="text-2xl font-serif font-bold text-white mt-1">{cData.balanceHours}h</p>
                      </div>
                    </div>

                    {/* Edit Contracts & Rates */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">Horas Contratadas</label>
                        <input
                          type="number"
                          value={cData.contractedHours}
                          onChange={(e) => updateConsulting({ contractedHours: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">Valor por Hora (R$)</label>
                        <input
                          type="number"
                          value={cData.hourlyRate}
                          onChange={(e) => updateConsulting({ hourlyRate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">Valor Pago (R$)</label>
                        <input
                          type="number"
                          value={cData.paidAmount}
                          onChange={(e) => updateConsulting({ paidAmount: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-bold text-emerald-800"
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] font-semibold text-stone-700 mb-1">Pendente</span>
                        <div className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg font-bold font-serif text-red-700">
                          R$ {cData.pendingAmount.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    </div>

                    {/* Add Session Form */}
                    <form onSubmit={handleAddSession} className="bg-purple-50/50 p-4 rounded-xl border border-purple-200 space-y-3">
                      <h6 className="font-bold text-purple-950 uppercase text-[11px] flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Registrar Atendimento / Sessão Realizada</span>
                      </h6>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Data</label>
                          <input
                            type="date"
                            value={newConsultingDate}
                            onChange={(e) => setNewConsultingDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Horas Consumidas</label>
                          <input
                            type="number"
                            step="0.5"
                            value={newConsultingHours}
                            onChange={(e) => setNewConsultingHours(parseFloat(e.target.value) || 1)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Tema / Pauta</label>
                          <input
                            type="text"
                            value={newConsultingTopic}
                            onChange={(e) => setNewConsultingTopic(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-lg text-xs shadow-sm transition"
                        >
                          Salvar Atendimento
                        </button>
                      </div>
                    </form>

                    {/* Sessions List */}
                    <div className="space-y-2">
                      <h6 className="font-bold text-stone-900 text-xs">Histórico de Atendimentos</h6>
                      {cData.sessions.length === 0 ? (
                        <p className="text-stone-400 italic">Nenhum atendimento registrado ainda.</p>
                      ) : (
                        <div className="divide-y divide-stone-100 bg-stone-50 rounded-xl border border-stone-200">
                          {cData.sessions.map((ses) => (
                            <div key={ses.id} className="p-3 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-stone-900">{ses.topic}</span>
                                <p className="text-[11px] text-stone-500">{ses.date} • {ses.hours} horas ({ses.status})</p>
                              </div>
                              <span className="font-mono text-purple-900 font-bold bg-purple-100 px-2.5 py-1 rounded">
                                -{ses.hours}h
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* SERVICE 5: ARTISTA COWORKING */}
          {activeServiceTab === 'artista_coworking' && (
            <div className="space-y-5">
              {(() => {
                const cwData: CoworkingServiceData = activeSub.coworkingData || {
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
                };

                const updateCoworking = (fields: Partial<CoworkingServiceData>) => {
                  const updated = { ...cwData, ...fields };
                  updated.balanceHours = Math.max(0, updated.contractedHours - updated.usedHours - updated.scheduledHours);
                  updated.totalFee = updated.contractedHours * updated.hourlyRate;
                  updated.pendingAmount = Math.max(0, updated.totalFee - updated.paidAmount);
                  updateServiceData('artista_coworking', (sub) => ({ ...sub, coworkingData: updated }));
                };

                const handleAddBooking = (e: React.FormEvent) => {
                  e.preventDefault();
                  const newBk: CoworkingBooking = {
                    id: `bk-${Date.now()}`,
                    date: newCoworkingDate,
                    startTime: '14:00',
                    endTime: '18:00',
                    hours: Number(newCoworkingHours),
                    station: newCoworkingStation,
                    status: 'Confirmado',
                  };

                  const updatedBookings = [newBk, ...cwData.bookings];
                  const used = updatedBookings.filter((b) => b.status === 'Realizado').reduce((sum, b) => sum + b.hours, 0);
                  const scheduled = updatedBookings.filter((b) => b.status === 'Confirmado' || b.status === 'Solicitado').reduce((sum, b) => sum + b.hours, 0);

                  updateCoworking({
                    bookings: updatedBookings,
                    usedHours: used,
                    scheduledHours: scheduled,
                  });
                };

                const handleUpdateBookingStatus = (id: string, status: CoworkingBooking['status']) => {
                  const updatedBookings = cwData.bookings.map((b) => (b.id === id ? { ...b, status } : b));
                  const used = updatedBookings.filter((b) => b.status === 'Realizado').reduce((sum, b) => sum + b.hours, 0);
                  const scheduled = updatedBookings.filter((b) => b.status === 'Confirmado' || b.status === 'Solicitado').reduce((sum, b) => sum + b.hours, 0);
                  updateCoworking({ bookings: updatedBookings, usedHours: used, scheduledHours: scheduled });
                };

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <h5 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-700" />
                          <span>Coworking Cerâmico — Locação de Bancada & Torno</span>
                        </h5>
                        <p className="text-xs text-stone-500">
                          Horários disponíveis, agendamentos confirmados e saldo de horas contratadas.
                        </p>
                      </div>

                      <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-xl">
                        Período: {cwData.contractedPeriod}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-900 uppercase">Horas Contratadas</span>
                        <p className="text-2xl font-serif font-bold text-emerald-950 mt-1">{cwData.contractedHours}h</p>
                      </div>

                      <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] font-bold text-stone-500 uppercase">Horas Utilizadas</span>
                        <p className="text-2xl font-serif font-bold text-stone-800 mt-1">{cwData.usedHours}h</p>
                      </div>

                      <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] font-bold text-stone-500 uppercase">Agendadas</span>
                        <p className="text-2xl font-serif font-bold text-amber-800 mt-1">{cwData.scheduledHours}h</p>
                      </div>

                      <div className="bg-emerald-900 text-emerald-50 p-3.5 rounded-xl shadow-sm">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase">Saldo de Horas</span>
                        <p className="text-2xl font-serif font-bold text-white mt-1">{cwData.balanceHours}h</p>
                      </div>
                    </div>

                    {/* Booking Form */}
                    <form onSubmit={handleAddBooking} className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-3">
                      <h6 className="font-bold text-emerald-950 uppercase text-[11px] flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agendar Horário de Ateliê para o Artista</span>
                      </h6>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Data</label>
                          <input
                            type="date"
                            value={newCoworkingDate}
                            onChange={(e) => setNewCoworkingDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Horas de Estudo/Uso</label>
                          <input
                            type="number"
                            min="1"
                            value={newCoworkingHours}
                            onChange={(e) => setNewCoworkingHours(parseFloat(e.target.value) || 1)}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">Posto / Equipamento</label>
                          <input
                            type="text"
                            value={newCoworkingStation}
                            onChange={(e) => setNewCoworkingStation(e.target.value)}
                            placeholder="Ex: Torno 01, Bancada de Modelagem"
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-xs shadow-sm transition"
                        >
                          Confirmar Horário
                        </button>
                      </div>
                    </form>

                    {/* Bookings Table */}
                    <div className="space-y-2">
                      <h6 className="font-bold text-stone-900 text-xs">Agenda & Agendamentos do Artista</h6>
                      {cwData.bookings.length === 0 ? (
                        <p className="text-stone-400 italic">Nenhum agendamento registrado.</p>
                      ) : (
                        <div className="divide-y divide-stone-100 bg-stone-50 rounded-xl border border-stone-200">
                          {cwData.bookings.map((bk) => (
                            <div key={bk.id} className="p-3 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-stone-900">{bk.date} ({bk.station})</span>
                                <p className="text-[11px] text-stone-500">{bk.hours} horas • Status: <b>{bk.status}</b></p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <select
                                  value={bk.status}
                                  onChange={(e) => handleUpdateBookingStatus(bk.id, e.target.value as any)}
                                  className="bg-white border border-stone-300 rounded px-2 py-1 text-[11px] font-semibold"
                                >
                                  <option value="Solicitado">Solicitado</option>
                                  <option value="Confirmado">Confirmado</option>
                                  <option value="Realizado">Realizado</option>
                                  <option value="Cancelado">Cancelado</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* SERVICE 6: PROFESSOR VISITANTE */}
          {activeServiceTab === 'professor_visitante' && (
            <div className="space-y-5">
              {(() => {
                const tData: VisitingTeacherServiceData = activeSub.teacherData || {
                  agreementType: 'Sublocação',
                  contractedPeriod: 'Agosto/2026',
                  contractedHours: 12,
                  usedHours: 0,
                  remainingHours: 12,
                  subleaseFee: 600,
                  paidAmount: 0,
                  pendingAmount: 600,
                  bookings: [],
                };

                const updateTeacher = (fields: Partial<VisitingTeacherServiceData>) => {
                  const updated = { ...tData, ...fields };
                  if (updated.agreementType === 'Sublocação') {
                    updated.remainingHours = Math.max(0, (updated.contractedHours || 0) - (updated.usedHours || 0));
                    updated.pendingAmount = Math.max(0, (updated.subleaseFee || 0) - updated.paidAmount);
                  } else {
                    const totalRev = updated.classTotalRevenue || 0;
                    const pct = (updated.agreedPercentage || 40) / 100;
                    updated.teacherDueAmount = totalRev * pct;
                    updated.pendingAmount = Math.max(0, (updated.teacherDueAmount || 0) - updated.paidAmount);
                  }
                  updateServiceData('professor_visitante', (sub) => ({ ...sub, teacherData: updated }));
                };

                return (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                      <div>
                        <h5 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-blue-700" />
                          <span>Acordo de Docência / Professor Visitante</span>
                        </h5>
                        <p className="text-xs text-stone-500">
                          Gerenciamento conforme o modelo acordado (Sublocação de espaço ou Percentual sobre turma).
                        </p>
                      </div>

                      {/* Agreement Type Switcher */}
                      <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                        {(['Sublocação', 'Percentual sobre turma'] as const).map((agType) => (
                          <button
                            type="button"
                            key={agType}
                            onClick={() => updateTeacher({ agreementType: agType })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              tData.agreementType === agType
                                ? 'bg-blue-900 text-white shadow-sm'
                                : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            {agType}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mode 1: Sublocação */}
                    {tData.agreementType === 'Sublocação' ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                          <h6 className="font-bold text-blue-950 text-xs mb-2">Modelo de Sublocação de Espaço</h6>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Período</label>
                              <input
                                type="text"
                                value={tData.contractedPeriod || 'Agosto/2026'}
                                onChange={(e) => updateTeacher({ contractedPeriod: e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Horas Contratadas</label>
                              <input
                                type="number"
                                value={tData.contractedHours || 12}
                                onChange={(e) => updateTeacher({ contractedHours: parseFloat(e.target.value) || 0 })}
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Horas Utilizadas</label>
                              <input
                                type="number"
                                value={tData.usedHours || 0}
                                onChange={(e) => updateTeacher({ usedHours: parseFloat(e.target.value) || 0 })}
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Valor da Sublocação (R$)</label>
                              <input
                                type="number"
                                value={tData.subleaseFee || 600}
                                onChange={(e) => updateTeacher({ subleaseFee: parseFloat(e.target.value) || 0 })}
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold font-serif"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Mode 2: Percentual sobre turma */
                      <div className="space-y-4">
                        <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                          <h6 className="font-bold text-blue-950 text-xs mb-2">Modelo de Repasse Percentual sobre Turma</h6>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Nome da Turma / Workshop</label>
                              <input
                                type="text"
                                value={tData.className || 'Workshop de Raku'}
                                onChange={(e) => updateTeacher({ className: e.target.value })}
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Quantidade de Alunos</label>
                              <input
                                type="number"
                                value={tData.studentCount || 8}
                                onChange={(e) => updateTeacher({ studentCount: parseInt(e.target.value) || 0 })}
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Faturamento da Turma (R$)</label>
                              <input
                                type="number"
                                value={tData.classTotalRevenue || 3200}
                                onChange={(e) => updateTeacher({ classTotalRevenue: parseFloat(e.target.value) || 0 })}
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold font-serif"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-blue-200">
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">% Acordado p/ o Professor</label>
                              <input
                                type="number"
                                value={tData.agreedPercentage || 40}
                                onChange={(e) => updateTeacher({ agreedPercentage: parseFloat(e.target.value) || 0 })}
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold"
                              />
                            </div>
                            <div>
                              <span className="block text-[11px] font-semibold text-stone-700 mb-1">Valor Devido ao Professor</span>
                              <div className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-bold font-serif text-blue-900">
                                R$ {(tData.teacherDueAmount || 0).toFixed(2).replace('.', ',')}
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Repasse Já Realizado (R$)</label>
                              <input
                                type="number"
                                value={tData.paidAmount || 0}
                                onChange={(e) => updateTeacher({ paidAmount: parseFloat(e.target.value) || 0 })}
                                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-emerald-800"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

        </div>
      ) : null}
    </div>
  );
};
