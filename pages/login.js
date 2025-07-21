// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "adan" && password === "ahadbhindar") {
      localStorage.setItem("isAdmin", "true");
      router.push("/admin");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 ">
      <form
        onSubmit={handleLogin}
        className="bg-white  text-black p-6 rounded shadow-md w-full max-w-sm hover:shadow-xl"
      >
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:shadow-md duration-200 transition-transform transform hover:-translate-y-0.5 hover:cursor-pointer"
        >
          Login
        </button>
      </form>
    </div>
  );
}
