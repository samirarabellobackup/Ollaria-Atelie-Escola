import React from 'react';
import { UserRole, Student } from '../types';
import { Flame, ShieldCheck, UserCheck, LogOut, Lock, FileSpreadsheet, Sparkles, Building2, User } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole | null;
  activeStudent: Student | null;
  isAdmin2FAVerified: boolean;
  onOpenAuth: (role: UserRole) => void;
  onLogout: () => void;
  onOpenGoogleFormsModal: () => void;
  onResetDemoData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeStudent,
  isAdmin2FAVerified,
  onOpenAuth,
  onLogout,
  onOpenGoogleFormsModal,
  onResetDemoData,
}) => {
  return (
    <header className="bg-amber-950/95 text-amber-50 backdrop-blur-md sticky top-0 z-40 border-b border-amber-800/50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white shadow-inner border border-amber-500/30">
            <Flame className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-amber-100">
                Ollaria Ateliê
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-300 border border-amber-700/60 tracking-wider">
                Cerâmica
              </span>
            </div>
            <p className="text-xs text-amber-300/80 hidden sm:block">
              Gestão de Aulas, Queimas & Portal do Aluno
            </p>
          </div>
        </div>

        {/* Right Section Actions & User Badges */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {currentRole === 'admin' && isAdmin2FAVerified && (
            <>
              <button
                onClick={onOpenGoogleFormsModal}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 transition-all shadow-sm"
                title="Importar respostas de formulário Google Forms"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Google Forms</span>
              </button>
            </>
          )}

          {/* Active Role Status */}
          {currentRole === 'admin' ? (
            <div className="flex items-center space-x-2 bg-amber-900/70 border border-amber-700/60 px-3 py-1.5 rounded-lg text-xs">
              <Building2 className="w-4 h-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="font-semibold text-amber-200">Painel do Ateliê</span>
                {isAdmin2FAVerified ? (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> 2FA Autenticado
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                    <Lock className="w-3 h-3" /> Requer 2FA
                  </span>
                )}
              </div>
            </div>
          ) : currentRole === 'student' && activeStudent ? (
            <div className="flex items-center space-x-2.5 bg-orange-950/80 border border-orange-800/60 px-3 py-1.5 rounded-lg text-xs">
              {activeStudent.avatarUrl ? (
                <img
                  src={activeStudent.avatarUrl}
                  alt={activeStudent.name}
                  className="w-7 h-7 rounded-full object-cover border border-amber-400/40"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-800 flex items-center justify-center text-amber-200 font-bold">
                  {activeStudent.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="font-semibold text-amber-100 line-clamp-1 max-w-[120px] sm:max-w-[180px]">
                  {activeStudent.name}
                </span>
                <span className="text-[10px] text-amber-300/80">Portal do Aluno</span>
              </div>
            </div>
          ) : null}

          {/* Auth Button Controls */}
          {currentRole ? (
            <button
              onClick={onLogout}
              className="p-2 text-amber-300 hover:text-amber-100 hover:bg-amber-900/60 rounded-lg border border-transparent hover:border-amber-700/50 transition-colors"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuth('student')}
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm border border-amber-600/40 transition-all flex items-center space-x-1.5"
              >
                <User className="w-4 h-4 text-amber-200" />
                <span>Portal do Aluno</span>
              </button>
            </div>
          )}

          <button
            onClick={onResetDemoData}
            className="text-[10px] text-amber-400/60 hover:text-amber-300 underline hidden lg:block ml-2"
            title="Reiniciar dados padrão do ateliê"
          >
            Resetar Dados
          </button>
        </div>
      </div>
    </header>
  );
};
