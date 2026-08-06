import React, { useState } from 'react';
import { Student, FiringItem, FiringStage, StudioRates } from '../../types';
import { Flame, Plus, Trash2, CheckCircle2, DollarSign, Filter, Search, ShieldAlert, Sparkles } from 'lucide-react';

interface FiringsManagerProps {
  students: Student[];
  firings: FiringItem[];
  rates: StudioRates;
  onAddFiring: (firingRecord: FiringItem) => void;
  onUpdateFiringStage: (firingId: string, stage: FiringStage) => void;
  onToggleFiringPaid: (firingId: string) => void;
  onDeleteFiring: (firingId: string) => void;
  onSaveRates: (rates: StudioRates) => void;
}

export const FiringsManager: React.FC<FiringsManagerProps> = ({
  students,
  firings,
  rates,
  onAddFiring,
  onUpdateFiringStage,
  onToggleFiringPaid,
  onDeleteFiring,
  onSaveRates,
}) => {
  const [stageFilter, setStageFilter] = useState<string>('Todos');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  
  // Rate editor state
  const [biscoitoRate, setBiscoitoRate] = useState(rates.biscoitoRatePerKg);
  const [esmalteRate, setEsmalteRate] = useState(rates.esmalteRatePerKg);
  const [editingRates, setEditingRates] = useState(false);

  // New piece state
  const [pieceName, setPieceName] = useState('');
  const [category, setCategory] = useState<FiringItem['category']>('Vaso');
  const [firingType, setFiringType] = useState<FiringItem['type']>('Dupla (Biscoito + Esmalte)');
  const [weightKg, setWeightKg] = useState<number>(0.5);

  const filteredFirings = firings.filter((f) => {
    if (stageFilter !== 'Todos' && f.stage !== stageFilter) return false;
    return true;
  });

  const unpaidTotal = firings.filter((f) => f.paymentStatus === 'A Pagar').reduce((acc, f) => acc + f.totalCost, 0);

  const handleAddPiece = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pieceName.trim() || weightKg <= 0 || !selectedStudentId) return;

    let rate = rates.esmalteRatePerKg;
    if (firingType === 'Biscoito') rate = rates.biscoitoRatePerKg;
    if (firingType === 'Dupla (Biscoito + Esmalte)') rate = rates.biscoitoRatePerKg + rates.esmalteRatePerKg;

    const totalCost = Number((weightKg * rate).toFixed(2));

    const newFiring: FiringItem = {
      id: `fir-${Date.now()}`,
      studentId: selectedStudentId,
      pieceName: pieceName.trim(),
      category,
      type: firingType,
      weightKg: Number(weightKg),
      unitCostPerKg: rate,
      totalCost,
      paymentStatus: 'A Pagar',
      stage: '1ª Queima (Biscoito)',
      createdAt: new Date().toISOString().split('T')[0],
      notes: 'Cadastrado no controle de queimas.',
    };

    onAddFiring(newFiring);
    setPieceName('');
    setWeightKg(0.5);
  };

  const handleSaveRatesForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRates({
      ...rates,
      biscoitoRatePerKg: Number(biscoitoRate),
      esmalteRatePerKg: Number(esmalteRate),
    });
    setEditingRates(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-600" />
            <span>Controle de Queimas & Custo de Peças</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Cálculo automático de custo de queima x peso da peça (kg) com acompanhamento do ciclo do forno.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs">
          <div>
            <p className="font-bold text-amber-950">A Receber em Queimas:</p>
            <p className="text-lg font-extrabold text-amber-900">R$ {unpaidTotal.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      </div>

      {/* Rates Config Box */}
      <div className="bg-stone-900 text-stone-100 p-5 rounded-2xl border border-stone-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-bold text-sm text-amber-100">
              Taxas de Queima por Quilo (R$ / kg)
            </h3>
          </div>
          <button
            onClick={() => setEditingRates(!editingRates)}
            className="text-xs text-amber-400 hover:underline"
          >
            {editingRates ? 'Fechar Edição' : 'Editar Valores'}
          </button>
        </div>

        {editingRates ? (
          <form onSubmit={handleSaveRatesForm} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Taxa Biscoito (R$/kg)</label>
              <input
                type="number"
                step="1"
                value={biscoitoRate}
                onChange={(e) => setBiscoitoRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-stone-800 border border-stone-700 rounded text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-stone-300 mb-1">Taxa Esmalte (R$/kg)</label>
              <input
                type="number"
                step="1"
                value={esmalteRate}
                onChange={(e) => setEsmalteRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-stone-800 border border-stone-700 rounded text-xs text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded"
              >
                Salvar Taxas
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-stone-800 p-2.5 rounded-xl border border-stone-700">
              <span className="text-[10px] text-stone-400">Taxa Biscoito</span>
              <p className="font-bold text-white text-sm">R$ {rates.biscoitoRatePerKg.toFixed(2)} / kg</p>
            </div>
            <div className="bg-stone-800 p-2.5 rounded-xl border border-stone-700">
              <span className="text-[10px] text-stone-400">Taxa Esmalte</span>
              <p className="font-bold text-white text-sm">R$ {rates.esmalteRatePerKg.toFixed(2)} / kg</p>
            </div>
            <div className="bg-stone-800 p-2.5 rounded-xl border border-stone-700 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-stone-400">Taxa Dupla (Biscoito + Esmalte)</span>
              <p className="font-bold text-amber-300 text-sm">
                R$ {(rates.biscoitoRatePerKg + rates.esmalteRatePerKg).toFixed(2)} / kg
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Firing Form */}
      <form onSubmit={handleAddPiece} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-amber-800" />
          <span>Cadastrar Nova Peça para Queima</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Aluno Proprietário</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-600 outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Nome da Peça</label>
            <input
              type="text"
              required
              value={pieceName}
              onChange={(e) => setPieceName(e.target.value)}
              placeholder="Ex: Vaso Orgânico"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Tipo de Queima</label>
            <select
              value={firingType}
              onChange={(e) => setFiringType(e.target.value as FiringItem['type'])}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-600 outline-none"
            >
              <option value="Dupla (Biscoito + Esmalte)">Dupla (Biscoito + Esmalte)</option>
              <option value="Biscoito">Biscoito</option>
              <option value="Esmalte">Esmalte</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Peso da Balança (kg)</label>
            <input
              type="number"
              step="0.05"
              min="0.05"
              required
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-600 outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-lg shadow-md transition"
            >
              Salvar Peça
            </button>
          </div>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {['Todos', 'Secagem', '1ª Queima (Biscoito)', 'Esmaltação', '2ª Queima (Esmalte)', 'Concluído (Pronto p/ Retirar)'].map(
          (stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
                stageFilter === stage
                  ? 'bg-amber-900 text-white shadow-sm'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {stage}
            </button>
          )
        )}
      </div>

      {/* Firings Main Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-stone-100 border-b border-stone-200 flex items-center justify-between">
          <span className="font-serif font-bold text-sm text-stone-900">
            Todas as Peças Registradas no Ateliê ({filteredFirings.length})
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {filteredFirings.map((firing) => {
            const student = students.find((s) => s.id === firing.studentId);

            return (
              <div key={firing.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-amber-50/50">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-stone-900 text-sm">{firing.pieceName}</span>
                    <span className="bg-stone-200 px-2 py-0.5 rounded text-[10px] font-semibold text-stone-700">
                      {firing.category}
                    </span>
                    <span className="text-xs font-bold text-amber-900">
                      R$ {firing.totalCost.toFixed(2).replace('.', ',')} ({firing.weightKg} kg)
                    </span>
                  </div>

                  <p className="text-xs text-stone-600">
                    Aluno: <b className="text-stone-900">{student?.name || 'Aluno Desconhecido'}</b> • Tipo: {firing.type}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <select
                    value={firing.stage}
                    onChange={(e) => onUpdateFiringStage(firing.id, e.target.value as FiringStage)}
                    className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-amber-600 outline-none"
                  >
                    <option value="Modelagem">Modelagem</option>
                    <option value="Secagem">Secagem Prateleira</option>
                    <option value="1ª Queima (Biscoito)">1ª Queima (Biscoito)</option>
                    <option value="Esmaltação">Esmaltação</option>
                    <option value="2ª Queima (Esmalte)">2ª Queima (Esmalte)</option>
                    <option value="Concluído (Pronto p/ Retirar)">Pronto para Retirar</option>
                  </select>

                  <button
                    onClick={() => onToggleFiringPaid(firing.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-sm ${
                      firing.paymentStatus === 'Pago'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-800 text-white hover:bg-amber-900'
                    }`}
                  >
                    {firing.paymentStatus === 'Pago' ? '✓ Pago' : 'Pagar Queima'}
                  </button>

                  <button
                    onClick={() => onDeleteFiring(firing.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
