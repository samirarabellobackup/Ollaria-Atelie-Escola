import React, { useState } from 'react';
import { 
  Student, 
  ClassAttendance, 
  FiringItem, 
  StudioRates, 
  FiringStage, 
  ClassAttendanceStatus,
  MaterialRecord,
  AuditLogEntry,
  SERVICE_TYPES
} from '../../types';
import { DEFAULT_PLANS, generateStudentPassword } from '../../data/mockData';
import { ensureUserServices, calculateUserFinancials, createAuditLog } from '../../data/serviceHelpers';
import { UserServiceManager } from './UserServiceManager';
import { AuditLogViewer } from './AuditLogViewer';
import { 
  Calendar, 
  Flame, 
  DollarSign, 
  Lock, 
  Edit3, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  FileText, 
  Send, 
  Sparkles, 
  Shield, 
  User,
  Briefcase,
  Package,
  History
} from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  student: Student | null;
  attendance: ClassAttendance[];
  firings: FiringItem[];
  rates: StudioRates;
  materials?: MaterialRecord[];
  auditLogs?: AuditLogEntry[];
  onClose: () => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onAddAttendance: (attendanceRecord: ClassAttendance) => void;
  onUpdateAttendanceStatus: (attendanceId: string, status: ClassAttendanceStatus) => void;
  onAddFiring: (firingRecord: FiringItem) => void;
  onUpdateFiringStage: (firingId: string, stage: FiringStage) => void;
  onToggleFiringPaid: (firingId: string) => void;
  onDeleteFiring: (firingId: string) => void;
  onAddMaterial?: (material: MaterialRecord) => void;
  onAddAuditLog?: (entry: AuditLogEntry) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  student,
  attendance,
  firings,
  rates,
  materials = [],
  auditLogs = [],
  onClose,
  onUpdateStudent,
  onAddAttendance,
  onUpdateAttendanceStatus,
  onAddFiring,
  onUpdateFiringStage,
  onToggleFiringPaid,
  onDeleteFiring,
  onAddMaterial,
  onAddAuditLog,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'attendance' | 'firings' | 'materials' | 'financial' | 'permissions' | 'history' | 'notes'>('services');

  // New class state
  const [newClassDate, setNewClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [newClassTime, setNewClassTime] = useState('14:00 - 17:00');

  // New piece firing state
  const [pieceName, setPieceName] = useState('');
  const [pieceCategory, setPieceCategory] = useState<FiringItem['category']>('Vaso');
  const [firingType, setFiringType] = useState<FiringItem['type']>('Dupla (Biscoito + Esmalte)');
  const [weightKg, setWeightKg] = useState<number>(0.5);
  const [firingStage, setFiringStage] = useState<FiringStage>('1ª Queima (Biscoito)');

  if (!isOpen || !student) return null;

  // Student specific data
  const userServices = ensureUserServices(student);
  const financials = calculateUserFinancials(student, materials);
  const userMaterials = materials.filter((m) => m.userId === student.id);
  const userAuditLogs = auditLogs.filter((l) => l.userId === student.id || l.userName === student.name);

  const studentAttendance = attendance.filter((a) => a.studentId === student.id);
  const studentFirings = firings.filter((f) => f.studentId === student.id);

  // Month stats
  const currentMonthAttendance = studentAttendance.filter((a) => a.monthCycle === '2026-08');
  const presentCount = currentMonthAttendance.filter((a) => a.status === 'Presença').length;
  const canceledCount = currentMonthAttendance.filter((a) => a.status === 'Desmarcado').length;
  const lostCount = currentMonthAttendance.filter((a) => a.status === 'Perdida').length;
  const maxClasses = student.monthlyPlan.classesPerMonth;
  const remainingClasses = Math.max(0, maxClasses - presentCount);

  // Unpaid firings
  const unpaidFirings = studentFirings.filter((f) => f.paymentStatus === 'A Pagar');
  const unpaidFiringsTotal = unpaidFirings.reduce((sum, f) => sum + f.totalCost, 0);

  // Handlers
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: ClassAttendance = {
      id: `att-${Date.now()}`,
      studentId: student.id,
      date: newClassDate,
      time: newClassTime,
      status: 'Agendada',
      monthCycle: '2026-08',
    };
    onAddAttendance(newRecord);
  };

  const handleCreateFiring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pieceName.trim() || weightKg <= 0) return;

    // Rate calculation
    let rate = rates.esmalteRatePerKg;
    if (firingType === 'Biscoito') rate = rates.biscoitoRatePerKg;
    if (firingType === 'Dupla (Biscoito + Esmalte)') rate = rates.biscoitoRatePerKg + rates.esmalteRatePerKg;

    const totalCost = Number((weightKg * rate).toFixed(2));

    const newFiring: FiringItem = {
      id: `fir-${Date.now()}`,
      studentId: student.id,
      pieceName: pieceName.trim(),
      category: pieceCategory,
      type: firingType,
      weightKg: Number(weightKg),
      unitCostPerKg: rate,
      totalCost,
      paymentStatus: 'A Pagar',
      stage: firingStage,
      createdAt: new Date().toISOString().split('T')[0],
      notes: `Registrado no balcão do ateliê.`,
    };

    onAddFiring(newFiring);
    setPieceName('');
    setWeightKg(0.5);
  };

  const handleUpdateDuesStatus = (newStatus: 'Pago' | 'Pendente' | 'Vencido') => {
    const updated: Student = {
      ...student,
      duesStatus: {
        ...student.duesStatus,
        status: newStatus,
        paymentHistory:
          newStatus === 'Pago'
            ? [
                ...student.duesStatus.paymentHistory,
                {
                  id: `pay-${Date.now()}`,
                  month: student.duesStatus.currentMonth,
                  date: new Date().toISOString().split('T')[0],
                  amount: student.duesStatus.amount,
                  method: 'Pix',
                  status: 'Pago',
                },
              ]
            : student.duesStatus.paymentHistory,
      },
    };
    onUpdateStudent(updated);
  };

  const handleSendWhatsAppReminder = () => {
    const msg = `Olá ${student.name}! 👋 Passando para lembrar sobre sua mensalidade do Ollaria Ateliê (${student.duesStatus.currentMonth}) no valor de R$ ${student.duesStatus.amount}. Chave Pix do Ateliê: ollariaatelie@gmail.com. Qualquer dúvida estamos à disposição! 🏺✨`;
    window.open(`https://wa.me/55${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-stone-50 border border-stone-200 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Profile Bar */}
        <div className="bg-amber-950 text-amber-50 p-6 relative border-b border-amber-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-amber-300 hover:text-white p-1 rounded-lg text-lg"
          >
            ✕
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-amber-400/80 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-amber-800 text-amber-100 font-bold text-2xl flex items-center justify-center border border-amber-600">
                  {student.name.charAt(0)}
                </div>
              )}

              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-100">
                    {student.name}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      student.duesStatus.status === 'Pago'
                        ? 'bg-emerald-900 text-emerald-200 border border-emerald-700'
                        : student.duesStatus.status === 'Vencido'
                        ? 'bg-red-900 text-red-200 border border-red-700'
                        : 'bg-amber-800 text-amber-200 border border-amber-600'
                    }`}
                  >
                    Vencimento: {student.duesStatus.status} (R$ {student.duesStatus.amount})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-amber-200/80 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-amber-400" /> {student.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" /> {student.phone}
                  </span>
                  <span className="bg-amber-900/80 px-2 py-0.5 rounded text-[11px] text-amber-200 border border-amber-700">
                    {student.monthlyPlan.name}
                  </span>
                </div>

                {/* Service Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {userServices.filter(s => s.isActive).map((sub) => {
                    const meta = SERVICE_TYPES[sub.type];
                    return (
                      <span key={sub.type} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs ${meta.badgeColor}`}>
                        {meta.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={handleSendWhatsAppReminder}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-emerald-200" />
              <span>Enviar Lembrete WhatsApp</span>
            </button>
          </div>

          {/* Quick Metrics Pills - Unified Financial & Operational */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-amber-900/50 border border-amber-800/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-amber-300">Total de Serviços</span>
              <p className="text-base font-bold text-white mt-0.5">
                R$ {financials.serviceFee.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div className="bg-amber-900/50 border border-amber-800/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-amber-300">Materiais (Cobrança)</span>
              <p className="text-base font-bold text-amber-200 mt-0.5">
                R$ {financials.materialsFee.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div className="bg-amber-900/50 border border-amber-800/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-amber-300">Total Pago</span>
              <p className="text-base font-bold text-emerald-300 mt-0.5">
                R$ {financials.paidAmount.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div className="bg-amber-900/50 border border-amber-800/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-amber-300">Saldo Pendente</span>
              <p className="text-base font-bold text-amber-200 mt-0.5">
                R$ {financials.pendingAmount.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100 px-6 pt-3 space-x-2 sm:space-x-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'services'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Serviços & Contratos ({userServices.filter(s => s.isActive).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'attendance'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Aulas & Chamada</span>
          </button>

          <button
            onClick={() => setActiveTab('firings')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'firings'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Peças & Queimas ({studentFirings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'materials'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Materiais Utilizados ({userMaterials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'financial'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Financeiro Unificado</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'permissions'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Permissões do Portal</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'history'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico ({userAuditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'notes'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Anotações Internas</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 0: SERVICES & CONTRACTS */}
          {activeTab === 'services' && (
            <UserServiceManager
              student={student}
              onUpdateStudent={onUpdateStudent}
              onAddAuditLog={onAddAuditLog}
            />
          )}

          {/* TAB 1: ATTENDANCE & PRESENCE CONTROL */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Add Class Form */}
              <form onSubmit={handleCreateClass} className="bg-amber-50/80 p-4 rounded-xl border border-amber-200">
                <h4 className="text-xs font-bold text-amber-950 uppercase mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-800" />
                  <span>Agendar Nova Aula para este Aluno</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Data da Aula</label>
                    <input
                      type="date"
                      required
                      value={newClassDate}
                      onChange={(e) => setNewClassDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Horário da Turma</label>
                    <input
                      type="text"
                      required
                      value={newClassTime}
                      onChange={(e) => setNewClassTime(e.target.value)}
                      placeholder="14:00 - 17:00"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-lg shadow-sm transition"
                    >
                      Inserir na Agenda
                    </button>
                  </div>
                </div>
              </form>

              {/* Attendance Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-stone-100 border-b border-stone-200 flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-stone-900">Histórico de Chamada (Agosto/2026)</span>
                  <span className="text-xs text-stone-500">
                    Presenças: <b className="text-emerald-700">{presentCount}</b> | Desmarcadas: <b className="text-amber-700">{canceledCount}</b> | Perdidas: <b className="text-red-700">{lostCount}</b>
                  </span>
                </div>

                <div className="divide-y divide-stone-100 text-xs">
                  {studentAttendance.length === 0 ? (
                    <div className="p-8 text-center text-stone-400">Nenhuma aula registrada para este aluno.</div>
                  ) : (
                    studentAttendance.map((record) => (
                      <div key={record.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-stone-900 text-sm">{record.date}</span>
                            <span className="text-stone-500 font-mono">({record.time})</span>
                          </div>
                          {record.notes && <p className="text-[11px] text-stone-500 mt-0.5">{record.notes}</p>}
                        </div>

                        {/* Attendance status toggles */}
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            onClick={() => onUpdateAttendanceStatus(record.id, 'Presença')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              record.status === 'Presença'
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-800'
                            }`}
                          >
                            Presença
                          </button>

                          <button
                            onClick={() => onUpdateAttendanceStatus(record.id, 'Desmarcado')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              record.status === 'Desmarcado'
                                ? 'bg-amber-700 text-white shadow-sm'
                                : 'bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-800'
                            }`}
                          >
                            Desmarcado
                          </button>

                          <button
                            onClick={() => onUpdateAttendanceStatus(record.id, 'Perdida')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              record.status === 'Perdida'
                                ? 'bg-red-700 text-white shadow-sm'
                                : 'bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-800'
                            }`}
                          >
                            Perdida
                          </button>

                          <button
                            onClick={() => onUpdateAttendanceStatus(record.id, 'Agendada')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              record.status === 'Agendada'
                                ? 'bg-stone-800 text-white shadow-sm'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            Agendada
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FIRINGS & PIECES CONTROL */}
          {activeTab === 'firings' && (
            <div className="space-y-6">
              {/* New Firing Form */}
              <form onSubmit={handleCreateFiring} className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-3">
                <h4 className="text-xs font-bold text-amber-950 uppercase flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-800" />
                  <span>Cadastrar Peça & Queima para este Aluno</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Nome da Peça *</label>
                    <input
                      type="text"
                      required
                      value={pieceName}
                      onChange={(e) => setPieceName(e.target.value)}
                      placeholder="Ex: Vaso Cilíndrico, Caneca"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Tipo de Queima</label>
                    <select
                      value={firingType}
                      onChange={(e) => setFiringType(e.target.value as FiringItem['type'])}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    >
                      <option value="Dupla (Biscoito + Esmalte)">Dupla (Biscoito R$ 35 + Esmalte R$ 50/kg)</option>
                      <option value="Biscoito">Apenas Biscoito (R$ 35,00/kg)</option>
                      <option value="Esmalte">Apenas Esmalte (R$ 50,00/kg)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Peso da Balança (kg) *</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      required
                      value={weightKg}
                      onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Etapa Atual no Ateliê</label>
                    <select
                      value={firingStage}
                      onChange={(e) => setFiringStage(e.target.value as FiringStage)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    >
                      <option value="Secagem">Secagem Prateleira</option>
                      <option value="1ª Queima (Biscoito)">1ª Queima (Biscoito)</option>
                      <option value="Esmaltação">Esmaltação</option>
                      <option value="2ª Queima (Esmalte)">2ª Queima (Esmalte)</option>
                      <option value="Concluído (Pronto p/ Retirar)">Pronto para Retirar</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs font-bold text-amber-900">
                    Cálculo Automático: <span className="text-sm font-extrabold">R$ {(weightKg * (firingType === 'Biscoito' ? rates.biscoitoRatePerKg : firingType === 'Esmalte' ? rates.esmalteRatePerKg : rates.biscoitoRatePerKg + rates.esmalteRatePerKg)).toFixed(2).replace('.', ',')}</span>
                  </p>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Salvar Queima no Perfil do Aluno
                  </button>
                </div>
              </form>

              {/* Firings List Table */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-stone-100 border-b border-stone-200 flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-stone-900">Peças & Queimas Cadastradas</span>
                  <span className="text-xs text-stone-500">
                    A Pagar: <b className="text-amber-900 font-bold">R$ {unpaidFiringsTotal.toFixed(2)}</b>
                  </span>
                </div>

                <div className="divide-y divide-stone-100 text-xs">
                  {studentFirings.length === 0 ? (
                    <div className="p-8 text-center text-stone-400">Nenhuma peça ou queima registrada para este aluno.</div>
                  ) : (
                    studentFirings.map((firing) => (
                      <div key={firing.id} className="p-4 space-y-3 hover:bg-stone-50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-stone-900 text-sm">{firing.pieceName}</span>
                              <span className="bg-stone-200 px-2 py-0.5 rounded text-[10px] text-stone-700 font-semibold">
                                {firing.category}
                              </span>
                              <span className="text-stone-500 text-xs">
                                ({firing.weightKg} kg • R$ {firing.totalCost.toFixed(2).replace('.', ',')})
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              Tipo: {firing.type} • Cadastrado em {firing.createdAt}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => onToggleFiringPaid(firing.id)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition ${
                                firing.paymentStatus === 'Pago'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-800 text-white hover:bg-amber-900'
                              }`}
                            >
                              {firing.paymentStatus === 'Pago' ? '✓ Queima Paga' : 'Marcar como PAGO'}
                            </button>

                            <button
                              onClick={() => onDeleteFiring(firing.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded transition"
                              title="Excluir Registro"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Stage Selector Progress */}
                        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-stone-600 font-semibold text-[11px]">Etapa do Forno:</span>
                          <select
                            value={firing.stage}
                            onChange={(e) => onUpdateFiringStage(firing.id, e.target.value as FiringStage)}
                            className="bg-white border border-stone-300 rounded px-2 py-1 text-xs font-semibold focus:ring-2 focus:ring-amber-600 outline-none"
                          >
                            <option value="Modelagem">1. Modelagem</option>
                            <option value="Secagem">2. Secagem Prateleira</option>
                            <option value="1ª Queima (Biscoito)">3. 1ª Queima (Biscoito)</option>
                            <option value="Esmaltação">4. Esmaltação</option>
                            <option value="2ª Queima (Esmalte)">5. 2ª Queima (Esmalte)</option>
                            <option value="Concluído (Pronto p/ Retirar)">6. Concluído (Pronto p/ Retirar)</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MATERIALS CONSUMED */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-800" />
                    <span>Materiais Consumidos por {student.name}</span>
                  </h4>
                  <p className="text-xs text-stone-500">
                    Argilas, esmaltes, engobes e insumos vinculados aos serviços contratados.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500 block">Total a Cobrar</span>
                  <span className="text-base font-bold font-serif text-stone-900">
                    R$ {financials.materialsFee.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {userMaterials.length === 0 ? (
                <div className="p-8 text-center text-stone-400 bg-white rounded-xl border border-stone-200">
                  <Package className="w-8 h-8 mx-auto text-stone-300 mb-1" />
                  <p>Nenhum registro de material para este usuário ainda.</p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Você pode registrar novos consumos pela aba geral "Materiais & Insumos" no menu principal.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
                  {userMaterials.map((m) => (
                    <div key={m.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-stone-900 text-xs">{m.materialName}</span>
                          <span className="text-[10px] text-stone-500 font-mono">({m.date})</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {m.quantity} {m.unit} • R$ {m.unitPrice.toFixed(2)}/{m.unit}
                          {m.notes && <span className="italic ml-1">({m.notes})</span>}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            m.compensationType === 'Cobrar'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : m.compensationType === 'Repor'
                              ? 'bg-orange-100 text-orange-900 border-orange-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {m.compensationType}
                        </span>

                        <span className="font-serif font-bold text-xs text-stone-900">
                          R$ {m.totalPrice.toFixed(2).replace('.', ',')}
                        </span>

                        {m.compensationType === 'Cobrar' && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            m.paymentStatus === 'Pago'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {m.paymentStatus || 'Pendente'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FINANCIAL & DUES */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Unified Financial Breakdown Card */}
              <div className="bg-stone-900 text-stone-100 p-5 rounded-2xl border border-stone-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-white text-base">
                      Extrato Financeiro Unificado
                    </h4>
                    <p className="text-xs text-stone-400">
                      Consolidação de todos os serviços contratados e materiais utilizados.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-stone-800 px-3 py-1 rounded-lg">
                    {student.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="bg-stone-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Serviços Contratados</span>
                    <span className="text-base font-bold text-white font-serif mt-1 block">
                      R$ {financials.serviceFee.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="bg-stone-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Materiais a Cobrar</span>
                    <span className="text-base font-bold text-amber-300 font-serif mt-1 block">
                      R$ {financials.materialsFee.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="bg-stone-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Total Geral</span>
                    <span className="text-base font-bold text-white font-serif mt-1 block">
                      R$ {financials.totalFee.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="bg-stone-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Total Pago</span>
                    <span className="text-base font-bold text-emerald-400 font-serif mt-1 block">
                      R$ {financials.paidAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="bg-stone-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-red-400 uppercase font-semibold block">Saldo Pendente</span>
                    <span className="text-base font-bold text-red-400 font-serif mt-1 block">
                      R$ {financials.pendingAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
              {/* Dues Status Manager */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <h4 className="font-serif font-bold text-stone-900 text-base">
                  Status da Mensalidade do Mês ({student.duesStatus.currentMonth})
                </h4>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div>
                    <p className="text-xs text-stone-500 font-semibold">Valor da Mensalidade Atual:</p>
                    <p className="text-2xl font-bold font-serif text-stone-900">
                      R$ {student.duesStatus.amount.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Data de Vencimento Padrão: <span className="font-bold text-stone-800">{student.duesStatus.dueDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateDuesStatus('Pago')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        student.duesStatus.status === 'Pago'
                          ? 'bg-emerald-700 text-white shadow-md'
                          : 'bg-stone-200 text-stone-700 hover:bg-emerald-100 hover:text-emerald-900'
                      }`}
                    >
                      ✓ Marcar como PAGO
                    </button>

                    <button
                      onClick={() => handleUpdateDuesStatus('Pendente')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        student.duesStatus.status === 'Pendente'
                          ? 'bg-amber-700 text-white shadow-md'
                          : 'bg-stone-200 text-stone-700 hover:bg-amber-100 hover:text-amber-900'
                      }`}
                    >
                      Pendente
                    </button>

                    <button
                      onClick={() => handleUpdateDuesStatus('Vencido')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        student.duesStatus.status === 'Vencido'
                          ? 'bg-red-700 text-white shadow-md'
                          : 'bg-stone-200 text-stone-700 hover:bg-red-100 hover:text-red-900'
                      }`}
                    >
                      Vencido
                    </button>
                  </div>
                </div>

                {/* Plan Selector */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Alterar Plano de Aulas do Aluno
                  </label>
                  <select
                    value={student.monthlyPlan.id}
                    onChange={(e) => {
                      const newPlan = DEFAULT_PLANS.find((p) => p.id === e.target.value) || DEFAULT_PLANS[0];
                      onUpdateStudent({
                        ...student,
                        monthlyPlan: newPlan,
                        duesStatus: {
                          ...student.duesStatus,
                          amount: newPlan.monthlyFee,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-600 outline-none"
                  >
                    {DEFAULT_PLANS.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — {plan.classesPerMonth} aulas/mês — R$ {plan.monthlyFee}/mês
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <h4 className="font-serif font-bold text-stone-900 text-sm mb-3">
                  Histórico Recente de Pagamentos
                </h4>
                <div className="divide-y divide-stone-100 text-xs">
                  {student.duesStatus.paymentHistory.length === 0 ? (
                    <p className="text-stone-400 py-4 text-center">Nenhum histórico registrado ainda.</p>
                  ) : (
                    student.duesStatus.paymentHistory.map((pay) => (
                      <div key={pay.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-stone-900">{pay.month} — R$ {pay.amount}</p>
                          <p className="text-[11px] text-stone-500">Pago via {pay.method} em {pay.date}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                          Confirmado
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PERMISSIONS & ACCESS CREDENTIALS */}
          {activeTab === 'permissions' && (
            <div className="space-y-5">
              {/* Student Password & Access Card */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-800" />
                      <span>Senha de Acesso do Aluno</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Senha utilizada pelo aluno para logar em seu portal individual.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newPass = generateStudentPassword(student.name);
                      onUpdateStudent({ ...student, password: newPass });
                    }}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-lg transition"
                  >
                    Gerar Nova Senha
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Editar Senha Atual:
                    </label>
                    <input
                      type="text"
                      value={student.password || generateStudentPassword(student.name)}
                      onChange={(e) => onUpdateStudent({ ...student, password: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold text-amber-950 focus:ring-2 focus:ring-amber-600 outline-none"
                    />
                  </div>

                  <div className="sm:self-end">
                    <button
                      onClick={() => {
                        const pass = student.password || generateStudentPassword(student.name);
                        const msg = `Olá ${student.name}! 🏺 Aqui estão seus dados de acesso ao Portal do Aluno Ollaria Ateliê:\n\n🌐 Portal: https://ollaria-atelie.app\n📧 E-mail: ${student.email}\n🔑 Senha: ${pass}\n\nQualquer dúvida estamos à disposição! ✨`;
                        window.open(`https://wa.me/55${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Enviar Credenciais WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissions Checkboxes */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                  <Lock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Controle de Visualização do Portal do Aluno</p>
                    <p className="text-[11px] text-amber-800/90 mt-0.5">
                      O aluno enxergará **apenas** as seções marcadas como ativas abaixo quando fizer login.
                    </p>
                  </div>
                </div>

              <div className="space-y-3 pt-2 text-xs">
                <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-100">
                  <div>
                    <p className="font-bold text-stone-900">Visualizar Presenças e Aulas do Mês</p>
                    <p className="text-[11px] text-stone-500">Exibe total de aulas feitas e faltantes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={student.permissions.canViewAttendance}
                    onChange={() =>
                      onUpdateStudent({
                        ...student,
                        permissions: { ...student.permissions, canViewAttendance: !student.permissions.canViewAttendance },
                      })
                    }
                    className="w-5 h-5 rounded text-amber-800 focus:ring-amber-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-100">
                  <div>
                    <p className="font-bold text-stone-900">Visualizar Queimas & Custos Individuais</p>
                    <p className="text-[11px] text-stone-500">Exibe lista de peças, pesos e taxas a pagar</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={student.permissions.canViewFirings}
                    onChange={() =>
                      onUpdateStudent({
                        ...student,
                        permissions: { ...student.permissions, canViewFirings: !student.permissions.canViewFirings },
                      })
                    }
                    className="w-5 h-5 rounded text-amber-800 focus:ring-amber-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-100">
                  <div>
                    <p className="font-bold text-stone-900">Visualizar Estágios e Status dos Projetos</p>
                    <p className="text-[11px] text-stone-500">Exibe se a peça está em secagem, biscoito ou esmaltação</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={student.permissions.canViewProjectStatus}
                    onChange={() =>
                      onUpdateStudent({
                        ...student,
                        permissions: { ...student.permissions, canViewProjectStatus: !student.permissions.canViewProjectStatus },
                      })
                    }
                    className="w-5 h-5 rounded text-amber-800 focus:ring-amber-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-100">
                  <div>
                    <p className="font-bold text-stone-900">Visualizar Status Financeiro da Mensalidade</p>
                    <p className="text-[11px] text-stone-500">Exibe data de vencimento e status Pago/Pendente</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={student.permissions.canViewFinancials}
                    onChange={() =>
                      onUpdateStudent({
                        ...student,
                        permissions: { ...student.permissions, canViewFinancials: !student.permissions.canViewFinancials },
                      })
                    }
                    className="w-5 h-5 rounded text-amber-800 focus:ring-amber-700"
                  />
                </label>
              </div>
            </div>
          </div>
          )}

          {/* TAB 5: INTERNAL NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-stone-900 text-sm">
                Anotações Internas do Ateliê (Visível apenas para a administração)
              </h4>
              <textarea
                rows={5}
                value={student.notes}
                onChange={(e) =>
                  onUpdateStudent({
                    ...student,
                    notes: e.target.value,
                  })
                }
                placeholder="Anote detalhes técnicos como argilas preferidas, observações de secagem ou recados..."
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
              />
              <p className="text-[10px] text-stone-500">As alterações nas anotações são salvas automaticamente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
