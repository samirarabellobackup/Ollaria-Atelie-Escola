import React from 'react';
import { Student, ClassAttendance, FiringItem, StudioAnnouncement, StudioRates } from '../../types';
import { Users, Flame, Calendar, DollarSign, AlertTriangle, CheckCircle2, TrendingUp, Plus, UserPlus, Send, Sparkles, ChevronRight, ShieldAlert } from 'lucide-react';

interface AdminDashboardProps {
  students: Student[];
  attendance: ClassAttendance[];
  firings: FiringItem[];
  announcements: StudioAnnouncement[];
  rates: StudioRates;
  onOpenStudentDetail: (student: Student) => void;
  onNavigateTab: (tab: 'students' | 'attendance' | 'firings' | 'finances') => void;
  onOpenAddStudentModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  attendance,
  firings,
  announcements,
  rates,
  onOpenStudentDetail,
  onNavigateTab,
  onOpenAddStudentModal,
}) => {
  // Stats Calculations
  const activeStudents = students.filter((s) => s.status === 'Ativo');
  
  // Pending monthly dues
  const overdueDues = students.filter((s) => s.duesStatus.status === 'Vencido');
  const pendingDues = students.filter((s) => s.duesStatus.status === 'Pendente');
  
  // Pending firings to pay
  const unpaidFirings = firings.filter((f) => f.paymentStatus === 'A Pagar');
  const unpaidFiringsTotalCost = unpaidFirings.reduce((sum, f) => sum + f.totalCost, 0);

  // Pieces in kiln pipeline
  const piecesInKiln = firings.filter(
    (f) => f.stage === '1ª Queima (Biscoito)' || f.stage === '2ª Queima (Esmalte)'
  );

  // Ready to pick up
  const readyPieces = firings.filter((f) => f.stage === 'Concluído (Pronto p/ Retirar)');

  // Attendance stats this month
  const currentMonthAttendance = attendance.filter((a) => a.monthCycle === '2026-08');
  const presentCount = currentMonthAttendance.filter((a) => a.status === 'Presença').length;
  const canceledCount = currentMonthAttendance.filter((a) => a.status === 'Desmarcado').length;
  const lostCount = currentMonthAttendance.filter((a) => a.status === 'Perdida').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Form Action */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-amber-50 rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-800/60 border border-amber-600/40 px-3 py-1 rounded-full text-xs font-medium text-amber-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Painel Executivo do Ateliê</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">
              Gestão Geral Ollaria Ateliê
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-2xl">
              Acompanhamento de matrículas, turmas, controle de presenças, cálculo automático de queimas por peso e mensalidades do ateliê.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenAddStudentModal}
              className="px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-100 font-bold text-xs sm:text-sm rounded-xl shadow-md border border-amber-600/50 transition flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>Cadastrar Novo Aluno</span>
            </button>

            <button
              onClick={() => onNavigateTab('firings')}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md border border-amber-400/40 transition flex items-center space-x-2"
            >
              <Flame className="w-4 h-4 text-amber-200" />
              <span>Nova Queima</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Enrolled Students */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Alunos Matriculados</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-serif text-stone-900">{activeStudents.length}</span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              100% ativos
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2 flex items-center justify-between">
            <span>Perfís gerados automaticamente</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition" />
          </p>
        </div>

        {/* Unpaid Firings Total */}
        <div
          onClick={() => onNavigateTab('firings')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Queimas a Receber</span>
            <div className="p-2 bg-orange-100 text-orange-800 rounded-xl group-hover:scale-110 transition">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-amber-900">
              R$ {unpaidFiringsTotalCost.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-[11px] font-medium text-orange-800 bg-orange-50 px-2 py-0.5 rounded-full">
              {unpaidFirings.length} peças
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2 flex items-center justify-between">
            <span>Cálculo automático x Kg</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition" />
          </p>
        </div>

        {/* Monthly Dues Overdue/Pending */}
        <div
          onClick={() => onNavigateTab('finances')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Vencimentos do Mês</span>
            <div className="p-2 bg-red-100 text-red-800 rounded-xl group-hover:scale-110 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-serif text-stone-900">
              {overdueDues.length + pendingDues.length}
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              overdueDues.length > 0 ? 'bg-red-100 text-red-800 font-bold' : 'bg-amber-100 text-amber-800'
            }`}>
              {overdueDues.length} vencidos
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2 flex items-center justify-between">
            <span>Acompanhamento de cobrança</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition" />
          </p>
        </div>

        {/* Attendance Summary */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Presenças em Agosto</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl group-hover:scale-110 transition">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-serif text-emerald-950">{presentCount}</span>
            <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
              {canceledCount} desmarc. | {lostCount} perdidas
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2 flex items-center justify-between">
            <span>Falta x limite do plano</span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition" />
          </p>
        </div>
      </div>

      {/* Main Content Split: Urgent Alerts & Student Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Urgent Attention & Recent Firings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overdue Dues Alert Box */}
          {overdueDues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-red-900 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <span>Atenção: Mensalidade Vencida ({overdueDues.length} aluno)</span>
                </div>
                <button
                  onClick={() => onNavigateTab('finances')}
                  className="text-xs font-semibold text-red-800 hover:underline"
                >
                  Gerenciar Cobranças →
                </button>
              </div>

              <div className="divide-y divide-red-200/60">
                {overdueDues.map((student) => (
                  <div key={student.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-red-200 text-red-900 flex items-center justify-center font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{student.name}</p>
                        <p className="text-red-700 text-[11px]">
                          Venceu em {student.duesStatus.dueDate} • R$ {student.duesStatus.amount}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenStudentDetail(student)}
                      className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium text-[11px] shadow-sm"
                    >
                      Ver Perfil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Roster Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Lista de Alunos Registrados
                </h3>
                <p className="text-xs text-stone-500">
                  Clique no aluno para incluir presenças, queimas e controlar visualização.
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('students')}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 underline"
              >
                Ver Todos ({students.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px] pb-2">
                    <th className="py-2 px-3">Aluno</th>
                    <th className="py-2 px-3">Plano</th>
                    <th className="py-2 px-3">Mensalidade</th>
                    <th className="py-2 px-3">Origem</th>
                    <th className="py-2 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {students.slice(0, 5).map((student) => (
                    <tr key={student.id} className="hover:bg-amber-50/50 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2.5">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt={student.name}
                              className="w-8 h-8 rounded-full object-cover border border-amber-300"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center">
                              {student.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-stone-900">{student.name}</p>
                            <p className="text-[11px] text-stone-500">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-stone-700">{student.monthlyPlan.name}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            student.duesStatus.status === 'Pago'
                              ? 'bg-emerald-100 text-emerald-800'
                              : student.duesStatus.status === 'Vencido'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {student.duesStatus.status} (R$ {student.duesStatus.amount})
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[10px] text-stone-600 font-medium">Ateliê</span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onOpenStudentDetail(student)}
                          className="px-3 py-1 bg-stone-800 hover:bg-stone-900 text-white rounded-lg font-medium text-[11px] transition shadow-sm"
                        >
                          Gerenciar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Kiln Lifecycle Status & Rates */}
        <div className="space-y-6">
          {/* Kiln Pipeline Box */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                <span>Status das Peças no Ateliê</span>
              </h3>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                {firings.length} total
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stone-800">Em Secagem</p>
                  <p className="text-[10px] text-stone-500">Aguardando lote de biscoito</p>
                </div>
                <span className="font-bold text-base text-stone-900">
                  {firings.filter((f) => f.stage === 'Secagem').length}
                </span>
              </div>

              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-orange-900">1ª Queima (Biscoito)</p>
                  <p className="text-[10px] text-orange-700">Temperatura ~980°C</p>
                </div>
                <span className="font-bold text-base text-orange-950">
                  {firings.filter((f) => f.stage === '1ª Queima (Biscoito)').length}
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-amber-900">2ª Queima (Esmalte)</p>
                  <p className="text-[10px] text-amber-700">Alta temperatura ~1220°C</p>
                </div>
                <span className="font-bold text-base text-amber-950">
                  {firings.filter((f) => f.stage === '2ª Queima (Esmalte)').length}
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-emerald-900">Pronto para Retirar</p>
                  <p className="text-[10px] text-emerald-700">Estante de entregas do aluno</p>
                </div>
                <span className="font-bold text-base text-emerald-950">
                  {readyPieces.length}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('firings')}
              className="w-full mt-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition text-center block"
            >
              Ver Todas as Peças & Queimas →
            </button>
          </div>

          {/* Rates Config Summary */}
          <div className="bg-amber-950 text-amber-100 rounded-2xl p-5 border border-amber-800 shadow-sm">
            <h4 className="text-sm font-bold text-amber-200 mb-2 flex items-center justify-between">
              <span>Tabela Oficial de Queimas</span>
              <span className="text-[10px] bg-amber-800 text-amber-200 px-2 py-0.5 rounded">R$ / kg</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-amber-100/90 my-3">
              <div className="bg-amber-900/60 p-2.5 rounded-xl border border-amber-800/80">
                <p className="text-[10px] text-amber-300">Taxa Biscoito</p>
                <p className="text-lg font-bold text-white">R$ {rates.biscoitoRatePerKg.toFixed(2)}/kg</p>
              </div>
              <div className="bg-amber-900/60 p-2.5 rounded-xl border border-amber-800/80">
                <p className="text-[10px] text-amber-300">Taxa Esmalte</p>
                <p className="text-lg font-bold text-white">R$ {rates.esmalteRatePerKg.toFixed(2)}/kg</p>
              </div>
            </div>
            <p className="text-[11px] text-amber-300/70">
              O calculador calcula automaticamente o valor exato a ser cobrado do aluno baseado no peso balança (kg).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
