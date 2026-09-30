import React from 'react';
import { UserRole, Student } from '../types';
import { Flame, ShieldCheck, UserCheck, LogOut, Lock, Sparkles, Building2, User } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole | null;
  activeStudent: Student | null;
  isAdmin2FAVerified: boolean;
  onOpenAuth: (role: UserRole) => void;
  onLogout: () => void;
  onResetDemoData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeStudent,
  isAdmin2FAVerified,
  onOpenAuth,
  onLogout,
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
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active Role Status & Switch Controls */}
          {currentRole === 'admin' ? (
            <div className="flex items-center space-x-2 bg-amber-900/90 border border-amber-600/80 px-3 py-1.5 rounded-xl text-xs shadow-md">
              <Building2 className="w-4.5 h-4.5 text-amber-300 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-amber-100">Painel do Ateliê (Admin)</span>
                {isAdmin2FAVerified ? (
                  <span className="text-[10px] text-emerald-300 font-medium flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> 2FA Verificado
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-300 flex items-center gap-0.5">
                    <Lock className="w-3 h-3" /> Requer 2FA
                  </span>
                )}
              </div>
            </div>
          ) : currentRole === 'student' && activeStudent ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-orange-950/80 border border-orange-800/60 px-2.5 py-1.5 rounded-lg text-xs">
                {activeStudent.avatarUrl ? (
                  <img
                    src={activeStudent.avatarUrl}
                    alt={activeStudent.name}
                    className="w-6 h-6 rounded-full object-cover border border-amber-400/40"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-800 flex items-center justify-center text-amber-200 font-bold text-[10px]">
                    {activeStudent.name.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-amber-100 line-clamp-1 max-w-[100px] sm:max-w-[140px]">
                    {activeStudent.name}
                  </span>
                  <span className="text-[9px] text-amber-300/80">Portal do Aluno</span>
                </div>
              </div>

              {/* Prominent Admin Access Button even when logged in as Student */}
              <button
                onClick={() => onOpenAuth('admin')}
                className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-md border border-amber-300 transition-all flex items-center space-x-1.5"
                title="Acessar o Painel Administrativo do Ateliê"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-950" />
                <span className="hidden sm:inline">Acesso Admin</span>
              </button>
            </div>
          ) : null}

          {/* Auth Button Controls when Logged Out */}
          {!currentRole && (
            <div className="flex items-center space-x-2">
              {/* Highlighted Admin Access Button */}
              <button
                onClick={() => onOpenAuth('admin')}
                className="px-3 py-1.5 text-xs sm:text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-amber-950 hover:brightness-110 shadow-lg border border-amber-200 transition-all flex items-center space-x-1.5"
                title="Painel Administrativo do Ateliê"
              >
                <Building2 className="w-4 h-4 text-amber-950" />
                <span>Acesso Administrativo</span>
              </button>

              <button
                onClick={() => onOpenAuth('student')}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-100 border border-amber-700/60 transition-all flex items-center space-x-1"
              >
                <User className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Portal do Aluno</span>
              </button>
            </div>
          )}

          {currentRole && (
            <button
              onClick={onLogout}
              className="p-2 text-amber-300 hover:text-amber-100 hover:bg-amber-900/60 rounded-lg border border-transparent hover:border-amber-700/50 transition-colors"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <button
            onClick={onResetDemoData}
            className="text-[10px] text-amber-400/60 hover:text-amber-300 underline hidden xl:block ml-1"
            title="Reiniciar dados padrão do ateliê"
          >
            Resetar
          </button>
        </div>
      </div>
    </header>
  );
};
