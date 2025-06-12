import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
}

interface TransactionState {
  list: Transaction[];
}

const initialState: TransactionState = {
  list: [],
};

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.list = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.list.push(action.payload);
    },
  },
});

export const { setTransactions, addTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
