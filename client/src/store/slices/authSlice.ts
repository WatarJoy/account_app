import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

const userFromStorage = localStorage.getItem("user");
let parsedUser: User | null = null;

try {
  if (userFromStorage) {
    parsedUser = JSON.parse(userFromStorage);
  }
} catch (e) {
  console.error("Failed to parse user from localStorage:", e);
  parsedUser = null;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: parsedUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
