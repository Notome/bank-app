import { useState } from "react";

type Transaction = {
  id: number;
  title: string;
  date: string;
  amount: number;
};

const transactionsData: Transaction[] = [
  { id: 1, title: "Amazon", date: "15 Feb 2026", amount: -120 },
  { id: 2, title: "Salary", date: "14 Feb 2026", amount: 2500 },
  { id: 3, title: "Netflix", date: "13 Feb 2026", amount: -15 },
  { id: 4, title: "Transfer from John", date: "12 Feb 2026", amount: 300 },
];

function App() {
  const [balance] = useState<number>(5420.5);

  return (
    <div className="min-h-screen bg-gray-900 flex p-6 gap-6">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex justify-center mb-10">
            <img
              src="/public/logo.png"
              alt="MyBank Logo"
              className="w-36 opacity-90"
            />
          </div>

          <nav className="space-y-3">
            {["Dashboard", "Cards", "Transfers", "Settings"].map((item, i) => (
              <button
                key={item}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition
                  ${
                    i === 0
                      ? "bg-indigo-400/30 text-indigo-200"
                      : "bg-indigo-400/10 text-gray-300 hover:bg-indigo-400/20"
                  }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <button className="mt-6 bg-indigo-400/20 hover:bg-indigo-400/30 text-gray-300 px-4 py-2.5 rounded-xl text-sm transition">
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 space-y-8">
        {/* Balance */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl shadow-xl">
          <p className="text-sm text-white/70">Current Balance</p>
          <h2 className="text-4xl font-bold text-white mt-2">
            ${balance.toLocaleString()}
          </h2>
        </div>

        {/* Cards + Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">My Card</h3>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 text-white p-6 rounded-2xl h-40 flex flex-col justify-between">
              <p className="tracking-widest text-lg">**** **** **** 1234</p>
              <div className="flex justify-between text-sm text-white/70">
                <span>12/28</span>
                <span>VISA</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {["Send", "Request", "Top Up", "Pay Bills", "MetaMask"].map(
                (action) => (
                  <button
                    key={action}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white py-3 rounded-xl font-medium transition"
                  >
                    {action}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 p-6 rounded-3xl shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">
            Recent Transactions
          </h3>

          <div className="space-y-4">
            {transactionsData.map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center border-b border-gray-700 pb-3 last:border-none"
              >
                <div>
                  <p className="font-medium text-gray-200">{tx.title}</p>
                  <p className="text-sm text-gray-400">{tx.date}</p>
                </div>
                <p
                  className={`font-semibold ${
                    tx.amount > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  ${tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
