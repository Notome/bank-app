"use client";
import { useEffect, useState } from "react";
import { accountsApi, userApi } from "@/lib/api";
import { CreditCard, ArrowLeftRight, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userApi.profile(), accountsApi.list()])
      .then(([u, a]) => { setUser(u.data); setAccounts(a.data); })
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalCards = accounts.reduce((s, a) => s + a.cards.length, 0);

  const formatMoney = (v: number) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(v);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Загрузка...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Добро пожаловать, {user?.name} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">{user?.phone}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
            <Wallet className="text-brand-500" size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Общий баланс</p>
            <p className="text-xl font-bold text-slate-800">{formatMoney(totalBalance)}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <TrendingUp className="text-green-500" size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Счетов</p>
            <p className="text-xl font-bold text-slate-800">{accounts.length}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
            <CreditCard className="text-purple-500" size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Карт</p>
            <p className="text-xl font-bold text-slate-800">{totalCards}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Быстрые действия</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/transfer" className="btn-primary flex items-center gap-2">
            <ArrowLeftRight size={16} /> Перевести
          </Link>
          <Link href="/dashboard/accounts" className="btn-secondary flex items-center gap-2">
            <CreditCard size={16} /> Управление счетами
          </Link>
        </div>
      </div>

      {/* Accounts list */}
      {accounts.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">Ваши счета</h2>
          <div className="space-y-3">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-mono text-slate-600">{acc.account_number}</p>
                  <p className="text-xs text-slate-400 mt-0.5 capitalize">{acc.type} · {acc.cards.length} карт{acc.cards.length === 1 ? "а" : ""}</p>
                </div>
                <p className="font-bold text-slate-800">{formatMoney(acc.balance)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {accounts.length === 0 && (
        <div className="card text-center py-12">
          <CreditCard className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-medium">У вас пока нет счетов</p>
          <p className="text-slate-400 text-sm mb-4">Создайте первый счёт, чтобы начать</p>
          <Link href="/dashboard/accounts" className="btn-primary">Создать счёт</Link>
        </div>
      )}
    </div>
  );
}
