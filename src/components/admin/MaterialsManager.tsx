import React, { useState } from 'react';
import { Student, MaterialRecord, ServiceType, SERVICE_TYPES } from '../../types';
import { Package, Plus, DollarSign, Calendar, User, Search, Trash2, CheckCircle2, Clock, Filter, AlertCircle } from 'lucide-react';
import { ensureUserServices } from '../../data/serviceHelpers';

interface MaterialsManagerProps {
  students: Student[];
  materials: MaterialRecord[];
  onAddMaterial: (material: MaterialRecord) => void;
  onUpdateMaterial: (material: MaterialRecord) => void;
  onDeleteMaterial: (id: string) => void;
}

const COMMON_MATERIALS = [
  { name: 'Argila Terracota (Tabatinga)', defaultUnit: 'kg', defaultPrice: 15 },
  { name: 'Argila Shiro (Branca)', defaultUnit: 'kg', defaultPrice: 22 },
  { name: 'Argila Negra', defaultUnit: 'kg', defaultPrice: 28 },
  { name: 'Esmalte Artesanal (Imersão)', defaultUnit: 'g', defaultPrice: 0.15 },
  { name: 'Esmalte Líquido Pincelável', defaultUnit: 'unidade', defaultPrice: 45 },
  { name: 'Engobe Colorido', defaultUnit: 'unidade', defaultPrice: 25 },
  { name: 'Pigmento Cerâmico', defaultUnit: 'g', defaultPrice: 0.40 },
  { name: 'Gesso Cerâmico p/ Molde', defaultUnit: 'kg', defaultPrice: 12 },
  { name: 'Material de Apoio / Queima', defaultUnit: 'unidade', defaultPrice: 20 },
  { name: 'Ferramenta Consumível (Lixa/Esponja)', defaultUnit: 'unidade', defaultPrice: 8 },
];

export const MaterialsManager: React.FC<MaterialsManagerProps> = ({
  students,
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompensation, setFilterCompensation] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');

  // New Material Form State
  const [selectedUserId, setSelectedUserId] = useState<string>(students[0]?.id || '');
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>('aluno_regular');
  const [materialName, setMaterialName] = useState(COMMON_MATERIALS[0].name);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>(COMMON_MATERIALS[0].defaultUnit);
  const [unitPrice, setUnitPrice] = useState<number>(COMMON_MATERIALS[0].defaultPrice);
  const [compensationType, setCompensationType] = useState<'Cobrar' | 'Repor' | 'Incluído no serviço'>('Cobrar');
  const [paymentStatus, setPaymentStatus] = useState<'Pendente' | 'Pago'>('Pendente');
  const [notes, setNotes] = useState('');

  const selectedUser = students.find((s) => s.id === selectedUserId);
  const userServices = selectedUser ? ensureUserServices(selectedUser) : [];

  const handleSelectPredefined = (name: string) => {
    const found = COMMON_MATERIALS.find((m) => m.name === name);
    if (found) {
      setMaterialName(found.name);
      setUnit(found.defaultUnit);
      setUnitPrice(found.defaultPrice);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const totalPrice = Number((quantity * unitPrice).toFixed(2));
    const newRecord: MaterialRecord = {
      id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: selectedUser.id,
      userName: selectedUser.name,
      serviceType: selectedServiceType,
      materialName: materialName.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      unitPrice: Number(unitPrice),
      totalPrice,
      date: new Date().toISOString().split('T')[0],
      compensationType,
      paymentStatus: compensationType === 'Cobrar' ? paymentStatus : undefined,
      paidAt: compensationType === 'Cobrar' && paymentStatus === 'Pago' ? new Date().toISOString().split('T')[0] : undefined,
      notes: notes.trim() || undefined,
    };

    onAddMaterial(newRecord);
    setIsModalOpen(false);
    // Reset form
    setQuantity(1);
    setNotes('');
  };

  // Filtered List
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = 
      m.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesComp = filterCompensation === 'all' || m.compensationType === filterCompensation;
    const matchesUser = filterUser === 'all' || m.userId === filterUser;
    return matchesSearch && matchesComp && matchesUser;
  });

  // KPI calculations
  const totalBilled = materials
    .filter((m) => m.compensationType === 'Cobrar')
    .reduce((sum, m) => sum + m.totalPrice, 0);
  const totalPaid = materials
    .filter((m) => m.compensationType === 'Cobrar' && m.paymentStatus === 'Pago')
    .reduce((sum, m) => sum + m.totalPrice, 0);
  const totalPending = totalBilled - totalPaid;
  const countToReplace = materials.filter((m) => m.compensationType === 'Repor').length;
  const countIncluded = materials.filter((m) => m.compensationType === 'Incluído no serviço').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Controle de Materiais & Insumos Utilizados
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Registro de argila, esmaltes, engobes e insumos consumidos em qualquer serviço com regra de compensação (Cobrar, Repor ou Incluído).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Uso de Material</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-semibold text-stone-500">Total a Cobrar</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-stone-900">
              R$ {totalBilled.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Cobrança Ativa
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Pago: <b className="text-emerald-700">R$ {totalPaid.toFixed(2).replace('.', ',')}</b> | Pendente: <b className="text-red-700">R$ {totalPending.toFixed(2).replace('.', ',')}</b>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-semibold text-stone-500">Materiais a Repor</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-orange-950">{countToReplace}</span>
            <span className="text-xs font-semibold text-orange-800 bg-orange-50 px-2 py-0.5 rounded">
              Reposição Física
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Materiais que o usuário trará para o ateliê</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-semibold text-stone-500">Insumos Incluídos</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-stone-900">{countIncluded}</span>
            <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
              Incluso no Serviço
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Sem cobrança adicional ao usuário</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs font-semibold text-stone-500">Registros Totais</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-stone-900">{materials.length}</span>
            <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
              Histórico
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Consumo mapeado por pessoa e serviço</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar material ou usuário..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-stone-500">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>Compensação:</span>
          </div>
          <select
            value={filterCompensation}
            onChange={(e) => setFilterCompensation(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-700"
          >
            <option value="all">Todas as compensações</option>
            <option value="Cobrar">Cobrar</option>
            <option value="Repor">Repor</option>
            <option value="Incluído no serviço">Incluído no serviço</option>
          </select>

          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-700 max-w-[200px]"
          >
            <option value="all">Todos os usuários</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {filteredMaterials.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            <Package className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p>Nenhum registro de material encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Usuário & Serviço</th>
                  <th className="px-4 py-3">Material & Qtd</th>
                  <th className="px-4 py-3">Valor Unit. / Total</th>
                  <th className="px-4 py-3">Compensação</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMaterials.map((m) => {
                  const sInfo = SERVICE_TYPES[m.serviceType] || { name: m.serviceType, badgeColor: 'bg-stone-100 text-stone-800' };
                  return (
                    <tr key={m.id} className="hover:bg-stone-50/80 transition">
                      <td className="px-4 py-3 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                        {m.date}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-stone-900">{m.userName}</p>
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${sInfo.badgeColor}`}>
                          {sInfo.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-stone-900">{m.materialName}</p>
                        <p className="text-[11px] text-stone-500">
                          {m.quantity} {m.unit}
                          {m.notes && <span className="italic text-stone-400 ml-1">({m.notes})</span>}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-serif font-bold text-stone-900">
                          R$ {m.totalPrice.toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          (R$ {m.unitPrice.toFixed(2).replace('.', ',')} / {m.unit})
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            m.compensationType === 'Cobrar'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : m.compensationType === 'Repor'
                              ? 'bg-orange-100 text-orange-900 border border-orange-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {m.compensationType}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {m.compensationType === 'Cobrar' ? (
                          <button
                            onClick={() =>
                              onUpdateMaterial({
                                ...m,
                                paymentStatus: m.paymentStatus === 'Pago' ? 'Pendente' : 'Pago',
                                paidAt: m.paymentStatus === 'Pago' ? undefined : new Date().toISOString().split('T')[0],
                              })
                            }
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center space-x-1 ${
                              m.paymentStatus === 'Pago'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                            title="Clique para alternar status de pagamento"
                          >
                            {m.paymentStatus === 'Pago' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Pago</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-red-600" />
                                <span>Pendente</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">Não cobrável</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (window.confirm(`Excluir registro de material "${m.materialName}"?`)) {
                              onDeleteMaterial(m.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal to Register Material */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-amber-50 p-6 flex items-center justify-between border-b border-amber-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-800/80 text-amber-300 flex items-center justify-center border border-amber-600/50">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-100">
                    Registrar Consumo de Material
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    Vincule o insumo utilizado ao usuário e seu serviço correspondente
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-amber-300 hover:text-white p-1 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              {/* Select User */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Usuário do Ateliê *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    const user = students.find((s) => s.id === e.target.value);
                    if (user) {
                      const uServices = ensureUserServices(user);
                      if (uServices.length > 0) {
                        setSelectedServiceType(uServices[0].type);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-amber-700"
                  required
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Service Type for this User */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Serviço Relacionado *
                </label>
                <select
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value as ServiceType)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-amber-700"
                >
                  {userServices.map((us) => {
                    const meta = SERVICE_TYPES[us.type];
                    return (
                      <option key={us.type} value={us.type}>
                        {meta.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Predefined Quick Selection */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Insumos Frequentes do Ateliê
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-stone-50 border border-stone-200 rounded-xl">
                  {COMMON_MATERIALS.map((cm) => (
                    <button
                      type="button"
                      key={cm.name}
                      onClick={() => handleSelectPredefined(cm.name)}
                      className={`px-2 py-1 rounded text-[10px] font-medium border transition ${
                        materialName === cm.name
                          ? 'bg-amber-800 text-white border-amber-800'
                          : 'bg-white text-stone-700 border-stone-300 hover:border-amber-600'
                      }`}
                    >
                      {cm.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Name */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nome do Material / Insumo *
                </label>
                <input
                  type="text"
                  required
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>

              {/* Quantity, Unit, Unit Price */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Unidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="kg, g, un"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Valor Unit. (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-700 font-bold"
                  />
                </div>
              </div>

              {/* Calculation Preview */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-950 font-semibold">
                <span>Total Calculado:</span>
                <span className="font-serif text-base font-bold text-amber-900">
                  R$ {(quantity * unitPrice).toFixed(2).replace('.', ',')}
                </span>
              </div>

              {/* Forma de Compensação */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Forma de Compensação *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Cobrar', 'Repor', 'Incluído no serviço'] as const).map((comp) => (
                    <button
                      type="button"
                      key={comp}
                      onClick={() => setCompensationType(comp)}
                      className={`py-2 px-1 text-center font-bold text-[11px] rounded-xl border transition ${
                        compensationType === comp
                          ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
                          : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              {compensationType === 'Cobrar' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Status Inicial da Cobrança
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentStatus('Pendente')}
                      className={`flex-1 py-1.5 rounded-lg border font-semibold text-xs ${
                        paymentStatus === 'Pendente'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      Pendente (Entra no Saldo)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentStatus('Pago')}
                      className={`flex-1 py-1.5 rounded-lg border font-semibold text-xs ${
                        paymentStatus === 'Pago'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      Já Pago no Ato
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Observações
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Peça decorativa grande, esmaltação especial..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl shadow-md transition"
                >
                  Registrar Consumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
