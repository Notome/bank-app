"use client";
import { useEffect, useState } from "react";
import { accountsApi, cardsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { CreditCard, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const ACCOUNT_TYPES = [
  { value: "card", label: "Карточный" },
  { value: "savings", label: "Накопительный" },
  { value: "deposit", label: "Депозит" },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newType, setNewType] = useState("card");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [addingCard, setAddingCard] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await accountsApi.list();
      setAccounts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createAccount = async () => {
    setCreating(true);
    try {
      await accountsApi.create({ type: newType });
      toast.success("Счёт создан");
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Ошибка создания счёта");
    } finally {
      setCreating(false);
    }
  };

  const deleteAccount = async (acc: Account) => {
    if (acc.balance > 0) {
      toast.error("Нельзя удалить счёт с положительным балансом");
      return;
    }
    if (!confirm("Удалить счёт?")) return;
    try {
      await accountsApi.delete(acc.account_number);
      toast.success("Счёт удалён");
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Ошибка удаления");
    }
  };

  const addCard = async (account_number: string) => {
    setAddingCard(account_number);
    try {
      const res = await cardsApi.add(account_number);
      toast.success(`Карта ${res.data.card_number} выпущена`);
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Ошибка выпуска карты");
    } finally {
      setAddingCard(null);
    }
  };

  const formatMoney = (v: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(v);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Загрузка...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Счета и карты</h1>

      {/* Create account */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Открыть новый счёт</h2>
        <div className="flex gap-3 flex-wrap">
          <select
            className="input-field flex-1 min-w-[180px]"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button
            onClick={createAccount}
            disabled={creating}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            {creating ? "Создание..." : "Открыть счёт"}
          </button>
        </div>
      </div>

      {/* Accounts list */}
      {accounts.length === 0 ? (
        <div className="card text-center py-12">
          <CreditCard className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500">Счетов пока нет</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="card p-0 overflow-hidden">
              {/* Account header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(expanded === acc.id ? null : acc.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <CreditCard className="text-brand-500" size={18} />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-slate-700">{acc.account_number}</p>
                    <p className="text-xs text-slate-400 capitalize mt-0.5">{acc.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-slate-800">{formatMoney(acc.balance)}</p>
                  {expanded === acc.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>

              {/* Expanded details */}
              {expanded === acc.id && (
                <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4">
                  {/* Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-600">Карты ({acc.cards.length})</p>
                      <button
                        onClick={() => addCard(acc.account_number)}
                        disabled={addingCard === acc.account_number}
                        className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
                      >
                        <Plus size={13} />
                        {addingCard === acc.account_number ? "Выпускается..." : "Выпустить карту"}
                      </button>
                    </div>
                    {acc.cards.length === 0 ? (
                      <p className="text-xs text-slate-400">Нет привязанных карт</p>
                    ) : (
                      <div className="space-y-2">
                        {acc.cards.map((card) => (
                          <div key={card.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-slate-100">
                            <CreditCard size={15} className="text-slate-400" />
                            <span className="font-mono text-sm text-slate-700">{card.card_number}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => deleteAccount(acc)}
                      className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={15} />
                      Закрыть счёт
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
