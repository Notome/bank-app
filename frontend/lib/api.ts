import axios from "axios";
import Cookies from "js-cookie";

// Пустая строка = относительные URLs, запросы идут через Nginx на тот же хост
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (phone: string, password: string) =>
    api.post<{ access_token: string }>("/api/login", { phone, password }),

  register: (name: string, phone: string, password: string) =>
    api.post<{ access_token: string }>("/api/register", { name, phone, password }),
};

export const userApi = {
  profile: () => api.get<{ id: number; name: string; phone: string }>("/api/profile"),
};

export const accountsApi = {
  list: () => api.get<Account[]>("/api/accounts"),

  create: (data: { type: string; interest_rate?: number; can_withdraw?: boolean; deposit_end_date?: string }) =>
    api.post<Account>("/api/accounts", data),

  delete: (account_number: string) =>
    api.delete(`/api/accounts/${account_number}`),
};

export const cardsApi = {
  add: (account_number: string) =>
    api.post<{ id: number; card_number: string; account_number: string }>("/api/cards", { account_number }),
};

export const transactionsApi = {
  transfer: (data: {
    sender_account_number: string;
    receiver_account_number: string;
    amount: number;
    description?: string;
  }) => api.post<{ transaction_id: number; sender_new_balance: number; message: string }>("/api/transfer", data),

  list: (account_number: string) =>
    api.get<Transaction[]>(`/api/transactions?account_number=${account_number}`),
};
