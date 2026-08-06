import React, { useState } from 'react';
import { Student, FiringItem } from '../../types';
import { DollarSign, ShieldAlert, CheckCircle2, Clock, Send, FileSpreadsheet, TrendingUp, Sparkles } from 'lucide-react';

interface FinancesManagerProps {
  students: Student[];
  firings: FiringItem[];
  onUpdateStudent: (updatedStudent: Student) => void;
}

export const FinancesManager: React.FC<FinancesManagerProps> = ({
  students,
  firings,
  onUpdateStudent,
}) => {
  const [filter, setFilter] = useState<'Todos' | 'Pago' | 'Pendente' | 'Vencido'>('Todos');

  // Calculations
  const paidStudents = students.filter((s) => s.duesStatus.status === 'Pago');
  const pendingStudents = students.filter((s) => s.duesStatus.status === 'Pendente');
  const overdueStudents = students.filter((s) => s.duesStatus.status === 'Vencido');

  const totalTuitionRevenue = paidStudents.reduce((sum, s) => sum + s.duesStatus.amount, 0);
  const totalPendingTuition = [...pendingStudents, ...overdueStudents].reduce((sum, s) => sum + s.duesStatus.amount, 0);

  const paidFiringsTotal = firings.filter((f) => f.paymentStatus === 'Pago').reduce((sum, f) => sum + f.totalCost, 0);
  const pendingFiringsTotal = firings.filter((f) => f.paymentStatus === 'A Pagar').reduce((sum, f) => sum + f.totalCost, 0);

  const filteredStudents = students.filter((s) => {
    if (filter === 'Todos') return true;
    return s.duesStatus.status === filter;
  });

  const handleUpdateStatus = (student: Student, newStatus: 'Pago' | 'Pendente' | 'Vencido') => {
    onUpdateStudent({
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
    });
  };

  const handleSendReminder = (student: Student) => {
    const text = `Olá ${student.name}! 👋 Lembramos que a sua mensalidade do Ollaria Ateliê (${student.duesStatus.currentMonth}) no valor de R$ ${student.duesStatus.amount} está com vencimento para ${student.duesStatus.dueDate}. Chave Pix do Ateliê: ollariaatelie@gmail.com. Obrigado! 🏺`;
    window.open(`https://wa.me/55${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-700" />
            <span>Controle Financeiro & Vencimentos das Mensalidades</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Acompanhamento de mensalidades pagas, pendentes, vencimentos do mês e receitas de queimas.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-950">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span>Mês de Referência: Agosto/2026</span>
        </div>
      </div>

      {/* KPI Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-md border border-emerald-800">
          <span className="text-xs text-emerald-300 font-semibold">Mensalidades Recebidas</span>
          <p className="text-3xl font-bold font-serif text-white mt-1">
            R$ {totalTuitionRevenue.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[11px] text-emerald-200/80 mt-2">{paidStudents.length} alunos em dia</p>
        </div>

        <div className="bg-amber-900 text-amber-50 p-5 rounded-2xl shadow-md border border-amber-800">
          <span className="text-xs text-amber-300 font-semibold">Mensalidades A Receber</span>
          <p className="text-3xl font-bold font-serif text-amber-100 mt-1">
            R$ {totalPendingTuition.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[11px] text-amber-200/80 mt-2">
            {pendingStudents.length} pendentes | {overdueStudents.length} vencidos
          </p>
        </div>

        <div className="bg-stone-900 text-stone-100 p-5 rounded-2xl shadow-md border border-stone-800">
          <span className="text-xs text-stone-400 font-semibold">Receita de Queimas Pagas</span>
          <p className="text-2xl font-bold font-serif text-emerald-400 mt-1">
            R$ {paidFiringsTotal.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[11px] text-stone-400 mt-2">Peças acertadas no balcão</p>
        </div>

        <div className="bg-stone-900 text-stone-100 p-5 rounded-2xl shadow-md border border-stone-800">
          <span className="text-xs text-stone-400 font-semibold">Queimas A Pagar</span>
          <p className="text-2xl font-bold font-serif text-amber-400 mt-1">
            R$ {pendingFiringsTotal.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[11px] text-stone-400 mt-2">Peças entregues/em forno</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center space-x-2">
        {(['Todos', 'Pago', 'Pendente', 'Vencido'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === st
                ? 'bg-amber-900 text-white shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {st} ({students.filter((s) => (st === 'Todos' ? true : s.duesStatus.status === st)).length})
          </button>
        ))}
      </div>

      {/* Dues List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-stone-100 border-b border-stone-200 flex items-center justify-between">
          <span className="font-serif font-bold text-sm text-stone-900">
            Controle Individual de Mensalidade
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {filteredStudents.map((student) => (
            <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-stone-900 text-sm">{student.name}</span>
                  <span className="text-xs text-stone-500">({student.email})</span>
                </div>
                <p className="text-xs text-stone-600">
                  Plano: <b>{student.monthlyPlan.name}</b> • Valor: <b>R$ {student.duesStatus.amount}</b> • Vencimento: <b>{student.duesStatus.dueDate}</b>
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    student.duesStatus.status === 'Pago'
                      ? 'bg-emerald-100 text-emerald-800'
                      : student.duesStatus.status === 'Vencido'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {student.duesStatus.status}
                </span>

                <button
                  onClick={() => handleUpdateStatus(student, 'Pago')}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-sm transition"
                >
                  PAGO
                </button>

                <button
                  onClick={() => handleSendReminder(student)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                  title="Enviar cobrança/lembrete no WhatsApp"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
