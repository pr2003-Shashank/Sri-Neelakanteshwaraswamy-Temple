import Link from "next/link";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-yellow-100 to-yellow-300 text-yellow-900">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-row justify-between items-center border-b border-yellow-600">
        <Link href="/" className="flex items-center">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img
              src="https://res.cloudinary.com/dnumk8kl0/image/upload/v1755845882/logo_ywarix.png"
              alt="Sri Neelakanteshwaraswamy Temple"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="ml-3 text-xl font-semibold text-yellow-900 hidden sm:block">ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನ</span>
        </Link>

        {/* Social Icons */}
        <div className="flex gap-2 mt-2 sm:mt-0">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-600"
          >
            <FaInstagram size={28} />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-600"
          >
            <FaFacebook size={28} />
          </a>
          <a
            href="https://www.youtube.com/@Neelakanteshwaraswamy-Gurupura"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-600"
          >
            <FaYoutube size={28} />
          </a>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 items-center py-3 text-xs ">
        <p className="text-center">
          © {new Date().getFullYear()} Sri Neelakanteshwaraswamy Temple. All
          rights reserved.
        </p>
        <div className="flex">
          <Link href="/login"
            className="flex bg-yellow-900 hover:bg-yellow-800 p-1 rounded text-xs text-yellow-100"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
