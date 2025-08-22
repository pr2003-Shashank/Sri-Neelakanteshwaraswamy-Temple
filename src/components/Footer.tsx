import Link from "next/link";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-yellow-700 text-white">
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
          <span className="ml-3 text-xl font-semibold text-white hidden sm:block">Sri Neelakanteshwaraswamy Temple</span>
        </Link>

        {/* Social Icons */}
        <div className="flex gap-2 mt-2 sm:mt-0">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-200"
          >
            <FaInstagram size={20} />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-200"
          >
            <FaFacebook size={20} />
          </a>
          <a
            href="https://www.youtube.com/@Neelakanteshwaraswamy-Gurupura"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-200"
          >
            <FaYoutube size={20} />
          </a>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="text-center py-3 text-xs font-light bg-yellow-700">
        © {new Date().getFullYear()} Sri Neelakanteshwaraswamy Temple. All
        rights reserved.
      </div>
      <div className="flex justify-end max-w-7xl mx-auto flex "> 
        <Link href="/login" 
        className="flex bg-yellow-900 hover:bg-yellow-800 m-3 p-3 rounded text-xs" 
        >
         Admin Login 
         </Link> 
         </div>
    </footer>
  );
}
