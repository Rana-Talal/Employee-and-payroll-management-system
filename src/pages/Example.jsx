import React, { useState, useEffect } from "react";
export default function Example() {
  const [formData, setFormData] = useState({});
  
  // ⬅️ بيانات الأقسام
  const [departments, setDepartments] = useState([]);
  // ⬅️ بيانات المصارف
  const [banks, setBanks] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // جلب الأقسام
  useEffect(() => {
    fetch("http://192.168.11.230:1006/api/Departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data.items || []))
      .catch((err) => console.error("Error fetching departments:", err));
  }, []);

  // جلب المصارف
  useEffect(() => {
    fetch("http://192.168.11.230:1006/api/Banks")
      .then((res) => res.json())
      .then((data) => setBanks(data.items || []))
      .catch((err) => console.error("Error fetching banks:", err));
  }, []);

  // دالة توليد الحقول
  const renderField = (field, color) => (
    <div key={field.name}>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {field.label}
      </label>

      {field.type === "select" ? (
        <select
          name={field.name}
          value={formData[field.name] || ""}
          onChange={handleChange}
          className={`w-full border rounded-md px-2 py-1 focus:ring focus:ring-${color}-300`}
        >
          <option value="">اختر...</option>

          {/* ✅ القسم */}
          {field.name === "department" &&
            departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}

          {/* ✅ المصرف */}
          {field.name === "bankName" &&
            banks.map((bank) => (
              <option key={bank.id} value={bank.name}>
                {bank.name}
              </option>
            ))}

          {/* باقي الحقول مؤقتًا */}
          {field.name !== "department" && field.name !== "bankName" && (
            <>
              <option value="1">خيار 1</option>
              <option value="2">خيار 2</option>
            </>
          )}
        </select>
      ) : (
        <input
          type={field.type}
          name={field.name}
          value={formData[field.name] || ""}
          onChange={handleChange}
          className={`w-full border rounded-md px-2 py-1 focus:ring focus:ring-${color}-300`}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <section className="border-2 border-blue-500 rounded-xl p-4">
        <h2 className="text-lg font-bold mb-4 text-blue-600">🧑‍💼 بيانات الموظف</h2>
        <div className="grid grid-cols-4 gap-4">
          {employeeFields.map((field) => renderField(field, "blue"))}
        </div>
      </section>
    </div>
  );
}
