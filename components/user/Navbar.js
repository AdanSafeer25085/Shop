// components/user/Navbar.js
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar({ onToggleSidebar }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggle = () => {
    setMenuOpen((prev) => !prev);
    if (onToggleSidebar) onToggleSidebar();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "shadow-2xl shadow-black/50" : ""
      }`}
      style={{ background: "linear-gradient(to right, #000428, #004e92, #000428)" }}
    >
      <div className="max-w-[1900px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          {/* Left — Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-white/10 transition-all duration-200 gap-1.5"
              aria-label="Toggle menu"
            >
              <span
                className={`block h-0.5 w-5 bg-white rounded transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-white rounded transition-all duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-white rounded transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🛍️</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-white transition-all duration-300 tracking-tight">
                TrendyNest
              </h1>
            </Link>
          </div>

          {/* Right — Admin Login */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/20 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                <span>⚙️</span>
                Admin
              </button>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
