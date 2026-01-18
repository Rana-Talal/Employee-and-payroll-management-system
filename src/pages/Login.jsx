import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import payroll from "../assets/payroll.png";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function Login() {
  const [usernameInput, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUsername, setRole, setUserId } = useAuth();

  function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

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
          setIsLoading(false);
          return;
        }
        setUserId(userIdFromToken);

        navigate("/main");
      })
      .catch((error) => {
        alert(error.message);
        setIsLoading(false);
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
                      className="relative w-full px-5 py-4 pr-12 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 text-right shadow-inner leading-normal"
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
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="relative w-full px-5 py-4 pr-12 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 text-right shadow-inner leading-normal"
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* زر تسجيل الدخول */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-blue-950 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جاري تسجيل الدخول...
                      </>
                    ) : (
                      "تسجيل الدخول"
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>
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