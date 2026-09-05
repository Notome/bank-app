interface Card {
  id: number;
  card_number: string;
}

interface Account {
  id: number;
  account_number: string;
  balance: number;
  type: string;
  interest_rate: number | null;
  can_withdraw: boolean;
  deposit_end_date: string | null;
  cards: Card[];
}

interface Transaction {
  id: number;
  sender_account_id: number;
  receiver_account_id: number;
  amount: number;
  created_at: string;
  description: string | null;
}

interface User {
  id: number;
  name: string;
  phone: string;
}
