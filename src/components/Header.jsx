import React from "react";
import logo from "../assets/logo.jpg";

export default function Header() {
  return (
    <header className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-blue-950 shadow-xl overflow-hidden" dir="rtl">
      {/* خلفية متحركة */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-6 z-10">
        <div className="flex items-center gap-4">
          {/* قسم الشعار */}
          <div className="relative group">
            {/* حلقة متحركة حول الشعار */}
            <div className="absolute -inset-2 rounded-full bg-white/30 opacity-40 group-hover:opacity-60 blur-sm transition-all duration-500 animate-pulse"></div>
            <div className="relative w-24 h-24 rounded-full bg-white p-1.5 shadow-2xl">
              <img
                src={logo}
                alt="شعار محافظة بغداد"
                className="w-full h-full rounded-full object-cover shadow-lg transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* النصوص بجانب الشعار */}
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-1 drop-shadow-lg">
              محافظة بغداد
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-1 w-16 bg-white/80 rounded-full shadow-md"></div>
              <p className="text-base md:text-lg font-bold text-white/95 drop-shadow-md">
                نظام ادارة الموظفين والرواتب
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}