// components/Navbar.js
import Link from "next/link";

export default function Navbar({ onToggleSidebar }) {
  return (
    <nav
      className="text-white p-4"
      style={{
        background: "linear-gradient(to right, #000428, #004e92, #000428)",
      }}
    >
      <div className="max-w-[1900px] mx-auto flex items-center gap-4 justify-between">
        {/* Hamburger menu on small screens */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-3xl p-2 rounded"
        >
          ☰
        </button>

        {/* Logo + title (move to right on small screens, left on md+ screens) */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <img
            className="w-14 h-14 rounded-full border border-white"
            src="/images/logo1.png"
            alt="Shop Logo"
          />
          <h1 className="text-xl font-bold">Shop With Adil</h1>
        </div>

        {/* Admin Login button (hidden on small screens) */}
        <Link href="/login" className="hidden md:block">
          <button className="text-white px-4 py-1 border rounded transition hover:shadow-md shadow-gray-300 hover:-translate-y-0.5" >
            Admin Login
          </button>
        </Link>
      </div>
    </nav>
  );
}
