import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";
import { useParams, useNavigate } from "react-router-dom"; // ✅ إضافة useNavigate

export default function EditUser() {
  const { token, setUsername } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate(); // ✅ تهيئة useNavigate

  const [formData, setFormData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setErrorMsg("التوكن مفقود. الرجاء تسجيل الدخول.");
      setLoading(false);
      return;
    }

    if (!userId) {
      setErrorMsg("معرّف المستخدم غير موجود في الرابط.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [rolesRes, userRes] = await Promise.all([
          fetch("http://192.168.11.230:1006/api/Role"),
          fetch(`http://192.168.11.230:1006/api/User/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!rolesRes.ok) throw new Error("فشل تحميل بيانات الأدوار");
        if (!userRes.ok) throw new Error("فشل تحميل بيانات المستخدم");

        const rolesData = await rolesRes.json();
        const userData = await userRes.json();

        const resolvedRoles = Array.isArray(rolesData)
          ? rolesData
          : Array.isArray(rolesData.items)
          ? rolesData.items
          : [];

        setRoles(resolvedRoles);
        setFormData(userData);
        setLoading(false);
      } catch (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [token, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData?.fullName) newErrors.fullName = "هذا الحقل مطلوب";
    if (!formData?.userName) newErrors.userName = "هذا الحقل مطلوب";
    if (!formData?.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "البريد الإلكتروني غير صالح";
    if (
      !formData?.phoneNumber ||
      !/^\+?\d{8,16}$/.test(formData.phoneNumber)
    )
      newErrors.phoneNumber =
        "رقم الهاتف غير صالح، يجب أن يكون بين 8 و16 رقم ويمكن أن يبدأ بـ +";
    if (!formData?.roleID) newErrors.roleID = "اختر الدور";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      id: userId,
      fullName: formData.fullName,
      userName: formData.userName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      roleID: formData.roleID,
    };

    if (formData.password?.trim() !== "") {
      payload.password = formData.password;
    }

    try {
      const res = await fetch(`http://192.168.11.230:1006/api/User/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ رد السيرفر:", data);
        throw new Error(`فشل تحديث البيانات: ${res.status}`);
      }

      alert("✅ تم تحديث البيانات بنجاح");

      // ✅ إعادة التوجيه إلى صفحة الملف الشخصي
      navigate(`/profile/${userId}`);
    } catch (err) {
      alert(err.message || "❌ حدث خطأ أثناء التحديث");
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-8">جارٍ تحميل البيانات...</p>;
  if (errorMsg)
    return <p className="text-center mt-8 text-red-600">{errorMsg}</p>;

  if (!formData) return null;

  return (
    <div
      className="max-w-3xl mx-auto p-6 text-right border border-gray-300 rounded-lg shadow-sm bg-white"
      dir="rtl"
    >
      <h1 className="text-2xl font-bold mb-6">تعديل الملف الشخصي</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-6 border-gray-300 rounded-lg shadow-sm bg-white"
      >
        <div className="md:col-span-2">
          <InputField
            name="fullName"
            label="الاسم الكامل"
            value={formData.fullName || ""}
            onChange={handleChange}
            error={errors.fullName}
          />
        </div>

        <InputField
          name="userName"
          label="اسم المستخدم"
          value={formData.userName || ""}
          onChange={handleChange}
          error={errors.userName}
        />

        <InputField
          name="password"
          label="كلمة المرور"
          type="password"
          value={formData.password || ""}
          onChange={handleChange}
          error={errors.password}
        />

        <InputField
          name="email"
          label="البريد الإلكتروني"
          value={formData.email || ""}
          onChange={handleChange}
          error={errors.email}
        />

        <InputField
          name="phoneNumber"
          label="رقم الهاتف"
          value={formData.phoneNumber || ""}
          onChange={handleChange}
          error={errors.phoneNumber}
        />

        <div className="text-right">
          <label className="block text-sm text-gray-600 mb-1">الدور</label>
          <select
            name="roleID"
            value={formData.roleID || ""}
            onChange={handleChange}
            className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring ${
              errors.roleID ? "border-red-500" : "focus:ring-blue-200"
            }`}
          >
            <option value="">اختر الدور</option>
            {roles.map((role) => (
              <option key={role.roleID || role.id} value={role.roleID || role.id}>
                {role.name || role.Name || role.roleName}
              </option>
            ))}
          </select>
          {errors.roleID && <p className="text-red-500 text-sm mt-1">{errors.roleID}</p>}
        </div>

        <div className="md:col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            حفظ التعديلات
          </button>
        </div>
      </form>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = "text", error, placeholder }) {
  return (
    <div className="text-right">
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring ${
          error ? "border-red-500" : "focus:ring-blue-200"
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
