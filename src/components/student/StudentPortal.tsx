import React, { useState } from 'react';
import { Student, ClassAttendance, FiringItem, StudioAnnouncement, StudioRates } from '../../types';
import { Calendar, Flame, DollarSign, Clock, CheckCircle2, AlertCircle, FileText, Sparkles, Lock, ArrowRight, Copy, Check, Info } from 'lucide-react';

interface StudentPortalProps {
  student: Student;
  attendance: ClassAttendance[];
  firings: FiringItem[];
  announcements: StudioAnnouncement[];
  rates: StudioRates;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  attendance,
  firings,
  announcements,
  rates,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'firings' | 'projects'>('overview');
  const [copiedPix, setCopiedPix] = useState(false);

  // Fallback to overview if the active tab is forbidden by permissions
  React.useEffect(() => {
    if (activeTab === 'attendance' && !student.permissions.canViewAttendance) {
      setActiveTab('overview');
    }
    if (activeTab === 'firings' && !student.permissions.canViewFirings) {
      setActiveTab('overview');
    }
    if (activeTab === 'projects' && !student.permissions.canViewProjectStatus) {
      setActiveTab('overview');
    }
  }, [activeTab, student.permissions]);

  // Filter student data strictly
  const studentAttendance = attendance.filter((a) => a.studentId === student.id);
  const studentFirings = firings.filter((f) => f.studentId === student.id);

  // Month stats (Agosto/2026)
  const currentMonthAttendance = studentAttendance.filter((a) => a.monthCycle === '2026-08');
  const presentCount = currentMonthAttendance.filter((a) => a.status === 'Presença').length;
  const canceledCount = currentMonthAttendance.filter((a) => a.status === 'Desmarcado').length;
  const lostCount = currentMonthAttendance.filter((a) => a.status === 'Perdida').length;
  const maxClasses = student.monthlyPlan.classesPerMonth;
  const remainingClasses = Math.max(0, maxClasses - presentCount);

  // Unpaid firings total
  const unpaidFirings = studentFirings.filter((f) => f.paymentStatus === 'A Pagar');
  const unpaidFiringsTotal = unpaidFirings.reduce((sum, f) => sum + f.totalCost, 0);

  // Projects ready for pickup
  const readyProjects = studentFirings.filter((f) => f.stage === 'Concluído (Pronto p/ Retirar)');

  const handleCopyPix = () => {
    navigator.clipboard.writeText('ollariaatelie@gmail.com');
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Admin Notice Banner for quick context */}
      <div className="bg-amber-100 border border-amber-300 text-amber-950 p-3.5 rounded-2xl shadow-sm text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-800 shrink-0" />
          <span>
            <b>Portal do Aluno Ativo:</b> Exibindo dados de <b className="text-amber-900">{student.name}</b>. Para visualizar o ateliê completo, acesse o <b>Painel Administrativo</b>.
          </span>
        </div>
        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono font-bold shrink-0">
          Ateliê Ollaria
        </span>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-amber-50 rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-800/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-lg shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-800 text-amber-100 font-bold text-2xl flex items-center justify-center border border-amber-600 shrink-0">
                {student.name.charAt(0)}
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">
                  Olá, {student.name.split(' ')[0]}!
                </h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-800 text-amber-200 rounded-full border border-amber-600">
                  {student.monthlyPlan.name}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1">
                Seu portal pessoal no Ollaria Ateliê • Horário: <span className="font-semibold text-white">{student.preferredSchedule}</span>
              </p>
            </div>
          </div>

          {student.permissions.canViewFinancials && (
            <div className="bg-amber-950/80 p-3 rounded-xl border border-amber-700/60 text-xs shrink-0">
              <span className="text-amber-300/80 block text-[10px]">Situação da Mensalidade:</span>
              <span
                className={`font-bold text-sm inline-block mt-0.5 ${
                  student.duesStatus.status === 'Pago'
                    ? 'text-emerald-400'
                    : student.duesStatus.status === 'Vencido'
                    ? 'text-red-400'
                    : 'text-amber-300'
                }`}
              >
                {student.duesStatus.status} (Venceu/Vence em {student.duesStatus.dueDate})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards for Student */}
      {(student.permissions.canViewAttendance ||
        student.permissions.canViewFirings ||
        student.permissions.canViewProjectStatus ||
        student.permissions.canViewFinancials) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Remaining Classes */}
          {student.permissions.canViewAttendance && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">Aulas no Mês (Agosto)</span>
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold font-serif text-amber-950">{remainingClasses}</span>
                <span className="text-xs font-semibold text-stone-600">de {maxClasses} aulas faltam</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                Presenças no mês: <b className="text-emerald-700">{presentCount}</b> | Faltas: <b className="text-stone-700">{lostCount + canceledCount}</b>
              </p>
            </div>
          )}

          {/* Queimas a Pagar */}
          {student.permissions.canViewFirings && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">Queimas a Pagar</span>
                <div className="p-2 bg-orange-100 text-orange-800 rounded-xl">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-serif text-stone-900">
                  R$ {unpaidFiringsTotal.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs font-semibold text-orange-800 bg-orange-50 px-2 py-0.5 rounded">
                  {unpaidFirings.length} peças
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                Calculado automaticamente pelo peso x taxa do ateliê
              </p>
            </div>
          )}

          {/* Active Projects */}
          {student.permissions.canViewProjectStatus && (
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">Projetos em Produção</span>
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold font-serif text-stone-900">{studentFirings.length}</span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {readyProjects.length} prontos p/ retirar
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-2">Estágios no forno e secagem</p>
            </div>
          )}

          {/* Pix Helper Box */}
          {student.permissions.canViewFinancials && (
            <div className="bg-stone-900 text-stone-100 p-5 rounded-2xl shadow-sm border border-stone-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-300 font-bold">Pagamento via Pix</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Chave oficial do ateliê:</p>
                <p className="font-mono text-xs font-bold text-white mt-0.5 truncate">ollariaatelie@gmail.com</p>
              </div>

              <button
                onClick={handleCopyPix}
                className="mt-3 w-full py-1.5 bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center space-x-1"
              >
                {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPix ? 'Chave Copiada!' : 'Copiar Chave Pix'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabs Selection */}
      <div className="flex border-b border-stone-200 bg-stone-100 px-6 pt-3 space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-amber-800 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Visão Geral & Avisos
        </button>

        {student.permissions.canViewAttendance && (
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'attendance'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Minhas Aulas ({presentCount}/{maxClasses})
          </button>
        )}

        {student.permissions.canViewFirings && (
          <button
            onClick={() => setActiveTab('firings')}
            className={`pb-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'firings'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Minhas Queimas & Custos
          </button>
        )}

        {student.permissions.canViewProjectStatus && (
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'projects'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Meus Projetos no Ateliê ({studentFirings.length})
          </button>
        )}
      </div>

      {/* TAB CONTENT 1: OVERVIEW & ANNOUNCEMENTS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Announcements List */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="font-serif font-bold text-stone-900 text-base mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-700" />
                <span>Comunicados do Ateliê</span>
              </h3>

              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-4 rounded-xl border ${
                      ann.important
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-stone-900">{ann.title}</span>
                      <span className="text-[10px] text-stone-500 bg-white px-2 py-0.5 rounded font-mono">
                        {ann.date}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed mt-1">{ann.content}</p>
                    <p className="text-[10px] text-stone-400 mt-2">Publicado por {ann.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Student Form Registration Data & Studio Rates */}
          <div className="space-y-6">
            {/* Form Registration Data */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-800" />
                  <span>Meus Dados da Matrícula (Formulário)</span>
                </h4>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                  Inscrito em {student.enrollmentDate}
                </span>
              </div>

              <div className="divide-y divide-stone-100 text-xs space-y-2 pt-0.5">
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">Nome Completo:</span>
                  <span className="font-semibold text-stone-900 text-right">{student.name}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">E-mail Cadastrado:</span>
                  <span className="font-mono text-stone-900 text-right">{student.email}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">Telefone / WhatsApp:</span>
                  <span className="font-semibold text-stone-900 text-right">{student.phone}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">CPF:</span>
                  <span className="font-mono text-stone-800 text-right">{student.cpf}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">Plano Escolhido:</span>
                  <span className="font-bold text-amber-900 text-right">{student.monthlyPlan.name} (R$ {student.monthlyPlan.monthlyFee},00)</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">Turma / Horário:</span>
                  <span className="font-semibold text-stone-900 text-right">{student.preferredSchedule}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">Nível de Experiência:</span>
                  <span className="font-medium text-stone-800 text-right">{student.experienceLevel}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-stone-500">Contato de Emergência:</span>
                  <span className="font-semibold text-stone-900 text-right">{student.emergencyContact || 'Não informado'}</span>
                </div>
                {student.notes && (
                  <div className="pt-2">
                    <span className="text-stone-500 block mb-1">Observações da Ficha:</span>
                    <p className="text-[11px] text-stone-700 bg-stone-50 p-2 rounded border border-stone-200">
                      {student.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Studio Firing Rates */}
            <div className="bg-amber-950 text-amber-100 p-5 rounded-2xl border border-amber-800 text-xs space-y-2 shadow-sm">
              <h4 className="font-bold text-amber-200 text-sm flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Tabela de Queimas do Ateliê (R$/kg)</span>
              </h4>
              <p className="text-amber-200/90 leading-relaxed">
                • Biscoito (1ª Queima): <b className="text-white">R$ {rates.biscoitoRatePerKg.toFixed(2)}/kg</b><br />
                • Esmalte (2ª Queima): <b className="text-white">R$ {rates.esmalteRatePerKg.toFixed(2)}/kg</b><br />
                • Queima Completa (Biscoito + Esmalte): <b className="text-white">R$ {(rates.biscoitoRatePerKg + rates.esmalteRatePerKg).toFixed(2)}/kg</b>
              </p>
              <p className="text-[10px] text-amber-300/60 pt-1 border-t border-amber-900/60 mt-2">
                As peças são pesadas pelo ateliê em balança de alta precisão após a secagem.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ATTENDANCE & CLASSES */}
      {activeTab === 'attendance' && student.permissions.canViewAttendance && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Registro de Frequência do Mês (Agosto/2026)
              </h3>
              <p className="text-xs text-stone-500">
                Aulas realizadas, faltas justificadas com antecedência e saldo do seu plano.
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-bold font-serif text-amber-900">{remainingClasses}</span>
              <span className="text-xs text-stone-500 block">aulas restantes no ciclo</span>
            </div>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {currentMonthAttendance.length === 0 ? (
              <p className="text-center text-stone-400 py-6">Nenhuma aula registrada ainda para o ciclo atual.</p>
            ) : (
              currentMonthAttendance.map((rec) => (
                <div key={rec.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{rec.date} ({rec.time})</p>
                    {rec.notes && <p className="text-[11px] text-stone-500 mt-0.5">{rec.notes}</p>}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full font-bold text-xs ${
                      rec.status === 'Presença'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.status === 'Desmarcado'
                        ? 'bg-amber-100 text-amber-800'
                        : rec.status === 'Perdida'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: FIRINGS & COSTS */}
      {activeTab === 'firings' && student.permissions.canViewFirings && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Suas Peças & Custos de Queima
              </h3>
              <p className="text-xs text-stone-500">
                Acompanhe o valor de cada peça levada ao forno no ateliê.
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-bold font-serif text-amber-900">
                R$ {unpaidFiringsTotal.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs text-stone-500 block">a pagar em queimas</span>
            </div>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {studentFirings.length === 0 ? (
              <p className="text-center text-stone-400 py-6">Nenhuma peça ou queima cadastrada ainda.</p>
            ) : (
              studentFirings.map((firing) => (
                <div key={firing.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-stone-900 text-sm">{firing.pieceName}</span>
                      <span className="bg-stone-200 px-2 py-0.5 rounded text-[10px] text-stone-700 font-semibold">
                        {firing.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Peso: {firing.weightKg} kg • Tipo: {firing.type} • Estágio: <b className="text-amber-900">{firing.stage}</b>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="font-serif font-bold text-sm text-stone-900">
                      R$ {firing.totalCost.toFixed(2).replace('.', ',')}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        firing.paymentStatus === 'Pago'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {firing.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: PROJECT STAGES */}
      {activeTab === 'projects' && student.permissions.canViewProjectStatus && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Acompanhamento do Ciclo de Peças no Ateliê
            </h3>
            <p className="text-xs text-stone-500">
              Veja em qual etapa do processo cerâmico suas peças se encontram atualmente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentFirings.map((firing) => (
              <div key={firing.id} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-sm">{firing.pieceName}</h4>
                  <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                    {firing.stage}
                  </span>
                </div>

                <p className="text-xs text-stone-500">
                  {firing.category} • {firing.type} • Cadastrado em {firing.createdAt}
                </p>

                {/* Progress bar simulation */}
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-700 h-full transition-all duration-500"
                    style={{
                      width:
                        firing.stage === 'Modelagem'
                          ? '15%'
                          : firing.stage === 'Secagem'
                          ? '35%'
                          : firing.stage === '1ª Queima (Biscoito)'
                          ? '55%'
                          : firing.stage === 'Esmaltação'
                          ? '75%'
                          : firing.stage === '2ª Queima (Esmalte)'
                          ? '90%'
                          : '100%',
                    }}
                  ></div>
                </div>

                {firing.notes && (
                  <p className="text-[11px] text-stone-600 bg-white p-2 rounded border border-stone-200">
                    💡 Nota do Ateliê: {firing.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
