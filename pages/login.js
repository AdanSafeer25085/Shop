// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const validUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "adan";
    const validPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "ahadbhindar";

    if (username === validUser && password === validPass) {
      localStorage.setItem("isAdmin", "true");
      router.push("/admin");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #000428 0%, #004e92 100%)" }}
    >
      <form
        onSubmit={handleLogin}
        className="bg-white/10 backdrop-blur-md text-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-white/20"
      >
        <div className="flex flex-col items-center mb-6">
          <span className="text-4xl mb-2">🛍️</span>
          <h2 className="text-2xl font-bold tracking-tight">TrendyNest</h2>
          <p className="text-white/60 text-sm mt-1">Admin Portal</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          Sign In
        </button>

        <p className="text-center text-white/40 text-xs mt-6">
          TrendyNest &copy; {new Date().getFullYear()}
        </p>
      </form>
    </div>
  );
}
