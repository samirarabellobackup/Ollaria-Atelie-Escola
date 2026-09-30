import React, { useState } from 'react';
import { ProfileChangeRequest, Student } from '../../types';
import { UserCheck, Check, X, Clock, AlertCircle, Calendar, ShieldCheck, Mail, Phone } from 'lucide-react';
import { createAuditLog } from '../../data/serviceHelpers';

interface ChangeRequestsManagerProps {
  requests: ProfileChangeRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason?: string) => void;
}

export const ChangeRequestsManager: React.FC<ChangeRequestsManagerProps> = ({
  requests,
  onApproveRequest,
  onRejectRequest,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pendente' | 'Aprovado' | 'Recusado'>('Pendente');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const pendingCount = requests.filter((r) => r.status === 'Pendente').length;

  const handleConfirmReject = (id: string) => {
    onRejectRequest(id, rejectReason.trim() || undefined);
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Solicitações de Alteração Cadastral
            </h2>
            {pendingCount > 0 && (
              <span className="bg-amber-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full animate-pulse">
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Controle de segurança: usuários não editam o cadastro diretamente; as alterações entram como solicitação pendente de aprovação da administração.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          {(['Pendente', 'Aprovado', 'Recusado', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === st
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st === 'all' ? 'Todas' : st}
              {st === 'Pendente' && pendingCount > 0 && ` (${pendingCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400 text-xs shadow-sm">
          <ShieldCheck className="w-10 h-10 mx-auto text-emerald-600/50 mb-2" />
          <p className="font-semibold text-stone-700">Nenhuma solicitação encontrada neste filtro.</p>
          <p className="text-stone-400 mt-0.5">
            {filterStatus === 'Pendente'
              ? 'Todas as alterações cadastrais enviadas pelos usuários já foram revisadas.'
              : 'Não há registros disponíveis.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                req.status === 'Pendente'
                  ? 'border-amber-300 ring-2 ring-amber-100'
                  : 'border-stone-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">{req.userName}</h3>
                  <p className="text-xs text-stone-500 font-mono">{req.userEmail}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                    req.status === 'Pendente'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : req.status === 'Aprovado'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-red-100 text-red-900 border border-red-300'
                  }`}
                >
                  {req.status === 'Pendente' ? (
                    <>
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>🟡 Aguardando Aprovação</span>
                    </>
                  ) : req.status === 'Aprovado' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>🟢 Aprovado</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 text-red-600" />
                      <span>🔴 Recusado</span>
                    </>
                  )}
                </span>
              </div>

              {/* Diff Card */}
              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs space-y-2">
                <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">
                  Campo Solicitado: <b className="text-stone-800">{req.fieldLabel}</b>
                </span>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                    <span className="block text-[10px] text-stone-400 font-semibold mb-0.5">
                      Valor Atual Oficial:
                    </span>
                    <p className="font-semibold text-stone-700 truncate" title={req.currentValue}>
                      {req.currentValue || '(Vazio)'}
                    </p>
                  </div>

                  <div className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-300 text-amber-950">
                    <span className="block text-[10px] text-amber-700 font-semibold mb-0.5">
                      Novo Valor Solicitado:
                    </span>
                    <p className="font-bold text-amber-950 truncate" title={req.requestedValue}>
                      {req.requestedValue}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-[11px] text-stone-400 flex items-center justify-between border-t border-stone-100 pt-3">
                <span>Solicitado em: <b className="text-stone-600">{req.requestedAt}</b></span>
                {req.reviewedAt && (
                  <span>
                    Revisado em {req.reviewedAt} por {req.reviewedBy}
                  </span>
                )}
              </div>

              {req.rejectionReason && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  <b>Motivo da recusa:</b> {req.rejectionReason}
                </div>
              )}

              {/* Actions for Pending */}
              {req.status === 'Pendente' && (
                <div className="pt-1">
                  {rejectingId === req.id ? (
                    <div className="space-y-2 bg-red-50/50 p-3 rounded-xl border border-red-200">
                      <label className="block text-[11px] font-semibold text-red-800">
                        Motivo da recusa (opcional para o aluno):
                      </label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ex: Número incompleto, formato incorreto..."
                        className="w-full px-2.5 py-1.5 bg-white border border-red-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason('');
                          }}
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmReject(req.id)}
                          className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg shadow-sm"
                        >
                          Confirmar Recusa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRejectingId(req.id)}
                        className="py-2 px-3 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 text-xs font-bold rounded-xl border border-stone-200 hover:border-red-300 transition flex items-center justify-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Recusar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onApproveRequest(req.id)}
                        className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprovar & Atualizar</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
