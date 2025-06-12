import React, { useEffect, useState } from "react";
import api from "../services/api";
import { subDays, format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { type RootState } from "../store";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { logout } from "../store/slices/authSlice";
import ExpenseCalendar from "../components/ExpenseCalendar";
import type { AxiosError } from "axios";

interface Transaction {
  createdAt: Date;
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
}

interface GroupedTransaction {
  description: string;
  totalAmount: number;
  type: "income" | "expense";
  transactions: Transaction[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const groupTransactions = (
  transactions: Transaction[]
): GroupedTransaction[] => {
  const groups: { [key: string]: GroupedTransaction } = {};

  transactions.forEach((tx) => {
    const key = tx.description.trim().toLowerCase() + "|" + tx.type;
    if (!groups[key]) {
      groups[key] = {
        description: tx.description,
        totalAmount: 0,
        type: tx.type,
        transactions: [],
      };
    }
    groups[key].totalAmount += Number(tx.amount);
    groups[key].transactions.push(tx);
  });

  return Object.values(groups);
};

const preparePieData = (groups: GroupedTransaction[]) =>
  groups.map((g) => ({ name: g.description, value: g.totalAmount }));

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [fromDate, setFromDate] = useState(
    format(subDays(new Date(), 180), "yyyy-MM-dd")
  );
  const [toDate, setToDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [authError, setAuthError] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(
        res.data.map((tx: Transaction) => ({
          ...tx,
          amount: Number(tx.amount),
        }))
      );
    } catch (error) {
      const err = error as AxiosError;

      if (err.response?.status === 401) {
        setAuthError(true);
      } else {
        console.error("Error fetching transactions", err);
      }
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">
            You are not logged in.
          </h2>
          <p>
            Please{" "}
            <a href="/login" className="text-blue-600 underline">
              log in
            </a>{" "}
            or{" "}
            <a href="/register" className="text-blue-600 underline">
              register
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  const handleAdd = async () => {
    try {
      await api.post(
        "/transactions",
        { description, amount, type },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDescription("");
      setAmount(0);
      setType("expense");
      fetchTransactions();
    } catch (err) {
      console.error("Error adding transaction", err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const grouped = groupTransactions(transactions);
  const incomeGroups = grouped.filter((g) => g.type === "income");
  const expenseGroups = grouped.filter((g) => g.type === "expense");

  const PieChartExpenses = () => {
    const expenseData = preparePieData(expenseGroups);
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={expenseData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {expenseData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const PieChartIncome = () => {
    const incomeData = preparePieData(incomeGroups);
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={incomeData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {incomeData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const PieChartComparison = () => {
    const totalIncome = incomeGroups.reduce((acc, g) => acc + g.totalAmount, 0);
    const totalExpense = expenseGroups.reduce(
      (acc, g) => acc + g.totalAmount,
      0
    );

    const data = [
      { name: "Income", value: totalIncome },
      { name: "Expense", value: totalExpense },
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={index === 0 ? "#00C49F" : "#FF8042"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const calendarData = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc: Record<string, number>, tx) => {
      const date = format(new Date(tx.createdAt), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

  const heatmapValues: { date: string; count: number }[] = Object.entries(
    calendarData
  ).map(([date, count]) => ({ date, count }));

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <input
          className="border p-2 rounded w-60"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="border p-2 rounded w-40"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <select
          className="border p-2 rounded"
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Grouped Expenses</h3>
          <ul className="bg-white p-4 rounded shadow">
            {expenseGroups.map((g) => (
              <li key={g.description} className="mb-4">
                <p className="font-medium">
                  {g.description} - ${g.totalAmount.toFixed(2)}
                </p>
                <ul className="pl-4 list-disc text-gray-700">
                  {g.transactions.map((tx) => (
                    <li key={tx.id}>
                      ${tx.amount.toFixed(2)} –{" "}
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Grouped Income</h3>
          <ul className="bg-white p-4 rounded shadow">
            {incomeGroups.map((g) => (
              <li key={g.description} className="mb-4">
                <p className="font-medium">
                  {g.description} - ${g.totalAmount.toFixed(2)}
                </p>
                <ul className="pl-4 list-disc text-gray-700">
                  {g.transactions.map((tx) => (
                    <li key={tx.id}>
                      ${tx.amount.toFixed(2)} –{" "}
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Charts</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Expenses</h4>
            <PieChartExpenses />
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Income</h4>
            <PieChartIncome />
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Income vs Expenses</h4>
            <PieChartComparison />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mt-6">
        <h4 className="font-semibold mb-4">Expense Activity Calendar</h4>
        <div className="flex flex-wrap gap-4 mb-4 items-end">
          <div>
            <label className="block text-sm font-medium">From</label>
            <input
              type="date"
              className="border p-2 rounded"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">To</label>
            <input
              type="date"
              className="border p-2 rounded"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <ExpenseCalendar
          fromDate={fromDate}
          toDate={toDate}
          values={heatmapValues}
        />
      </div>
    </div>
  );
};

export default Dashboard;
