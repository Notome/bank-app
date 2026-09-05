"use client";
import { useEffect, useState } from "react";
import { accountsApi, transactionsApi } from "@/lib/api";
import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    accountsApi.list().then((res) => {
      setAccounts(res.data);
      if (res.data.length > 0) {
        setSelected(res.data[0].account_number);
        loadTx(res.data[0].account_number);
      }
    });
  }, []);

  const loadTx = async (acc: string) => {
    setLoading(true);
    try {
      const res = await transactionsApi.list(acc);
      setTransactions(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (acc: string) => {
    setSelected(acc);
    loadTx(acc);
  };

  const selectedAccount = accounts.find((a) => a.account_number === selected);

  const formatMoney = (v: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(v);

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(d));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">История операций</h1>

      {accounts.length > 0 && (
        <div className="card">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Счёт</label>
          <select
            className="input-field"
            value={selected}
            onChange={(e) => handleSelect(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.account_number}>
                {a.account_number}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-400">Загрузка...</div>
      ) : transactions.length === 0 ? (
        <div className="card text-center py-12">
          <Receipt className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500">Операций пока нет</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isOutgoing = selectedAccount
                ? tx.sender_account_id === selectedAccount.id
                : false;

              return (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isOutgoing ? "bg-red-50" : "bg-green-50"}`}>
                    {isOutgoing
                      ? <ArrowUpRight className="text-red-500" size={18} />
                      : <ArrowDownLeft className="text-green-500" size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {tx.description || (isOutgoing ? "Исходящий перевод" : "Входящий перевод")}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(tx.created_at)} · #{tx.id}
                    </p>
                  </div>
                  <p className={`font-bold text-sm flex-shrink-0 ${isOutgoing ? "text-red-600" : "text-green-600"}`}>
                    {isOutgoing ? "−" : "+"}{formatMoney(tx.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
