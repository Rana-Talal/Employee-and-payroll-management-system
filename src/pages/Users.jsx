import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

export default function UsersList() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setErrorMsg("التوكن غير متوفر.");
      setIsLoading(false);
      return;
    }

    fetch("http://192.168.11.230:1006/api/User", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("فشل تحميل بيانات المستخدمين");
        return res.json();
      })
      .then((data) => {
        const usersData = Array.isArray(data.items) ? data.items : data;
        setUsers(usersData);
        setIsLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setIsLoading(false);
      });
  }, [token]);

  if (isLoading)
    return <p className="text-center mt-8">جاري تحميل المستخدمين...</p>;

  if (errorMsg)
    return (
      <div className="text-center mt-8 text-red-600">حدث خطأ: {errorMsg}</div>
    );

  if (!users.length)
    return <p className="text-center mt-8">لا يوجد مستخدمون للعرض.</p>;

  // دالة التعامل مع الضغط على زر العرض فقط
  const handleViewProfile = (userID) => {
    if (!userID) {
      alert("معرف المستخدم غير متوفر.");
      return;
    }
    navigate(`/profile/${userID}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 py-8 px-4 relative overflow-hidden" dir="rtl">
      {/* خلفية متحركة */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] p-6 md:p-8 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-950 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-950 bg-clip-text text-transparent">
                  قائمة المستخدمين
                </h1>
                <p className="text-gray-600 text-sm mt-1">إدارة وعرض جميع المستخدمين</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-100 rounded-2xl">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-950 bg-clip-text text-transparent">
                {users.length}
              </span>
              <span className="text-sm text-gray-600">مستخدم</span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-950 text-white">
                  <th className="p-4 text-right font-bold">الاسم الكامل</th>
                  <th className="p-4 text-right font-bold">اسم المستخدم</th>
                  <th className="p-4 text-right font-bold">البريد الإلكتروني</th>
                  <th className="p-4 text-right font-bold">رقم الهاتف</th>
                  <th className="p-4 text-right font-bold">الدور</th>
                  <th className="p-4 text-right font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => {
                  const phoneNumber = user.phoneNumber || "—";
                  const key = user.userID ?? user.userName ?? index;

                  return (
                    <tr
                      key={key}
                      className="border-b border-gray-200/50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue/50 transition-all duration-300"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-950 rounded-xl flex items-center justify-center shadow-md text-white font-bold">
                            {user.fullName?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="font-semibold text-gray-800">{user.fullName || "—"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">@{user.userName || "—"}</td>
                      <td className="p-4 text-gray-600">{user.email || "—"}</td>
                      <td className="p-4 text-gray-600">{phoneNumber}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-100 text-blue-700 rounded-xl text-sm font-bold">
                          {user.roleName || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleViewProfile(user.userID)}
                          className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-blue-950 text-white py-2 px-4 rounded-xl font-bold shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <span className="relative z-10">عرض</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
