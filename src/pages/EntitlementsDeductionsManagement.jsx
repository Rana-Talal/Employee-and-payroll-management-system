import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserCheck } from "lucide-react";
import Entitlement from "../components/Entitlement";
import Deduction from "../components/Deduction";
import { formatCurrency as formatCurrencyUtil } from "../utils/formatNumber";

const BASE_URL = "/api";

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
    return "0 د.ع";
  }
  return formatCurrencyUtil(parseFloat(amount));
};

export default function EntitlementsDeductionsManagement() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [entitlements, setEntitlements] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/Employee?PageSize=1000`, {
          headers: getAuthHeaders(),
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("فشل في جلب الموظفين");

        const data = await res.json();
        const items = data.items || data || [];
        setEmployees(items);
      } catch (error) {
        console.error("خطأ في جلب الموظفين:", error);
        alert("فشل في تحميل الموظفين");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [navigate]);

  const filteredEmployees = employees.filter((emp) =>
    emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeNumber?.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <h1 className="text-4xl font-black mb-2">
            إدارة المخصصات والاستقطاعات
          </h1>
          {/* <p className="text-blue-100 text-lg">إضافة وتعديل المخصصات والاستقطاعات بناءً على الكتب الرسمية</p> */}
        </div>
      </div>

      {!selectedEmployee ? (
        <>
          {/* Search */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 max-w-2xl text-right">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن موظف بالاسم أو الرقم الوظيفي..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>
          </div>

          {/* Employees Table */}
          {filteredEmployees.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-16 text-center">
              <UserCheck className="h-20 w-20 mx-auto mb-4 text-gray-300" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">جرب تغيير كلمة البحث</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الاسم الكامل</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الرقم الوظيفي</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">العنوان الوظيفي</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">القسم</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الراتب الأساسي</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.employeeID || emp.id}
                      className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{emp.employeeNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{emp.jobTitle || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{emp.departmentName || "—"}</td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-700">{formatCurrency(emp.baseSalary)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          إدارة المخصصات والاستقطاعات
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Employee Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {selectedEmployee.fullName?.charAt(0) || "؟"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedEmployee.fullName}
                  </h2>
                  <p className="text-gray-600">
                    الرقم الوظيفي: {selectedEmployee.employeeNumber} | {selectedEmployee.jobTitle}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    القسم: {selectedEmployee.departmentName || "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setEntitlements([]);
                  setDeductions([]);
                }}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
              >
                رجوع للقائمة
              </button>
            </div>
          </div>

          {/* Management Section */}
          <div className="space-y-8">
            <Entitlement
              employee={selectedEmployee}
              entitlements={entitlements}
              setEntitlements={setEntitlements}
            />
            <Deduction
              employee={selectedEmployee}
              deductions={deductions}
              setDeductions={setDeductions}
              entitlements={entitlements}
            />
          </div>
        </>
      )}
    </div>
  );
}
