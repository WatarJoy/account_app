import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./store/slices/authSlice";
import transactionReducer from "./store/slices/transactionSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
