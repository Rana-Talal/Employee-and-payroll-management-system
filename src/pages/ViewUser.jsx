import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ViewUser() {
  const { userName } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find((u) => u.userName === userName);
    setUser(foundUser || null);
  }, [userName]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p>المستخدم غير موجود</p>
        <button
          onClick={() => navigate("/users")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          العودة لجميع المستخدمين
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-right">الملف الشخصي للمستخدم</h1>

      <div className="bg-white border rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(fieldLabels).map(([key, label]) => (
          <div key={key} className="text-right">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-lg text-gray-800 border rounded p-2 bg-gray-50">
              {key === "password"
                ? "********"
                : user[key] || <span className="text-gray-400">لا يوجد</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-start">
        <button
          onClick={() => navigate("/users")}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          العودة لجميع المستخدمين
        </button>
      </div>
    </div>
  );
}

const fieldLabels = {
  firstName: "الاسم الأول",
  lastName: "الاسم الثاني",
  userName: "اسم المستخدم",
  password: "كلمة المرور",
  birthDate: "تاريخ الميلاد",
  gender: "الجنس",
  email: "البريد الإلكتروني",
  phone: "رقم الهاتف",
  role: "الوظيفة",
  committee: "اللجنة",
};
