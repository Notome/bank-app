"use client";
import { useEffect, useState } from "react";
import { accountsApi, transactionsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeftRight, CheckCircle } from "lucide-react";

export default function TransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ id: number; newBalance: number } | null>(null);

  useEffect(() => {
    accountsApi.list().then((res) => {
      setAccounts(res.data);
      if (res.data.length > 0) setSender(res.data[0].account_number);
    });
  }, []);

  const formatMoney = (v: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(v);

  const selectedSender = accounts.find((a) => a.account_number === sender);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) { toast.error("Введите сумму"); return; }
    if (!receiver.trim()) { toast.error("Введите номер счёта получателя"); return; }
    if (sender === receiver) { toast.error("Нельзя переводить на тот же счёт"); return; }

    setLoading(true);
    try {
      const res = await transactionsApi.transfer({
        sender_account_number: sender,
        receiver_account_number: receiver,
        amount: amt,
        description: description || undefined,
      });
      setSuccess({ id: res.data.transaction_id, newBalance: res.data.sender_new_balance });
      setAmount("");
      setDescription("");
      // Refresh accounts
      const updated = await accountsApi.list();
      setAccounts(updated.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Ошибка перевода");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Перевод средств</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-green-800">Перевод выполнен</p>
            <p className="text-sm text-green-700 mt-0.5">
              Транзакция #{success.id} · Остаток: {formatMoney(success.newBalance)}
            </p>
          </div>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sender */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Счёт отправителя</label>
            {accounts.length === 0 ? (
              <p className="text-sm text-slate-400">Нет доступных счетов</p>
            ) : (
              <select
                className="input-field"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.account_number}>
                    {a.account_number} · {formatMoney(a.balance)}
                  </option>
                ))}
              </select>
            )}
            {selectedSender && (
              <p className="text-xs text-slate-400 mt-1.5">
                Доступно: <span className="font-semibold text-slate-600">{formatMoney(selectedSender.balance)}</span>
                {!selectedSender.can_withdraw && " · Снятие заблокировано"}
              </p>
            )}
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
              <ArrowLeftRight size={14} className="text-brand-500" />
            </div>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Receiver */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Счёт получателя
            </label>
            <input
              type="text"
              className="input-field font-mono"
              placeholder="20-значный номер счёта"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Сумма (₽)</label>
            <input
              type="number"
              className="input-field"
              placeholder="0"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Комментарий <span className="text-slate-400 font-normal">(необязательно)</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Назначение платежа"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={loading || accounts.length === 0}
          >
            <ArrowLeftRight size={16} />
            {loading ? "Выполняется..." : "Перевести"}
          </button>
        </form>
      </div>
    </div>
  );
}
