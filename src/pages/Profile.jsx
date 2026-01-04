import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Profile() {
  const { token, userId } = useAuth();
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token || !userId) {
        setErrorMsg("المعرف أو التوكن مفقود.");
        setIsLoading(false);
        return;
      }

      try {
        const [roleRes, userRes] = await Promise.all([
          fetch("http://192.168.11.230:1006/api/Role"),
          fetch(`http://192.168.11.230:1006/api/User/${userId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (roleRes.status === 401 || userRes.status === 401) {
          navigate("/login");
          return;
        }

        if (!roleRes.ok) throw new Error("فشل تحميل بيانات الأدوار");
        if (!userRes.ok) throw new Error("فشل تحميل بيانات المستخدم");

        const rolesData = await roleRes.json();
        const userData = await userRes.json();

        const resolvedRoles = Array.isArray(rolesData)
          ? rolesData
          : Array.isArray(rolesData.items)
          ? rolesData.items
          : [];

        setRoles(resolvedRoles);
        setUser(userData);
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [token, userId, navigate]);

  if (isLoading) {
    return <p className="text-center mt-8">جارٍ تحميل البيانات...</p>;
  }

  if (!user) {
    return (
      <div className="text-center mt-8 text-red-600">
        تعذر تحميل الملف الشخصي.
        {errorMsg && <div className="mt-2 text-sm text-gray-700">{errorMsg}</div>}
      </div>
    );
  }

  const userRoleName =
    user.roleName ||
    roles.find((r) => String(r.roleID) === String(user.roleID))?.name ||
    "—";

  const phoneNumber = user.phoneNumber || "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 py-8 px-4 relative overflow-hidden" dir="rtl">
      {/* خلفية متحركة */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] p-6 md:p-8 mb-8 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-950 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-950 bg-clip-text text-transparent">
                الملف الشخصي
              </h1>
              <p className="text-gray-600 text-sm mt-1">معلومات حسابك الشخصي</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] p-8 md:p-10 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <ProfileField label="الاسم الكامل" value={user.fullName || "—"} />
            </div>
            <ProfileField label="اسم المستخدم" value={user.userName || "—"} />
            <ProfileField label="الدور" value={userRoleName} />
            <ProfileField label="البريد الإلكتروني" value={user.email || "—"} className="md:col-span-2" />
            <ProfileField label="رقم الهاتف" value={phoneNumber} className="md:col-span-2" />

            <div className="md:col-span-2 flex justify-end mt-6">
              <Link
                to="/edit-profile"
                className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-blue-950 text-white py-4 px-10 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  تعديل الملف الشخصي
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value = "—", className = "" }) {
  return (
    <div className={`text-right ${className}`}>
      <label className="block mb-2 text-sm font-bold text-gray-700">{label}</label>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-950 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-300"></div>
        <div className="relative px-5 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-2xl text-gray-800 shadow-inner">
          {value}
        </div>
      </div>
    </div>
  );
}
