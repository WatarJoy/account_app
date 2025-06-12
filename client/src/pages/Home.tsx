import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { type RootState } from "../store";

const Home: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col justify-center items-center text-center gap-6">
      <h2 className="text-2xl font-bold">
        {user
          ? `You are logged in as ${user.email}`
          : "You are not logged in. Please log in or register."}
      </h2>

      <div className="flex flex-wrap justify-center gap-4">
        {user ? (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded shadow"
            >
              Register
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
