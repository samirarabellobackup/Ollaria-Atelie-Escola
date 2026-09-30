import React, { useState } from 'react';
import { AuditLogEntry } from '../../types';
import { History, Search, Calendar, User, Filter } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.newValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar no histórico..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Todas as categorias</option>
            <option value="Pagamento">Pagamento</option>
            <option value="Queima">Queima</option>
            <option value="Agendamento">Agendamento</option>
            <option value="Horas">Horas</option>
            <option value="Material">Material</option>
            <option value="Alteração Cadastral">Alteração Cadastral</option>
            <option value="Serviço">Serviço</option>
          </select>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="p-8 text-center text-stone-400 text-xs bg-stone-50 rounded-xl border border-stone-200">
          <History className="w-6 h-6 mx-auto mb-1 text-stone-300" />
          <p>Nenhum registro de histórico encontrado.</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 bg-white rounded-xl border border-stone-200 overflow-hidden text-xs">
          {filteredLogs.map((entry) => (
            <div key={entry.id} className="p-3.5 hover:bg-stone-50 transition space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-stone-900">{entry.category}</span>
                  {entry.userName && (
                    <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {entry.userName}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-stone-400">{entry.date}</span>
              </div>

              <p className="text-stone-700">{entry.newValue}</p>
              {entry.previousValue && (
                <p className="text-[11px] text-stone-400">
                  Anterior: <span className="line-through">{entry.previousValue}</span>
                </p>
              )}
              {entry.notes && (
                <p className="text-[11px] text-stone-500 italic">Obs: {entry.notes}</p>
              )}
              <span className="text-[10px] text-stone-400 block">Registrado por: {entry.author}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
