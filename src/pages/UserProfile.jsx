import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

export default function UserProfile() {
  const { userName } = useParams(); // من عنوان الصفحة
  const { token } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!userName || !token) {
        setErrorMsg("اسم المستخدم أو التوكن مفقود.");
        setIsLoading(false);
        return;
      }

      try {
        const [roleRes, userRes] = await Promise.all([
          fetch("http://192.168.11.230:1006/api/Role"),
          fetch(`http://192.168.11.230:1006/api/User/${userName}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

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

    fetchData();
  }, [userName, token]);

  // ⏳ تحميل
  if (isLoading) {
    return <p className="text-center mt-8">جارٍ تحميل البيانات...</p>;
  }

  // ❌ خطأ أو عدم وجود بيانات
  if (!user) {
    return (
      <div className="text-center mt-8 text-red-600">
        تعذر تحميل بيانات المستخدم.
        {errorMsg && <div className="mt-2 text-sm text-gray-700">{errorMsg}</div>}
      </div>
    );
  }

  // ✅ دالة تعديل المستخدم
  const handleEditUser = (userID) => {
    if (!userID) {
      alert("معرف المستخدم غير متوفر.");
      return;
    }
    navigate(`/edit-user/${userID}`);
  };

  // ✅ دالة حذف المستخدم
  const handleDeleteUser = async (userID) => {
    if (!userID) {
      alert("معرف المستخدم غير متوفر.");
      return;
    }

    const confirmed = window.confirm("هل أنت متأكد من حذف المستخدم؟");
    if (!confirmed) return;

    try {
      const res = await fetch(`http://192.168.11.230:1006/api/User/${userID}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("فشل حذف المستخدم.");

      alert("تم حذف المستخدم بنجاح.");
      navigate("/users");
    } catch (error) {
      alert(error.message);
    }
  };

  // استخراج الدور
  const userRoleName =
    user.roleName ||
    roles.find((r) => String(r.roleID) === String(user.roleID))?.name ||
    "—";

  // رقم الهاتف
  const phoneNumber = user.phoneNumber || "—";

  return (
    <div className="max-w-3xl mx-auto p-6 text-right border border-gray-300 rounded-lg shadow-sm bg-white" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">ملف المستخدم</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-300 p-6 rounded-lg shadow-sm bg-white">
        <div className="text-right md:col-span-2">
          <ProfileField label="الاسم الكامل" value={user.fullName || "—"} />
        </div>
        <ProfileField label="اسم المستخدم" value={user.userName || "—"} className="md:col-span-2" />
        <ProfileField label="البريد الإلكتروني" value={user.email || "—"} className="md:col-span-2" />
        <ProfileField label="رقم الهاتف" value={phoneNumber} className="md:col-span-2" />
        <ProfileField label="الدور" value={userRoleName} className="md:col-span-2"/>

        <div className="md:col-span-2 flex gap-4 mt-6">
          <button
            onClick={() => handleEditUser(user.userID)}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            تعديل
          </button>
          <button
            onClick={() => handleDeleteUser(user.userID)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ مكوّن عرض حقل واحد
function ProfileField({ label, value = "—", className = "" }) {
  return (
    <div className={className}>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-gray-900 border-b pb-1">{value}</p>
    </div>
  );
}
