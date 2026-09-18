import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{ background: "linear-gradient(to right, #000428, #004e92, #000428)" }}
      className="text-white mt-16 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Branding */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🛍️</span>
            <h2 className="text-2xl font-extrabold tracking-tight">TrendyNest</h2>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-5 max-w-[240px]">
            Your trusted destination for quality products and great deals. Shop with confidence, enjoy exclusive discounts!
          </p>

          {/* Accepted Payment Methods */}
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-2 font-semibold">We Accept</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/10 border border-white/20 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
                <span className="text-base">💵</span> Cash on Delivery
              </span>
              <span className="bg-white/10 border border-white/20 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
                <span className="text-base">📱</span> EasyPaisa
              </span>
              <span className="bg-white/10 border border-white/20 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
                <span className="text-base">📲</span> JazzCash
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:flex md:flex-col md:items-center">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Quick Links</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/user" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                <span>🏠</span> Home
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                <span>✉️</span> Contact
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                <span>⚙️</span> Admin Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="md:flex md:flex-col md:items-end">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Get in Touch</h3>
          <ul className="space-y-2.5 text-sm text-right">
            <li>
              <a href="mailto:akraj25085@gmail.com" className="text-white/70 hover:text-blue-300 transition-colors flex items-center gap-2 justify-end">
                <span>akraj25085@gmail.com</span>
                <span>📧</span>
              </a>
            </li>
            <li>
              <a href="tel:03124165364" className="text-white/70 hover:text-blue-300 transition-colors flex items-center gap-2 justify-end">
                <span>0312-4165364</span>
                <span>📞</span>
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/923124165364"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-green-400 transition-colors flex items-center gap-2 justify-end"
              >
                <span>WhatsApp Us</span>
                <span>💬</span>
              </a>
            </li>
            <li>
              <span className="text-white/50 flex items-center gap-2 justify-end">
                <span>Islamabad, Pakistan</span>
                <span>📍</span>
              </span>
            </li>
          </ul>

          {/* Social Icons */}
          <div className="flex gap-3 mt-5">
            <a href="#" aria-label="Facebook" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-blue-600 border border-white/10 transition-all duration-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-pink-600 border border-white/10 transition-all duration-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.659.334 3.678 1.315c-.98.98-1.187 2.092-1.245 3.373C2.012 5.668 2 6.077 2 12c0 5.923.012 6.332.07 7.612.058 1.281.265 2.393 1.245 3.373.98.98 2.092 1.187 3.373 1.245C8.332 23.988 8.741 24 12 24s3.668-.012 4.948-.07c1.281-.058 2.393-.265 3.373-1.245.98-.98 1.187-2.092 1.245-3.373.058-1.28.07-1.689.07-7.612 0-5.923-.012-6.332-.07-7.612-.058-1.281-.265-2.393-1.245-3.373-.98-.98-2.092-1.187-3.373-1.245C15.668.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
              </svg>
            </a>
            <a
              href="https://wa.me/923124165364"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-green-600 border border-white/10 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 text-center py-4 text-white/40 text-xs">
        &copy; {new Date().getFullYear()} TrendyNest — All rights reserved. Made with ❤️ in Pakistan.
      </div>
    </footer>
  );
}