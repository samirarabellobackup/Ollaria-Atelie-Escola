import React, { useState } from 'react';
import { Student, ClassAttendance, ClassAttendanceStatus } from '../../types';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Plus, Search, Filter } from 'lucide-react';

interface AttendanceManagerProps {
  students: Student[];
  attendance: ClassAttendance[];
  onUpdateAttendanceStatus: (attendanceId: string, status: ClassAttendanceStatus) => void;
  onAddAttendance: (attendanceRecord: ClassAttendance) => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  students,
  attendance,
  onUpdateAttendanceStatus,
  onAddAttendance,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [newTimeSlot, setNewTimeSlot] = useState('14:00 - 17:00');

  // Attendance for selected month
  const currentMonthAttendance = attendance.filter((a) => a.monthCycle === '2026-08');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    const newRecord: ClassAttendance = {
      id: `att-${Date.now()}`,
      studentId: selectedStudentId,
      date: selectedDate,
      time: newTimeSlot,
      status: 'Presença',
      monthCycle: '2026-08',
    };

    onAddAttendance(newRecord);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Controle de Presença & Chamada de Aulas
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Lance presenças, faltas justificadas (desmarcado) ou perdas de aula para cálculo automático de reposições.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-stone-100 p-2 rounded-xl text-xs font-semibold text-stone-700">
          <Calendar className="w-4 h-4 text-amber-800" />
          <span>Ciclo Atual: Agosto/2026</span>
        </div>
      </div>

      {/* Quick Add Class Form */}
      <form onSubmit={handleQuickAdd} className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-amber-950 uppercase flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-amber-800" />
          <span>Lançar Presença Rápida na Chamada</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Selecione o Aluno</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-600 outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.preferredSchedule})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Data da Aula</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Horário da Turma</label>
            <input
              type="text"
              value={newTimeSlot}
              onChange={(e) => setNewTimeSlot(e.target.value)}
              placeholder="14:00 - 17:00"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-600 outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-lg shadow-md transition"
            >
              Confirmar Presença
            </button>
          </div>
        </div>
      </form>

      {/* Attendance Summary Grid By Student */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
        <h3 className="font-serif font-bold text-stone-900 text-base">
          Resumo de Presenças por Aluno
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student) => {
            const studentRecords = currentMonthAttendance.filter((a) => a.studentId === student.id);
            const present = studentRecords.filter((a) => a.status === 'Presença').length;
            const canceled = studentRecords.filter((a) => a.status === 'Desmarcado').length;
            const lost = studentRecords.filter((a) => a.status === 'Perdida').length;
            const totalPlanned = student.monthlyPlan.classesPerMonth;
            const remaining = Math.max(0, totalPlanned - present);

            return (
              <div key={student.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    {student.avatarUrl ? (
                      <img src={student.avatarUrl} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-900 text-amber-100 font-bold flex items-center justify-center text-xs">
                        {student.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{student.name}</h4>
                      <p className="text-[11px] text-stone-500">{student.monthlyPlan.name}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                    {remaining} aulas faltam
                  </span>
                </div>

                {/* Status Badges */}
                <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
                  <div className="bg-emerald-100/80 text-emerald-900 p-2 rounded-lg font-semibold">
                    <span>{present} Presenças</span>
                  </div>
                  <div className="bg-amber-100/80 text-amber-900 p-2 rounded-lg font-semibold">
                    <span>{canceled} Desmarcadas</span>
                  </div>
                  <div className="bg-red-100/80 text-red-900 p-2 rounded-lg font-semibold">
                    <span>{lost} Perdidas</span>
                  </div>
                </div>

                {/* Individual Record List */}
                <div className="divide-y divide-stone-200 text-xs pt-1">
                  {studentRecords.map((rec) => (
                    <div key={rec.id} className="py-2 flex items-center justify-between">
                      <span className="font-medium text-stone-800">{rec.date} ({rec.time})</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onUpdateAttendanceStatus(rec.id, 'Presença')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.status === 'Presença' ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          Presença
                        </button>

                        <button
                          onClick={() => onUpdateAttendanceStatus(rec.id, 'Desmarcado')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.status === 'Desmarcado' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          Desmarcado
                        </button>

                        <button
                          onClick={() => onUpdateAttendanceStatus(rec.id, 'Perdida')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.status === 'Perdida' ? 'bg-red-700 text-white' : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          Perdida
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
