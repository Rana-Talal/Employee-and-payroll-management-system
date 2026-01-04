import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EditEmployee from "./EditEmployee";
import EmployeeView from "./EmployeeView"; // ✅
import SalaryPage from './SalaryPage';

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 mb-4">
      <ul className="flex space-x-6 rtl:space-x-reverse">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              onClick={() => onTabChange(tab.id)}
              className={`py-2 px-3 font-medium text-sm transition ${activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ✅ دالة لعرض الاسم في القائمة فقط (لا تؤثر على البيانات الأصلية)
const getDisplayName = (emp) => {
  if (emp.fullName) return emp.fullName;
  const parts = [
    emp.firstName,
    emp.secondName,
    emp.thirdName,
    emp.fourthName,
    emp.lastName,
  ].filter(p => p != null && p !== "");
  return parts.length > 0 ? parts.join(" ") : "غير معروف";
};

const EmployeeTabsPage = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("hr");
  const [viewMode, setViewMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUnauthorized = useCallback(() => {
    alert("يرجى تسجيل الدخول مجددًا");
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const BASE_URL = "/api";

  // ✅ جلب البيانات دون تعديلها
  const fetchEmployees = useCallback(async (term = "") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Employee`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const allEmployees = Array.isArray(data) ? data : data.items || [];

      if (term.trim() !== "") {
        const filtered = allEmployees.filter((emp) => {
          const displayName = getDisplayName(emp);
          return (
            displayName.toLowerCase().includes(term.toLowerCase()) ||
            (emp.employeeNumber && emp.employeeNumber.toString().includes(term)) ||
            (emp.accountNumber && emp.accountNumber.toString().includes(term))
          );
        });
        setSearchResults(filtered);
      } else {
        setSearchResults(allEmployees);
      }
    } catch (err) {
      console.error("خطأ في جلب بيانات الموظفين:", err);
      alert("فشل في تحميل قائمة الموظفين. تحقق من الاتصال.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  const updateEmployee = async (updatedData) => {
    if (!updatedData.id) {
      alert("خطأ: معرف الموظف غير موجود!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Employee/${updatedData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(updatedData),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (res.ok) {
        const updatedEmployee = await res.json();
        alert("تم التحديث بنجاح!");

        setSearchResults((prev) =>
          prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
        );
        setSelectedEmployee(null);
        setViewMode(null);
      } else {
        const errorText = await res.text();
        alert(`فشل التحديث: ${res.status}`);
        console.error("تفاصيل الخطأ:", errorText);
      }
    } catch (err) {
      console.error("خطأ في التحديث:", err);
      alert("فشل في الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/Employee`, {
          headers: getAuthHeaders(),
          signal: controller.signal,
        });

        if (res.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const allEmployees = Array.isArray(data) ? data : data.items || [];

        const filtered = allEmployees.filter((emp) => {
          const displayName = getDisplayName(emp);
          return (
            displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (emp.employeeNumber && emp.employeeNumber.toString().includes(searchTerm)) ||
            (emp.accountNumber && emp.accountNumber.toString().includes(searchTerm))
          );
        });

        if (!controller.signal.aborted) {
          setSearchResults(filtered);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("خطأ في البحث:", err);
          alert("فشل في البحث. تحقق من الاتصال.");
          setSearchResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [searchTerm, handleUnauthorized]);

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setViewMode("view");
    setActiveTab("hr");
  };

  const handleEdit = (employee) => {
    navigate(`/edit-employee/${employee.id}`);
  };

  const handleBack = () => {
    setSelectedEmployee(null);
    setViewMode(null);
  };

  const handleShowAll = () => {
    setSearchTerm("");
    fetchEmployees();
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;

    try {
      const res = await fetch(`${BASE_URL}/Employee/${employeeId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (res.ok) {
        setSearchResults((prev) => prev.filter((emp) => emp.id !== employeeId));
        alert("تم الحذف بنجاح!");
      } else {
        throw new Error("فشل الحذف");
      }
    } catch (err) {
      console.error("خطأ في الحذف:", err);
      alert("فشل في الحذف. حاول مرة أخرى.");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  // إذا كان هناك موظف محدد، اعرض صفحة التعديل/العرض
  if (selectedEmployee) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition mb-4"
          >
            ← رجوع للقائمة
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {viewMode === "view" ? "عرض تفاصيل الموظف" : "تعديل بيانات الموظف"}
          </h1>
        </div>

        {viewMode === "view" ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <EmployeeView employee={selectedEmployee} />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <Tabs
              tabs={[
                { id: "hr", label: "الموارد البشرية" },
                { id: "salary", label: "الحسابات" },
                { id: "audit", label: "التدقيق" },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <div className="mt-4">
              {activeTab === "hr" && (
                <div className="p-4 border rounded-lg">
                  <EditEmployee
                    employee={selectedEmployee}
                    onSave={updateEmployee}
                    readOnly={false}
                  />
                </div>
              )}

              {activeTab === "salary" && (
                <div className="p-4 border rounded-lg">
                  <SalaryPage
                    employee={selectedEmployee}
                    onSave={async (salaryData) => {
                      const token = localStorage.getItem("token");
                      if (!token) {
                        alert("يجب تسجيل الدخول");
                        return;
                      }

                      const headers = {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                      };

                      try {
                        if (salaryData.entitlements.length > 0) {
                          await fetch("/api/Entitlement", {
                            method: "POST",
                            headers,
                            body: JSON.stringify({
                              employeeID: salaryData.employeeID,
                              entitlements: salaryData.entitlements
                            })
                          });
                        }

                        if (salaryData.deductions.length > 0) {
                          await fetch("/api/Deduction", {
                            method: "POST",
                            headers,
                            body: JSON.stringify({
                              employeeID: salaryData.employeeID,
                              deductions: salaryData.deductions
                            })
                          });
                        }

                        alert("تم حفظ بيانات الراتب بنجاح");
                      } catch (error) {
                        console.error("فشل الحفظ:", error);
                        alert("فشل في حفظ البيانات: " + (error.message || "خطأ غير معروف"));
                      }
                    }}
                  />
                </div>
              )}

              {activeTab === "audit" && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">مراجعة بيانات الموظف</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">الموارد البشرية</h4>
                      <EditEmployee employee={selectedEmployee} readOnly={true} />
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">الحسابات (الراتب)</h4>
                      <SalarySummary
                        employee={selectedEmployee}
                        entitlements={[]}
                        deductions={[]}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // عرض صفحة البحث والقائمة
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">بحث عن موظف</h1>

      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex items-center gap-3 rtl:space-x-reverse flex-wrap sm:flex-nowrap">
          <input
            type="text"
            placeholder="ابحث بالاسم أو الرقم الوظيفي أو رقم الحساب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-lg px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
          />
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
            >
              بحث
            </button>
            <button
              type="button"
              onClick={handleShowAll}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm whitespace-nowrap"
            >
              عرض الكل
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">جارٍ التحميل... ⏳</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4">
          {searchResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm.trim() === "" ? "ابدأ بالبحث عن موظف" : "لا يوجد نتائج مطابقة."}
            </p>
          ) : (
            <ul className="space-y-3">
              {searchResults.map((emp) => (
                <li
                  key={emp.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex-1 min-w-0 leading-normal">
                    <div className="font-semibold text-gray-800 truncate">
                      {getDisplayName(emp)}
                    </div>
                    <div className="text-sm text-gray-800 truncate font-bold ">
                      {emp.jobTitle || "—"} - {emp.departmentName || emp.departmentID || "—"} - الراتب:{" "}
                      {emp.baseSalary || "—"}
                    </div>
                    <div className="text-sm text-orange-800 truncate font-bold ">
                      حالة الخدمة: {" "}  {emp.serviceStatusName || emp.serviceStatusID || "—"}
                    </div>
                  </div>
                  <div className="flex gap-1.5 rtl:gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleViewDetails(emp)}
                      className="bg-green-600 text-white px-3 py-2 rounded text-xs sm:text-sm hover:bg-green-700 transition whitespace-nowrap"
                    >
                      عرض التفاصيل
                    </button>
                    <button
                      onClick={() => handleEdit(emp)}
                      className="bg-blue-500 text-white px-3 py-2 rounded text-xs sm:text-sm hover:bg-blue-600 transition whitespace-nowrap"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded text-xs sm:text-sm hover:bg-red-700 transition whitespace-nowrap"
                    >
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeTabsPage;