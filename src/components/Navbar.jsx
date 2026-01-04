import { useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown";

export default function Navbar({ className = "" }) {
  const navigate = useNavigate();

  return (
    <nav
      className={`relative bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-lg py-3 px-6 flex items-center justify-between z-50 ${className}`}
      dir="rtl"
    >
      {/* أزرار التنقل على اليمين */}
      <div className="flex items-center gap-3">
        {/* زر لوحة التحكم */}
        <button
          onClick={() => navigate("/dashboard")}
          className="group relative overflow-hidden flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-950 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="relative z-10">الصفحة الرئيسية</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>
        </button>

        {/* زر الرجوع */}
        <button
          onClick={() => navigate(-1)}
          className="group relative overflow-hidden flex items-center gap-2 bg-gray-100/80 text-gray-700 px-5 py-2.5 rounded-xl font-medium border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="relative z-10">رجوع</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* القائمة المنسدلة على اليسار */}
      <div className="flex items-center gap-4">
        <Dropdown />
      </div>
    </nav>
  );
}