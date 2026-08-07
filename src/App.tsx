import React, { useState, useEffect } from 'react';
import { Student, ClassAttendance, FiringItem, StudioAnnouncement, StudioRates, UserRole, ClassAttendanceStatus, FiringStage } from './types';
import { StorageService } from './data/storage';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { TwoFactorModal } from './components/TwoFactorModal';
import { GoogleFormsImportModal } from './components/GoogleFormsImportModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentList } from './components/admin/StudentList';
import { AttendanceManager } from './components/admin/AttendanceManager';
import { FiringsManager } from './components/admin/FiringsManager';
import { FinancesManager } from './components/admin/FinancesManager';
import { StudentDetailModal } from './components/admin/StudentDetailModal';
import { StudentPortal } from './components/student/StudentPortal';
import { Users, Calendar, Flame, DollarSign, LayoutDashboard, ShieldCheck, FileSpreadsheet, Lock } from 'lucide-react';

export default function App() {
  // App State loaded from Storage
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [attendance, setAttendance] = useState<ClassAttendance[]>(() => StorageService.getAttendance());
  const [firings, setFirings] = useState<FiringItem[]>(() => StorageService.getFirings());
  const [announcements, setAnnouncements] = useState<StudioAnnouncement[]>(() => StorageService.getAnnouncements());
  const [rates, setRates] = useState<StudioRates>(() => StorageService.getRates());

  // Session State
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => StorageService.getAuthRole());
  const [activeStudentId, setActiveStudentId] = useState<string | null>(() => StorageService.getActiveStudentId());
  const [isAdmin2FAVerified, setIsAdmin2FAVerified] = useState<boolean>(() => StorageService.getAdmin2FAVerified());

  // Modals & Active Tab State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<UserRole>('admin');
  const [is2FAModalOpen, setIs2FAModalOpen] = useState<boolean>(false);
  const [isGoogleFormsModalOpen, setIsGoogleFormsModalOpen] = useState<boolean>(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'students' | 'attendance' | 'firings' | 'finances'>('dashboard');

  // Persistence Sync
  useEffect(() => {
    StorageService.saveStudents(students);
  }, [students]);

  useEffect(() => {
    StorageService.saveAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    StorageService.saveFirings(firings);
  }, [firings]);

  useEffect(() => {
    StorageService.saveRates(rates);
  }, [rates]);

  useEffect(() => {
    StorageService.setAuthRole(currentRole);
  }, [currentRole]);

  useEffect(() => {
    StorageService.setActiveStudentId(activeStudentId);
  }, [activeStudentId]);

  useEffect(() => {
    StorageService.setAdmin2FAVerified(isAdmin2FAVerified);
  }, [isAdmin2FAVerified]);

  // Auth Logic
  const handleOpenAuth = (role: UserRole) => {
    setAuthModalInitialRole(role);
    setIsAuthModalOpen(true);
  };

  const handleAdminLoginAttempt = (email: string, pass: string): boolean => {
    if (email === 'ollariaatelie@gmail.com' && pass === 'admin2026') {
      setIsAuthModalOpen(false);
      setIs2FAModalOpen(true);
      return true;
    }
    return false;
  };

  const handle2FAVerifiedSuccess = () => {
    setIs2FAModalOpen(false);
    setCurrentRole('admin');
    setIsAdmin2FAVerified(true);
    setActiveStudentId(null);
  };

  const handleStudentSelect = (student: Student) => {
    setCurrentRole('student');
    setActiveStudentId(student.id);
    setIsAdmin2FAVerified(false);
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setActiveStudentId(null);
    setIsAdmin2FAVerified(false);
  };

  const handleResetDemoData = () => {
    if (window.confirm('Tem certeza que deseja reiniciar os dados padrão do Ollaria Ateliê?')) {
      StorageService.resetAllData();
      window.location.reload();
    }
  };

  // State Mutation Handlers
  const handleStudentEnrolled = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);

    // Create default scheduled classes for the month
    const defaultClasses: ClassAttendance[] = [
      { id: `att-${Date.now()}-1`, studentId: newStudent.id, date: '2026-08-11', time: '14:00 - 17:00', status: 'Agendada', monthCycle: '2026-08' },
      { id: `att-${Date.now()}-2`, studentId: newStudent.id, date: '2026-08-18', time: '14:00 - 17:00', status: 'Agendada', monthCycle: '2026-08' },
      { id: `att-${Date.now()}-3`, studentId: newStudent.id, date: '2026-08-25', time: '14:00 - 17:00', status: 'Agendada', monthCycle: '2026-08' },
    ];
    setAttendance((prev) => [...prev, ...defaultClasses]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    if (selectedStudentForDetail?.id === updatedStudent.id) {
      setSelectedStudentForDetail(updatedStudent);
    }
  };

  const handleToggleStudentPermission = (studentId: string, permissionKey: keyof Student['permissions']) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            permissions: {
              ...s.permissions,
              [permissionKey]: !s.permissions[permissionKey],
            },
          };
        }
        return s;
      })
    );
  };

  const handleAddAttendance = (record: ClassAttendance) => {
    setAttendance((prev) => [record, ...prev]);
  };

  const handleUpdateAttendanceStatus = (attendanceId: string, status: ClassAttendanceStatus) => {
    setAttendance((prev) =>
      prev.map((a) => (a.id === attendanceId ? { ...a, status } : a))
    );
  };

  const handleAddFiring = (firing: FiringItem) => {
    setFirings((prev) => [firing, ...prev]);
  };

  const handleUpdateFiringStage = (firingId: string, stage: FiringStage) => {
    setFirings((prev) =>
      prev.map((f) => (f.id === firingId ? { ...f, stage } : f))
    );
  };

  const handleToggleFiringPaid = (firingId: string) => {
    setFirings((prev) =>
      prev.map((f) => {
        if (f.id === firingId) {
          const isPaid = f.paymentStatus === 'Pago';
          return {
            ...f,
            paymentStatus: isPaid ? 'A Pagar' : 'Pago',
            paidAt: isPaid ? undefined : new Date().toISOString().split('T')[0],
          };
        }
        return f;
      })
    );
  };

  const handleDeleteFiring = (firingId: string) => {
    setFirings((prev) => prev.filter((f) => f.id !== firingId));
  };

  const activeStudentObject = students.find((s) => s.id === activeStudentId) || students[0];

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col antialiased selection:bg-amber-200 selection:text-amber-900">
      
      {/* Top Navbar Header */}
      <Navbar
        currentRole={currentRole}
        activeStudent={currentRole === 'student' ? activeStudentObject : null}
        isAdmin2FAVerified={isAdmin2FAVerified}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenGoogleFormsModal={() => setIsGoogleFormsModalOpen(true)}
        onResetDemoData={handleResetDemoData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* LANDING / LOGGED OUT HERO CHOICE */}
        {!currentRole ? (
          <div className="py-6 sm:py-12 space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center space-x-2 bg-amber-200/80 text-amber-950 px-3 py-1 rounded-full text-xs font-bold border border-amber-300 shadow-sm">
                <span>🏺 Ollaria Ateliê de Cerâmica</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
                Sistema de Gestão & Portal do Aluno
              </h1>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                Selecione abaixo como deseja acessar a plataforma do ateliê.
              </p>
            </div>

            {/* Two Portal Entrance Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto pt-2">
              
              {/* Card 1: Administrative Panel */}
              <div
                onClick={() => handleOpenAuth('admin')}
                className="bg-stone-900 text-stone-100 p-8 rounded-3xl border-2 border-amber-600/80 shadow-xl hover:shadow-2xl hover:border-amber-400 transition cursor-pointer group flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 font-bold text-[10px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  Acesso Total do Ateliê
                </div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-950 text-amber-300 border border-amber-700/80 flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-inner">
                    <ShieldCheck className="w-8 h-8 text-amber-400" />
                  </div>
                  <span className="text-xs uppercase font-mono font-bold text-amber-400 tracking-wider">
                    Administração do Ateliê
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-white mt-1">
                    Painel de Controle Geral
                  </h3>
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                    Acesso completo e irrestrito para gestão administrativa, controle total de alunos, frequências, forno e finanças.
                  </p>

                  <ul className="mt-6 space-y-2.5 text-xs text-stone-200 border-t border-stone-800 pt-4">
                    <li className="flex items-center gap-2">✓ <b>Visualização Completa</b> de todos os alunos cadastrados</li>
                    <li className="flex items-center gap-2">✓ Chamada diária, reposição e histórico de faltas</li>
                    <li className="flex items-center gap-2">✓ Controle do Forno: biscoito, esmalte e queimas à pagar</li>
                    <li className="flex items-center gap-2">✓ Financeiro completo e mensalidades do ateliê</li>
                    <li className="flex items-center gap-2">✓ Importador de respostas de formulários (Google Forms)</li>
                  </ul>
                </div>

                <div className="mt-8 pt-5 border-t border-stone-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-400 group-hover:underline">Acessar Painel de Controle (Admin) →</span>
                  <Lock className="w-5 h-5 text-amber-500" />
                </div>
              </div>

              {/* Card 2: Student Portal Entrance */}
              <div
                onClick={() => handleOpenAuth('student')}
                className="bg-white text-stone-900 p-8 rounded-3xl border border-stone-200 shadow-xl hover:shadow-2xl hover:border-amber-500/80 transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-inner">
                    <Users className="w-8 h-8 text-amber-900" />
                  </div>
                  <span className="text-xs uppercase font-mono font-semibold text-amber-800">
                    Área do Aluno
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                    Portal do Aluno
                  </h3>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                    Acesso individual do aluno para consultar seus próprios dados da ficha, aulas do mês, faltas e queimas à pagar.
                  </p>

                  <ul className="mt-6 space-y-2.5 text-xs text-stone-700 border-t border-stone-100 pt-4">
                    <li className="flex items-center gap-2">✓ Ficha de matrícula com dados preenchidos no formulário</li>
                    <li className="flex items-center gap-2">✓ Aulas realizadas, agendadas e faltas do mês</li>
                    <li className="flex items-center gap-2">✓ Status das peças em modelagem, secagem e forno</li>
                    <li className="flex items-center gap-2">✓ Vencimento de mensalidade e extrato de queimas</li>
                  </ul>
                </div>

                <div className="mt-8 pt-5 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-900 group-hover:underline">Acessar Perfil do Aluno →</span>
                  <Users className="w-5 h-5 text-stone-400" />
                </div>
              </div>

            </div>
          </div>
        ) : currentRole === 'admin' ? (
          /* ADMIN PORTAL INTERFACE */
          <div className="space-y-6">
            
            {/* Sub-navigation Tabs for Admin */}
            <div className="flex border-b border-stone-200 bg-white p-2 rounded-2xl shadow-sm space-x-1 sm:space-x-2 overflow-x-auto">
              <button
                onClick={() => setActiveAdminTab('dashboard')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                  activeAdminTab === 'dashboard'
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('students')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                  activeAdminTab === 'students'
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Alunos ({students.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('attendance')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                  activeAdminTab === 'attendance'
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Presenças & Chamada</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('firings')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                  activeAdminTab === 'firings'
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Controle de Queimas</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('finances')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                  activeAdminTab === 'finances'
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Financeiro & Mensalidades</span>
              </button>
            </div>

            {/* TAB VIEWS */}
            {activeAdminTab === 'dashboard' && (
              <AdminDashboard
                students={students}
                attendance={attendance}
                firings={firings}
                announcements={announcements}
                rates={rates}
                onOpenStudentDetail={(student) => setSelectedStudentForDetail(student)}
                onNavigateTab={(tab) => setActiveAdminTab(tab)}
                onOpenGoogleFormsModal={() => setIsGoogleFormsModalOpen(true)}
              />
            )}

            {activeAdminTab === 'students' && (
              <StudentList
                students={students}
                attendance={attendance}
                firings={firings}
                onOpenStudentDetail={(student) => setSelectedStudentForDetail(student)}
                onOpenGoogleFormsModal={() => setIsGoogleFormsModalOpen(true)}
                onTogglePermission={handleToggleStudentPermission}
              />
            )}

            {activeAdminTab === 'attendance' && (
              <AttendanceManager
                students={students}
                attendance={attendance}
                onUpdateAttendanceStatus={handleUpdateAttendanceStatus}
                onAddAttendance={handleAddAttendance}
              />
            )}

            {activeAdminTab === 'firings' && (
              <FiringsManager
                students={students}
                firings={firings}
                rates={rates}
                onAddFiring={handleAddFiring}
                onUpdateFiringStage={handleUpdateFiringStage}
                onToggleFiringPaid={handleToggleFiringPaid}
                onDeleteFiring={handleDeleteFiring}
                onSaveRates={(updatedRates) => setRates(updatedRates)}
              />
            )}

            {activeAdminTab === 'finances' && (
              <FinancesManager
                students={students}
                firings={firings}
                onUpdateStudent={handleUpdateStudent}
              />
            )}
          </div>
        ) : (
          /* STUDENT PORTAL INTERFACE */
          <StudentPortal
            student={activeStudentObject}
            attendance={attendance}
            firings={firings}
            announcements={announcements}
            rates={rates}
          />
        )}
      </main>

      {/* MODALS */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialRole={authModalInitialRole}
        students={students}
        onClose={() => setIsAuthModalOpen(false)}
        onAdminLoginAttempt={handleAdminLoginAttempt}
        onStudentSelect={handleStudentSelect}
      />

      <TwoFactorModal
        isOpen={is2FAModalOpen}
        adminEmail="ollariaatelie@gmail.com"
        onVerifySuccess={handle2FAVerifiedSuccess}
        onCancel={() => setIs2FAModalOpen(false)}
      />

      <GoogleFormsImportModal
        isOpen={isGoogleFormsModalOpen}
        onClose={() => setIsGoogleFormsModalOpen(false)}
        onStudentEnrolled={handleStudentEnrolled}
        existingStudents={students}
      />

      <StudentDetailModal
        isOpen={!!selectedStudentForDetail}
        student={selectedStudentForDetail}
        attendance={attendance}
        firings={firings}
        rates={rates}
        onClose={() => setSelectedStudentForDetail(null)}
        onUpdateStudent={handleUpdateStudent}
        onAddAttendance={handleAddAttendance}
        onUpdateAttendanceStatus={handleUpdateAttendanceStatus}
        onAddFiring={handleAddFiring}
        onUpdateFiringStage={handleUpdateFiringStage}
        onToggleFiringPaid={handleToggleFiringPaid}
        onDeleteFiring={handleDeleteFiring}
      />

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-6 mt-12 border-t border-stone-800 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Ollaria Ateliê de Cerâmica • Portal do Aluno</p>
          <button
            onClick={() => handleOpenAuth('admin')}
            className="text-stone-700 hover:text-stone-400 transition-colors p-1.5 rounded-lg group flex items-center space-x-1"
            title="Acesso Privado"
          >
            <Lock className="w-3.5 h-3.5 text-stone-700 group-hover:text-stone-400 transition-colors opacity-30 group-hover:opacity-100" />
          </button>
        </div>
      </footer>
    </div>
  );
}
