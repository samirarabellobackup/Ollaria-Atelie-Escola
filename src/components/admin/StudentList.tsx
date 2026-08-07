import React, { useState } from 'react';
import { Student, ClassAttendance, FiringItem } from '../../types';
import { Search, Plus, FileSpreadsheet, Lock, Eye, ShieldCheck, Phone, Mail, Calendar, Flame, AlertCircle, CheckCircle2, ChevronRight, Filter, Users } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  attendance: ClassAttendance[];
  firings: FiringItem[];
  onOpenStudentDetail: (student: Student) => void;
  onOpenGoogleFormsModal: () => void;
  onTogglePermission: (studentId: string, permissionKey: keyof Student['permissions']) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  attendance,
  firings,
  onOpenStudentDetail,
  onOpenGoogleFormsModal,
  onTogglePermission,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativo' | 'Vencido' | 'GoogleForms'>('Todos');

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm);

    if (!matchesSearch) return false;

    if (statusFilter === 'Ativo') return student.status === 'Ativo';
    if (statusFilter === 'Vencido') return student.duesStatus.status === 'Vencido';
    if (statusFilter === 'GoogleForms') return student.googleFormsOrigin === true;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Alunos Matriculados no Ateliê
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Gerencie cada perfil de aluno, inclua presenças, queimas e ajuste o que cada aluno pode visualizar no portal.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenGoogleFormsModal}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Importar do Google Forms</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-100 p-3 rounded-xl border border-stone-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-600 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-stone-500 font-medium flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>

          <button
            onClick={() => setStatusFilter('Todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
              statusFilter === 'Todos' ? 'bg-amber-800 text-white shadow-sm' : 'bg-white text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todos ({students.length})
          </button>

          <button
            onClick={() => setStatusFilter('Vencido')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
              statusFilter === 'Vencido' ? 'bg-red-800 text-white shadow-sm' : 'bg-white text-red-700 hover:bg-red-50'
            }`}
          >
            Vencidos ({students.filter((s) => s.duesStatus.status === 'Vencido').length})
          </button>

          <button
            onClick={() => setStatusFilter('GoogleForms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
              statusFilter === 'GoogleForms' ? 'bg-emerald-800 text-white shadow-sm' : 'bg-white text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            Google Forms ({students.filter((s) => s.googleFormsOrigin).length})
          </button>
        </div>
      </div>

      {/* Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-serif font-bold text-stone-900">
              {students.length === 0 ? 'Nenhum Aluno Cadastrado' : 'Nenhum Aluno Encontrado'}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {students.length === 0
                ? 'O cadastro de alunos está completamente zerado. Você pode iniciar sincronizando a planilha do Google Forms ou incluindo alunos manualmente.'
                : 'Nenhum aluno corresponde aos critérios de busca ou filtros selecionados.'}
            </p>
          </div>
          {students.length === 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenGoogleFormsModal}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>Sincronizar Google Forms / Planilha</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => {
            // Attendance stats for student
            const studentAttendance = attendance.filter((a) => a.studentId === student.id && a.monthCycle === '2026-08');
            const presentCount = studentAttendance.filter((a) => a.status === 'Presença').length;
            const totalPlanned = student.monthlyPlan.classesPerMonth;
            const remainingClasses = Math.max(0, totalPlanned - presentCount);

            // Student unpaid firings
            const studentFirings = firings.filter((f) => f.studentId === student.id);
            const unpaidFirings = studentFirings.filter((f) => f.paymentStatus === 'A Pagar');
            const totalUnpaidCost = unpaidFirings.reduce((sum, f) => sum + f.totalCost, 0);

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-stone-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-amber-300 shadow-sm"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-amber-900 text-amber-100 font-bold text-lg flex items-center justify-center">
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-stone-900 text-sm line-clamp-1">{student.name}</h3>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-stone-400" />
                          <span className="truncate max-w-[160px]">{student.email}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        student.duesStatus.status === 'Pago'
                          ? 'bg-emerald-100 text-emerald-800'
                          : student.duesStatus.status === 'Vencido'
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {student.duesStatus.status}
                    </span>
                  </div>

                  {/* Plan & Schedule */}
                  <div className="mt-4 p-2.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 font-medium">Plano Atual:</span>
                      <span className="font-bold text-stone-800">{student.monthlyPlan.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 font-medium">Horário:</span>
                      <span className="text-stone-700 text-[11px] font-semibold">{student.preferredSchedule}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="p-4 bg-amber-50/50 grid grid-cols-2 gap-2 text-xs border-b border-stone-100">
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <p className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-700" /> Aulas no Mês
                    </p>
                    <p className="text-sm font-bold text-stone-900 mt-0.5">
                      {presentCount} feitas / {remainingClasses} faltam
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                    <p className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-600" /> Queimas a Pagar
                    </p>
                    <p className="text-sm font-bold text-amber-950 mt-0.5">
                      R$ {totalUnpaidCost.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>

                {/* Permissions Control Toggles */}
                <div className="p-4 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    Permissões de Acesso do Aluno
                  </p>
                  
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <label className="flex items-center space-x-1.5 cursor-pointer bg-stone-50 p-1.5 rounded hover:bg-stone-100">
                      <input
                        type="checkbox"
                        checked={student.permissions.canViewAttendance}
                        onChange={() => onTogglePermission(student.id, 'canViewAttendance')}
                        className="rounded text-amber-800 focus:ring-amber-700"
                      />
                      <span className="text-stone-700">Ver Presenças</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer bg-stone-50 p-1.5 rounded hover:bg-stone-100">
                      <input
                        type="checkbox"
                        checked={student.permissions.canViewFirings}
                        onChange={() => onTogglePermission(student.id, 'canViewFirings')}
                        className="rounded text-amber-800 focus:ring-amber-700"
                      />
                      <span className="text-stone-700">Ver Queimas</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer bg-stone-50 p-1.5 rounded hover:bg-stone-100">
                      <input
                        type="checkbox"
                        checked={student.permissions.canViewProjectStatus}
                        onChange={() => onTogglePermission(student.id, 'canViewProjectStatus')}
                        className="rounded text-amber-800 focus:ring-amber-700"
                      />
                      <span className="text-stone-700">Ver Projetos</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer bg-stone-50 p-1.5 rounded hover:bg-stone-100">
                      <input
                        type="checkbox"
                        checked={student.permissions.canViewFinancials}
                        onChange={() => onTogglePermission(student.id, 'canViewFinancials')}
                        className="rounded text-amber-800 focus:ring-amber-700"
                      />
                      <span className="text-stone-700">Ver Financeiro</span>
                    </label>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
                  {student.googleFormsOrigin ? (
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <FileSpreadsheet className="w-3 h-3" /> Origem Google Forms
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500">Matrícula Direta</span>
                  )}

                  <button
                    onClick={() => onOpenStudentDetail(student)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-stone-900 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1"
                  >
                    <span>Abrir Perfil Completo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
