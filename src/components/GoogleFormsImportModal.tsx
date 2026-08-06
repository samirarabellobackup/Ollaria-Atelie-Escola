import React, { useState } from 'react';
import { Student, MonthlyPlan } from '../types';
import { DEFAULT_PLANS, generateStudentPassword } from '../data/mockData';
import { FileSpreadsheet, PlusCircle, CheckCircle2, AlertCircle, Copy, Check, Upload, Sparkles, ExternalLink } from 'lucide-react';

interface GoogleFormsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentEnrolled: (newStudent: Student) => void;
}

export const GoogleFormsImportModal: React.FC<GoogleFormsImportModalProps> = ({
  isOpen,
  onClose,
  onStudentEnrolled,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'csv_paste'>('simulator');
  const [copiedLink, setCopiedLink] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form simulator fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    planId: DEFAULT_PLANS[0].id,
    preferredSchedule: 'Terças-feiras (14:00 às 17:00)',
    experienceLevel: 'Iniciante' as 'Iniciante' | 'Intermediário' | 'Avançado',
    emergencyContact: '',
    customPassword: '',
    notes: 'Matrícula efetuada via Formulário Google Forms.',
  });

  // CSV paste fields
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);

  if (!isOpen) return null;

  const FORM_URL = 'https://docs.google.com/forms/d/1qejqx57-7CEh9HQzSfZDERKqdMEDTAGRwQ1O1UtSnOU/edit?usp=forms_home&ouid=107887901696766227236&ths=true';
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1vkHKeBZkBDG6LDRQSRI7QYHBoCMSIc668IZ0na_WT4E/edit?gid=2091445573#gid=2091445573';

  const handleCopyFormLink = () => {
    navigator.clipboard.writeText(FORM_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSimulatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      return;
    }

    const selectedPlan = DEFAULT_PLANS.find((p) => p.id === formData.planId) || DEFAULT_PLANS[0];
    const todayISO = new Date().toISOString().split('T')[0];
    const generatedPassword = formData.customPassword.trim() || generateStudentPassword(formData.name);

    const newStudent: Student = {
      id: `std-gf-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: generatedPassword,
      phone: formData.phone.trim() || '(11) 99999-0000',
      cpf: formData.cpf.trim() || '000.000.000-00',
      enrollmentDate: todayISO,
      preferredSchedule: formData.preferredSchedule,
      emergencyContact: formData.emergencyContact.trim() || 'Não informado',
      experienceLevel: formData.experienceLevel,
      status: 'Ativo',
      googleFormsOrigin: true,
      monthlyPlan: selectedPlan,
      duesStatus: {
        currentMonth: 'Agosto/2026',
        status: 'Pendente',
        dueDate: `2026-08-${selectedPlan.dueDay < 10 ? '0' + selectedPlan.dueDay : selectedPlan.dueDay}`,
        amount: selectedPlan.monthlyFee,
        paymentHistory: [],
      },
      permissions: {
        canViewFirings: true,
        canViewFinancials: true,
        canViewProjectStatus: true,
        canViewAttendance: true,
        canRegisterAbsenceInAdvance: true,
      },
      notes: formData.notes,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
    };

    onStudentEnrolled(newStudent);
    setSuccessMessage(`Perfil de aluno "${newStudent.name}" criado! 🔑 Senha de Acesso: ${generatedPassword}`);
    
    // Reset simulator form
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      planId: DEFAULT_PLANS[0].id,
      preferredSchedule: 'Terças-feiras (14:00 às 17:00)',
      experienceLevel: 'Iniciante',
      emergencyContact: '',
      customPassword: '',
      notes: 'Matrícula efetuada via Formulário Google Forms.',
    });

    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 2000);
  };

  const handleCsvImport = () => {
    setCsvError(null);
    if (!csvText.trim()) {
      setCsvError('Cole o conteúdo CSV exportado do Google Forms/Sheets.');
      return;
    }

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) {
        setCsvError('Nenhuma linha de resposta encontrada além do cabeçalho.');
        return;
      }

      let count = 0;
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(/,|\t/).map((c) => c.replace(/^"|"$/g, '').trim());
        // Simple mapping assumption: timestamp, name, email, phone, plan, schedule, exp
        const name = cols[1] || cols[0];
        const email = cols[2] || `aluno${i}@gmail.com`;
        const phone = cols[3] || '(11) 90000-0000';

        if (name && email) {
          const plan = DEFAULT_PLANS[i % DEFAULT_PLANS.length];
          const generatedPassword = generateStudentPassword(name);
          const newStudent: Student = {
            id: `std-csv-${Date.now()}-${i}`,
            name: name,
            email: email.toLowerCase(),
            password: generatedPassword,
            phone: phone,
            enrollmentDate: new Date().toISOString().split('T')[0],
            preferredSchedule: cols[5] || 'Terças-feiras (14:00 às 17:00)',
            emergencyContact: 'Importado de CSV',
            experienceLevel: 'Iniciante',
            status: 'Ativo',
            googleFormsOrigin: true,
            monthlyPlan: plan,
            duesStatus: {
              currentMonth: 'Agosto/2026',
              status: 'Pendente',
              dueDate: '2026-08-10',
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
            notes: 'Importado via lote CSV do Google Forms.',
          };
          onStudentEnrolled(newStudent);
          count++;
        }
      }

      setSuccessMessage(`${count} novos perfis de alunos importados com sucesso!`);
      setCsvText('');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (err) {
      setCsvError('Erro ao processar o CSV. Certifique-se de usar o formato padrão do Google Forms.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-50 border border-stone-200 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-emerald-950 text-emerald-50 p-6 relative border-b border-emerald-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-300 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>

          <div className="flex items-center space-x-2 mb-1">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-900 rounded text-emerald-200">
              Inscrições & Matrículas
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-emerald-100">
            Integração Google Forms
          </h2>
          <p className="text-xs text-emerald-200/80 mt-1">
            Gere perfis automáticos de alunos a partir das respostas do seu formulário de matrícula.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-emerald-900/70 p-2.5 rounded-xl border border-emerald-700/60 flex items-center justify-between">
              <div className="truncate mr-2">
                <p className="text-[10px] uppercase font-bold text-emerald-300">Formulário de Matrícula</p>
                <p className="truncate font-mono text-[11px] text-emerald-100">{FORM_URL}</p>
              </div>
              <div className="flex space-x-1 shrink-0">
                <button
                  onClick={handleCopyFormLink}
                  className="p-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded transition"
                  title="Copiar Link do Formulário"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded transition"
                  title="Abrir Formulário em Nova Guia"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="bg-emerald-900/70 p-2.5 rounded-xl border border-emerald-700/60 flex items-center justify-between">
              <div className="truncate mr-2">
                <p className="text-[10px] uppercase font-bold text-emerald-300">Planilha de Respostas</p>
                <p className="truncate font-mono text-[11px] text-emerald-100">{SHEET_URL}</p>
              </div>
              <a
                href={SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-semibold text-[11px] flex items-center space-x-1 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Planilha</span>
              </a>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 bg-stone-100 px-6 pt-3 space-x-4">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'simulator'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Simular Preenchimento do Formulário
          </button>
          <button
            onClick={() => setActiveTab('csv_paste')}
            className={`pb-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'csv_paste'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Importar Respostas CSV / Planilha
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successMessage && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {activeTab === 'simulator' ? (
            <form onSubmit={handleSimulatorSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>Esta simulação recria o envio direto do formulário oficial de alunos.</span>
                <Sparkles className="w-4 h-4 text-amber-700" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nome Completo do Aluno *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Clara Vasconcelos"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    E-mail do Aluno *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="clara@gmail.com"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 98888-7777"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Plano de Aulas Escolhido
                  </label>
                  <select
                    value={formData.planId}
                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    {DEFAULT_PLANS.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - R$ {plan.monthlyFee}/mês
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Horário Preferencial de Aula
                  </label>
                  <input
                    type="text"
                    value={formData.preferredSchedule}
                    onChange={(e) => setFormData({ ...formData, preferredSchedule: e.target.value })}
                    placeholder="Ex: Quartas (14h às 17h)"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nível de Experiência
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceLevel: e.target.value as 'Iniciante' | 'Intermediário' | 'Avançado',
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    <option value="Iniciante">Iniciante (Nunca fiz cerâmica)</option>
                    <option value="Intermediário">Intermediário (Já fiz modelagem/torno)</option>
                    <option value="Avançado">Avançado (Autônomo com ateliê)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Contato de Emergência
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="Nome e telefone de contato"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Senha de Acesso do Aluno (Opcional - padrão: 1º e último nome + 2026)
                </label>
                <input
                  type="text"
                  value={formData.customPassword}
                  onChange={(e) => setFormData({ ...formData, customPassword: e.target.value })}
                  placeholder="Ex: marianacampos2026 (ou deixe em branco para auto-gerar)"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Gerar Perfil de Aluno</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Importação Direta da Planilha Google Sheets</span>
                </p>
                <p className="text-[11px] text-emerald-800">
                  Abra sua <a href={SHEET_URL} target="_blank" rel="noopener noreferrer" className="underline font-bold text-emerald-950">Planilha de Respostas do Google Forms</a>, selecione e copie (Ctrl+C / Cmd+C) as linhas de respostas e cole abaixo.
                </p>
                <p className="text-[11px] text-emerald-800/90 font-medium">
                  🔑 <strong>Geração Automática de Senha:</strong> Para cada e-mail importado da planilha, o sistema cria automaticamente a senha no formato do 1º + último nome + 2026 (ex: <code className="bg-emerald-100 px-1 rounded font-mono font-bold">marianacampos2026</code>) para acesso ao Portal do Aluno.
                </p>
              </div>

              {csvError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{csvError}</span>
                </div>
              )}

              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`Carimbo de data/hora,Nome Completo,E-mail,Telefone,Plano\n2026-08-01 10:00,Sofia Martins,sofia@gmail.com,(11) 97777-6666,Plano Regular`}
                className="w-full p-3 bg-white border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-stone-500">
                  Suporta separação por vírgula ou tabulação (copiado direto do Excel/Sheets).
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCsvImport}
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Processar Importação</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
