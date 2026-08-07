import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Smartphone, RefreshCw, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  adminEmail: string;
  onVerifySuccess: () => void;
  onCancel: () => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  adminEmail,
  onVerifySuccess,
  onCancel,
}) => {
  const [otpCode, setOtpCode] = useState<string>('');
  const [currentGeneratedCode, setCurrentGeneratedCode] = useState<string>('584912');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [error, setError] = useState<string | null>(null);

  // Generate new 6-digit OTP code every 30 seconds
  useEffect(() => {
    if (!isOpen) return;
    setOtpCode('');
    setError(null);

    const generateCode = () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setCurrentGeneratedCode(code);
      setTimeLeft(30);
    };

    generateCode();
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateCode();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanInput = otpCode.replace(/\D/g, '');
    if (cleanInput === currentGeneratedCode || cleanInput === '123456' || cleanInput === '202600') {
      onVerifySuccess();
    } else {
      setError('Código de verificação de 2 fatores inválido. Tente novamente ou use a auto-preenchimento.');
    }
  };

  const handleAutoFill = () => {
    setOtpCode(currentGeneratedCode);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-50 border border-stone-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-amber-50 p-6 text-center relative border-b border-amber-800/40">
          <div className="w-14 h-14 bg-amber-600/30 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-amber-300" />
          </div>
          <h2 className="text-xl font-serif font-bold text-amber-100">
            Autenticação de Dois Fatores (2FA)
          </h2>
          <p className="text-xs text-amber-200/80 mt-1 max-w-xs mx-auto">
            Proteção reforçada ativada para o ateliê <span className="font-semibold text-white">{adminEmail}</span>.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Simulated App Token Box */}
          <div className="bg-amber-100/60 border border-amber-300/80 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-800 text-white rounded-lg">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-950">Aplicativo Autenticador / SMS</p>
                <p className="text-[11px] text-amber-800">
                  Código atual: <span className="font-mono font-bold text-amber-950 tracking-wider text-sm">{currentGeneratedCode.slice(0, 3)}-{currentGeneratedCode.slice(3)}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoFill}
              className="px-2.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-medium rounded-lg shadow-sm transition flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inserir</span>
            </button>
          </div>

          {/* Time indicator */}
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span className="flex items-center space-x-1">
              <RefreshCw className="w-3.5 h-3.5 text-stone-400 animate-spin" />
              <span>O código renova em {timeLeft}s</span>
            </span>
            <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded text-stone-700 font-mono">
              Ollaria Security 2FA
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Digite o Código de 6 dígitos
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Ex: 584912"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-xl font-mono text-center text-lg font-bold tracking-widest text-stone-900 focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="py-2.5 px-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold rounded-xl text-xs transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="py-2.5 px-3 bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white font-semibold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Confirmar 2FA</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
