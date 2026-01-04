import React, { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";

export default function EditProfile() {
  const { token, userId, setUsername } = useAuth();

  const [formData, setFormData] = useState(null); // البيانات تجي من السيرفر
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token || !userId) {
      setErrorMsg("المعرف أو التوكن مفقود.");
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

  // دالة تعديل الحقول
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
    if (!formData?.phoneNumber || !/^\d{8,15}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "رقم الهاتف غير صالح";
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
        method: "PUT", // هنا استعمل PUT للتعديل
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

      // حدث اسم المستخدم في الـ Context إذا كان موجود
      if (setUsername) setUsername(payload.fullName);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 py-8 px-4 relative overflow-hidden" dir="rtl">
      {/* خلفية متحركة */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] p-6 md:p-8 mb-8 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                تعديل الملف الشخصي
              </h1>
              <p className="text-gray-600 text-sm mt-1">قم بتحديث معلوماتك الشخصية</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] p-8 md:p-10 border border-white/20">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              placeholder="اتركها فارغة إذا لا تريد تغييرها"
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
              <label className="block mb-2 text-sm font-bold text-gray-700 mr-1">الدور</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                <select
                  name="roleID"
                  value={formData.roleID || ""}
                  onChange={handleChange}
                  className={`relative w-full px-5 py-4 bg-gray-50/50 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-right shadow-inner appearance-none leading-normal ${
                    errors.roleID ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500 focus:bg-white"
                  }`}
                >
                  <option value="">اختر الدور</option>
                  {roles.map((role) => (
                    <option key={role.roleID || role.id} value={role.roleID || role.id}>
                      {role.name || role.Name || role.roleName}
                    </option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.roleID && <p className="text-red-500 text-sm mt-1 mr-1">{errors.roleID}</p>}
            </div>

            <div className="md:col-span-2 flex justify-end mt-6">
              <button
                type="submit"
                className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-10 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  حفظ التعديلات
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition duration-300"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = "text", error, placeholder }) {
  return (
    <div className="text-right">
      <label className="block mb-2 text-sm font-bold text-gray-700 mr-1">{label}</label>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`relative w-full px-5 py-4 bg-gray-50/50 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-right shadow-inner leading-normal ${
            error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-purple-500 focus:bg-white"
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1 mr-1">{error}</p>}
    </div>
  );
}
