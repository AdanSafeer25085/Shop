// components/Navbar.js
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Navbar({ onToggleSidebar }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-opacity-95 backdrop-blur-sm shadow-lg" : "bg-opacity-100"
      }`}
      style={{
        background: "linear-gradient(to right, #000428, #004e92, #000428)",
      }}
    >
      <div className="max-w-[1900px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Menu & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="md:hidden text-2xl p-2 rounded hover:bg-white/10 transition-all duration-300 hover:scale-110 text-white"
              aria-label="Menu"
            >
              ☰
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-white transition-all duration-300">
                Shop With Adil
              </h1>
            </Link>
          </div>

          {/* Right Section - Admin Login */}
          <div className="flex items-center gap-4">
            <Link href="/login">
              <button className="hidden md:block px-4 py-2 rounded-[10px] bg-[#1447E5] hover:bg-blue-700 text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5">
                Admin Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
