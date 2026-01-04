// src/pages/AuditDepartmentPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import EditEmployee from "../pages/EditEmployee";
// import SalarySummary from "../pages/SalarySummary";

export default function AuditDepartmentPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const BASE_URL = "/api";

  const fetchEmployees = useCallback(async () => {
    const res = await fetch(`${BASE_URL}/Employee`);
    const data = await res.json();
    setEmployees(data.items || []);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">قسم التدقيق</h1>

      <ul className="space-y-3">
        {employees.map((emp) => (
          <li
            key={emp.id}
            className="p-4 bg-white rounded-lg shadow flex justify-between"
          >
            <span>{emp.fullName}</span>
            <button
              onClick={() => setSelectedEmployee(emp)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              مراجعة
            </button>
          </li>
        ))}
      </ul>

      {selectedEmployee && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-4">مراجعة بيانات الموظف</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">الموارد البشرية</h4>
              <EditEmployee employee={selectedEmployee} readOnly />
            </div>
            <div>
              <h4 className="font-medium mb-2">الراتب</h4>
              <SalarySummary employee={selectedEmployee} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
