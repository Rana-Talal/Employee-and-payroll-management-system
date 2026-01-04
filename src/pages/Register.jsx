
// register

import React, { useState, useEffect } from "react";
import logo from "../assets/mainform.jpg";
import { useNavigate } from "react-router-dom";

const formFields = [
  { name: "fullname", type: "text", placeholder: "الاسم الكامل", span: 2 },
  { name: "userName", type: "text", placeholder: "اسم المستخدم" },
  { name: "password", type: "password", placeholder: "كلمة المرور" },
  { name: "email", type: "email", placeholder: "البريد الإلكتروني", span: 2 },
  { name: "phone", type: "text", placeholder: "رقم الهاتف", span: 2 },
  { name: "role", type: "select", placeholder: "الدور", span: 2 },
];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch("http://192.168.11.230:1006/api/Role");
        if (!res.ok) throw new Error(`فشل في جلب الأدوار (${res.status})`);
        const data = await res.json();
        setRoles(data.items);
      } catch (err) {
        console.error(err);
        setError("تعذر تحميل قائمة الأدوار");
      }
    }
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      userName: formData.userName || "",
      fullName: formData.fullname || "",
      email: formData.email || "",
      phoneNumber: formData.phone || "",
      password: formData.password || "",
      roleID: parseInt(formData.role, 10) || 1,
    };

    try {
      const res = await fetch("http://192.168.11.230:1006/api/User", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // حاول تجيب رسالة الخطأ من الرد
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || `فشل التسجيل (${res.status})`);
        return;
      }

      const result = await res.json();
      console.log("تم إنشاء المستخدم:", result);

      // افترض ان API يرجع "userID" أو "id"
      const userId = result.userID || result.id;

      if (userId) {
        navigate(`/profile/${userId}`);
      } else {
        setError("لم نستلم معرف المستخدم بعد التسجيل.");
      }
    } catch (err) {
      console.error(err);
      setError("تعذر الاتصال بالخادم.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 flex items-center justify-center p-3 md:p-6 relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl w-full relative z-10">
        {/* قسم الصورة */}
        <div className="hidden lg:flex items-center justify-center order-2 lg:order-1">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-950 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <img
              src={logo}
              alt="شعار المحافظة"
              className="relative rounded-3xl shadow-2xl w-full max-w-lg transform group-hover:scale-105 transition duration-500"
            />
          </div>
        </div>

        {/* قسم التسجيل */}
        <div className="flex items-center justify-center order-1 lg:order-2" dir="rtl">
          <div className="w-full max-w-3xl">
            {/* البطاقة الرئيسية */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] p-5 md:p-6 border border-white/20">

              {/* العنوان */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-950 rounded-2xl shadow-lg mb-2 transform hover:rotate-12 transition duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-950 bg-clip-text text-transparent mb-2 leading-relaxed">
                  إنشاء حساب جديد
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">قم بإنشاء حساب جديد للانضمام إلى النظام</p>
              </div>

              {/* رسائل الخطأ */}
              {error && (
                <div className="mb-4 p-2.5 bg-red-100/80 backdrop-blur-sm border-2 border-red-300 text-red-700 rounded-2xl text-center font-medium text-sm animate-shake">
                  {error}
                </div>
              )}

              {/* النموذج */}
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                {formFields.map((field, index) =>
                  field.type === "select" ? (
                    <div key={index} className={`text-right ${field.span === 2 ? "md:col-span-2" : ""}`}>
                      <label className="block mb-1.5 text-sm font-bold text-gray-700 mr-1">
                        {field.placeholder}
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-950 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                        <select
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                          className="relative w-full px-4 py-3.5 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 text-right shadow-inner appearance-none text-sm leading-normal"
                          required
                        >
                          <option disabled value="">
                            اختر {field.placeholder}
                          </option>
                          {roles.map((role) => (
                            <option key={role.roleID} value={role.roleID}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={index} className={`text-right ${field.span === 2 ? "md:col-span-2" : ""}`}>
                      <label className="block mb-1.5 text-sm font-bold text-gray-700 mr-1">
                        {field.placeholder}
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-950 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                        <input
                          name={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                          className="relative w-full px-4 py-3.5 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-950 focus:bg-white transition-all duration-300 text-right shadow-inner text-sm leading-normal"
                          required
                        />
                      </div>
                    </div>
                  )
                )}

                {/* زر الإنشاء */}
                <button
                  type="submit"
                  className="md:col-span-2 w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-blue-950 text-white py-3 px-6 rounded-2xl font-bold text-base shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="relative z-10">إنشاء حساب</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-950to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                </button>
              </form>

              {/* خط فاصل */}
              <div className="mt-4 text-center">
                {/* <p className="text-xs text-gray-500">
                  بإنشاء حساب، أنت توافق على شروط الاستخدام
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}