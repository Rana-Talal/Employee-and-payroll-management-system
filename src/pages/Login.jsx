import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import payroll from "../assets/payroll.png";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export default function Login() {
  const [usernameInput, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setToken, setUsername, setRole, setUserId } = useAuth();

  function handleSubmit(e) {
    e.preventDefault();

    fetch("http://192.168.11.230:1006/api/User/login", {
      method: "POST",
      body: JSON.stringify({ username: usernameInput, password }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
        return res.json();
      })
      .then((data) => {
        console.log("Login Response:", data);

        setToken(data.token);
        setUsername(data.fullName || usernameInput);
        setRole(data.roleName ? data.roleName.toLowerCase() : "admin");

        // استخراج userId من التوكن
        const payload = parseJwt(data.token);
        const userIdFromToken = payload
          ? payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
          : null;

        if (!userIdFromToken) {
          alert("خطأ: معرف المستخدم مفقود في التوكن");
          return;
        }
        setUserId(userIdFromToken);

        navigate("/main");
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-blue-100 flex items-center justify-center p-3 md:p-6 relative overflow-hidden">
      {/* خلفية متحركة بأشكال دائرية */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl w-full relative z-10">
        {/* قسم الصورة */}
        <div className="hidden lg:flex items-center justify-center order-2 lg:order-2">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-950 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <img
              src={payroll}
              alt="شعار النظام"
              className="relative rounded-3xl shadow-2xl w-full max-w-lg transform group-hover:scale-105 transition duration-500"
            />
          </div>
        </div>

        {/* قسم تسجيل الدخول */}
        <div className="flex items-center justify-center order-1 lg:order-1" dir="rtl">
          <div className="w-full max-w-md">
            {/* البطاقة الرئيسية مع Neumorphic Design */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] p-6 md:p-8 border border-white/20">

              {/* العنوان */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-950 rounded-2xl shadow-lg mb-3 transform hover:rotate-12 transition duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-950 bg-clip-text text-transparent mb-4 leading-relaxed">
                  تسجيل الدخول
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">أهلاً بك مجدداً! قم بتسجيل الدخول للمتابعة</p>
              </div>

              {/* النموذج */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* حقل اسم المستخدم */}
                <div className="text-right">
                  <label className="block mb-2 text-sm font-bold text-gray-700 mr-1">
                    اسم المستخدم
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-950 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="relative w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 text-right shadow-inner leading-normal"
                      placeholder="أدخل اسم المستخدم"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* حقل كلمة المرور */}
                <div className="text-right">
                  <label className="block mb-2 text-sm font-bold text-gray-700 mr-1">
                    كلمة المرور
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-950 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="relative w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 text-right shadow-inner leading-normal"
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* زر تسجيل الدخول */}
                <button
                  type="submit"
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-blue-950 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="relative z-10">تسجيل الدخول</span>
                  <div className="absolute inset-0 bg-gradient-to-r to-blue-950 to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                </button>
              </form>

              {/* خط فاصل */}
              <div className="mt-8 text-center">
                {/* <p className="text-sm text-gray-500">
                  مرحباً بك في نظام الإدارة المتطور
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}