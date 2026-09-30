import React, { useState } from 'react';
import { Student } from '../../types';
import { DEFAULT_PLANS, generateStudentPassword } from '../../data/mockData';
import { UserPlus, X, CheckCircle2, User, Mail, Phone, Calendar, ShieldCheck, Clock, FileText } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentEnrolled: (student: Student) => void;
  existingStudents: Student[];
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onStudentEnrolled,
  existingStudents,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [preferredSchedule, setPreferredSchedule] = useState('Terças-feiras (14:00 às 17:00)');
  const [selectedPlanId, setSelectedPlanId] = useState(DEFAULT_PLANS[0].id);
  const [experienceLevel, setExperienceLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Iniciante');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError('Por favor, informe o nome completo do aluno.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    // Check duplicate email
    const exists = existingStudents.some((s) => s.email.toLowerCase() === trimmedEmail);
    if (exists) {
      setError('Já existe um aluno cadastrado com este e-mail no ateliê.');
      return;
    }

    const plan = DEFAULT_PLANS.find((p) => p.id === selectedPlanId) || DEFAULT_PLANS[0];
    const generatedPassword = generateStudentPassword(trimmedName);
    const todayISO = new Date().toISOString().split('T')[0];

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      password: generatedPassword,
      phone: phone.trim() || '(11) 99999-0000',
      cpf: cpf.trim(),
      enrollmentDate: todayISO,
      preferredSchedule,
      emergencyContact: emergencyContact.trim(),
      experienceLevel,
      status: 'Ativo',
      monthlyPlan: plan,
      duesStatus: {
        currentMonth: 'Agosto/2026',
        status: 'Pendente',
        dueDate: `2026-08-${String(plan.dueDay).padStart(2, '0')}`,
        amount: plan.monthlyFee,
        paymentHistory: [],
      },
      permissions: {
        canViewFirings: true,
        canViewFinancials: true,
        canViewProjectStatus: true,
        canViewAttendance: true,
        canRegisterAbsenceInAdvance: true,
      },
      notes: notes.trim() || 'Cadastrado manualmente no ateliê.',
    };

    onStudentEnrolled(newStudent);
    setSuccessMessage(`Aluno(a) ${trimmedName} cadastrado(a) com sucesso!`);

    setTimeout(() => {
      setSuccessMessage(null);
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setCpf('');
      setEmergencyContact('');
      setNotes('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-amber-50 p-6 flex items-center justify-between border-b border-amber-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-800/80 text-amber-300 flex items-center justify-center border border-amber-600/50">
              <UserPlus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-amber-100">
                Cadastrar Novo Aluno
              </h2>
              <p className="text-xs text-amber-300/80">
                Inclusão manual de matrícula no ateliê
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-900/60 hover:bg-amber-800 text-amber-200 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-800" />
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Mariana Silva e Souza"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 focus:bg-white outline-none transition"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-amber-800" />
                E-mail para Acesso *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mariana@exemplo.com"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 focus:bg-white outline-none transition"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-800" />
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98888-7777"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 focus:bg-white outline-none transition"
              />
            </div>

            {/* CPF */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">
                CPF (Opcional)
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="123.456.789-00"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 focus:bg-white outline-none transition"
              />
            </div>

            {/* Plano Mensal */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-800" />
                Plano Mensal
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 focus:bg-white outline-none transition"
              >
                {DEFAULT_PLANS.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({plan.classesPerMonth} aulas/mês - R$ {plan.monthlyFee})
                  </option>
                ))}
              </select>
            </div>

            {/* Horário Preferido */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-800" />
                Horário da Turma
              </label>
              <select
                value={preferredSchedule}
                onChange={(e) => setPreferredSchedule(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 focus:bg-white outline-none transition"
              >
                <option value="Terças-feiras (14:00 às 17:00)">Terças-feiras (14:00 às 17:00)</option>
                <option value="Quintas-feiras (18:30 às 21:30)">Quintas-feiras (18:30 às 21:30)</option>
                <option value="Sábados (09:00 às 12:00)">Sábados (09:00 às 12:00)</option>
                <option value="Sábados (14:00 às 17:00)">Sábados (14:00 às 17:00)</option>
                <option value="Horário Flexível">Horário Flexível</option>
              </select>
            </div>

            {/* Nível de Experiência */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">
                Nível de Experiência
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 focus:bg-white outline-none transition"
              >
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>

            {/* Contato de Emergência */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-stone-700">
                Contato de Emergência (Nome e Telefone)
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Ex: Carlos (Irmão) - (11) 97777-6666"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 focus:bg-white outline-none transition"
              />
            </div>

            {/* Observações */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                Observações do Ateliê
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Foco em torno elétrico e esmaltação..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-700 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>Cadastrar Aluno</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
