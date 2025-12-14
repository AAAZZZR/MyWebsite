import Link from 'next/link';
import React from 'react';

export default function Navbar() {
  return (

    <nav className="fixed top-0 left-0 w-full z-20 flex items-center bg-transparent + bg-gradient-to-b justify-between px-8 py-6 bg-slate-950/50 backdrop-blur-md  transition-all duration-300">
      
      {/* Logo */}
      <div className="text-xl font-bold tracking-tight text-white">
        <Link href="/">
          LEVE<span className="text-blue-500">UP</span>
        </Link>
      </div>

      {/* 修正重點：文字顏色改為淺灰 (text-slate-300)，Hover 變白 */}
      <div className="flex items-center gap-8 text-sm font-medium text-slate-300">
        <Link href="/" className="hover:text-white transition-colors">
          Services
        </Link>
        <Link href="/#contact" className="hover:text-white transition-colors">
          Contact
        </Link>
        
        {/* 按鈕樣式維持不變，或稍微加強陰影 */}
        <Link 
          href="/me" 
          className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all font-semibold shadow-lg shadow-blue-500/20"
        >
          About Me / Resume
        </Link>
      </div>
    </nav>
  );
}