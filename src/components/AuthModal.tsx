import React, { useState } from 'react';
import { UserRole, Student } from '../types';
import { generateStudentPassword } from '../data/mockData';
import { Building2, User, Lock, Mail, Key, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialRole: UserRole;
  students: Student[];
  onClose: () => void;
  onAdminLoginAttempt: (email: string, pass: string) => boolean; // Returns true if credentials OK
  onStudentSelect: (student: Student) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialRole,
  students,
  onClose,
  onAdminLoginAttempt,
  onStudentSelect,
}) => {
  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);

  // Sync activeTab when initialRole changes
  React.useEffect(() => {
    setActiveTab(initialRole);
  }, [initialRole, isOpen]);
  
  // Admin form state
  const [adminEmail, setAdminEmail] = useState('ollariaatelie@gmail.com');
  const [adminPassword, setAdminPassword] = useState('admin2026');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Student form state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [studentEmailInput, setStudentEmailInput] = useState('');
  const [studentPasswordInput, setStudentPasswordInput] = useState('');
  const [showDemoPasswords, setShowDemoPasswords] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const success = onAdminLoginAttempt(adminEmail.trim().toLowerCase(), adminPassword.trim());
    if (!success) {
      setAdminError('E-mail ou senha do ateliê incorretos.');
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError(null);

    let foundStudent: Student | undefined;

    if (studentEmailInput.trim()) {
      foundStudent = students.find(
        (s) => s.email.toLowerCase() === studentEmailInput.trim().toLowerCase()
      );
      if (!foundStudent) {
        setStudentError('Nenhum aluno encontrado com este e-mail. Verifique o e-mail ou selecione na lista.');
        return;
      }
    } else {
      foundStudent = students.find((s) => s.id === selectedStudentId);
    }

    if (!foundStudent) {
      setStudentError('Por favor, selecione um aluno válido.');
      return;
    }

    // Password validation if student has password
    if (foundStudent.password && studentPasswordInput.trim()) {
      if (studentPasswordInput.trim() !== foundStudent.password) {
        setStudentError('Senha incorreta para este aluno. Tente novamente ou consulte a recepção do ateliê.');
        return;
      }
    } else if (foundStudent.password && !studentPasswordInput.trim()) {
      setStudentError('Por favor, informe sua senha de acesso ao portal.');
      return;
    }

    onStudentSelect(foundStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-50 border border-stone-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Tabs */}
        <div className="bg-stone-900 text-stone-100 p-6 pb-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 text-lg font-bold p-1 rounded-lg"
          >
            ✕
          </button>

          {/* Switcher Tabs */}
          <div className="flex bg-stone-800 p-1 rounded-xl mb-4 text-xs font-bold border border-stone-700">
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-amber-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Painel Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'student'
                  ? 'bg-amber-500 text-amber-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Portal do Aluno</span>
            </button>
          </div>
          
          <h2 className="text-xl font-serif font-bold text-amber-100">
            {activeTab === 'admin' ? 'Acesso Administrativo do Ateliê' : 'Acesso ao Portal do Aluno'}
          </h2>
          <p className="text-xs text-stone-300 mt-0.5">
            {activeTab === 'admin'
              ? 'Gestão irrestrita de alunos, turmas, forno e financeiro.'
              : 'Selecione seu perfil de aluno para consultar seus dados.'}
          </p>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'admin' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Acesso Administrativo Restrito</p>
                  <p className="text-[11px] text-amber-800/90 mt-0.5">
                    Digite suas credenciais registradas do ateliê para entrar no painel de controle.
                  </p>
                </div>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  E-mail do Ateliê
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="E-mail de acesso"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Senha Administrativa
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Senha de acesso"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white font-semibold rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2"
              >
                <span>Avançar para Verificação 2FA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="bg-stone-100 border border-stone-200 p-3 rounded-xl text-xs text-stone-700 flex items-start space-x-2">
                <User className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900">Portal Individual do Aluno</p>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Acesse seu histórico de presenças, status de queimas, mensalidades e projetos em andamento.
                  </p>
                </div>
              </div>

              {studentError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{studentError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Selecione o Aluno Matriculado
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setStudentEmailInput('');
                  }}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition"
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-3 text-stone-400 text-[11px]">ou digite seu e-mail</span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  E-mail do Aluno
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={studentEmailInput}
                    onChange={(e) => setStudentEmailInput(e.target.value)}
                    placeholder="exemplo@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Senha de Acesso Individual
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={studentPasswordInput}
                    onChange={(e) => setStudentPasswordInput(e.target.value)}
                    placeholder="Sua senha recebida na matrícula"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2"
              >
                <span>Entrar no Meu Perfil</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
