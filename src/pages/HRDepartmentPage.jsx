import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EditEmployee from "./EditEmployee";
import EmployeeView from "./EmployeeView";

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
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFullPageEdit, setShowFullPageEdit] = useState(false);
  const [showFullPageView, setShowFullPageView] = useState(false);

  // فلاتر البحث المتقدم
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [serviceStatuses, setServiceStatuses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedServiceStatus, setSelectedServiceStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");


  const handleUnauthorized = useCallback(() => {
    alert("يرجى تسجيل الدخول مجددًا");
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const BASE_URL = "http://192.168.11.230:1006/api";

  // جلب قائمة الأقسام
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/Departments?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const depts = Array.isArray(data) ? data : data.items || [];
        setDepartments(depts);
      }
    } catch (err) {
      console.error("خطأ في جلب الأقسام:", err);
    }
  }, [getAuthHeaders]);

  // جلب قائمة المناصب
  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/Position?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const pos = Array.isArray(data) ? data : data.items || [];
        const mapped = pos.map((p) => ({
          value: p.id || p.positionID,
          label: p.name || p.positionName
        }));
        setPositions(mapped);
      }
    } catch (err) {
      console.error("خطأ في جلب المناصب:", err);
    }
  }, [getAuthHeaders]);

  // جلب حالات الخدمة
  const fetchServiceStatuses = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/ServiceStatus?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const statuses = Array.isArray(data) ? data : data.items || [];
        setServiceStatuses(statuses);
      }
    } catch (err) {
      console.error("خطأ في جلب حالات الخدمة:", err);
    }
  }, [getAuthHeaders]);

  // دالة الفلترة المتقدمة
  const applyAdvancedFilters = useCallback((employees) => {
    let filtered = [...employees];

    // فلتر النص
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((emp) => {
        const displayName = getDisplayName(emp);
        return (
          displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (emp.employeeNumber && emp.employeeNumber.toString().includes(searchTerm)) ||
          (emp.accountNumber && emp.accountNumber.toString().includes(searchTerm))
        );
      });
    }

    // فلتر القسم
    if (selectedDepartment) {
      filtered = filtered.filter(
        (emp) => emp.departmentID === parseInt(selectedDepartment) || emp.departmentName === selectedDepartment
      );
    }

    // فلتر المنصب
    if (selectedPosition) {
      filtered = filtered.filter(
        (emp) => emp.positionID === parseInt(selectedPosition)
      );
    }

    // فلتر حالة الخدمة
    if (selectedServiceStatus) {
      filtered = filtered.filter(
        (emp) => emp.serviceStatusID === parseInt(selectedServiceStatus) || emp.serviceStatusName === selectedServiceStatus
      );
    }

    // فلتر التاريخ (سنة وشهر)
    if (selectedDate) {
      filtered = filtered.filter((emp) => {
        // تحقق من تاريخ التعيين أو تاريخ الإنشاء
        const empDate = emp.hireDate || emp.createdAt || emp.appointmentDate;
        if (empDate) {
          const empYearMonth = empDate.substring(0, 7); // استخراج YYYY-MM من التاريخ
          return empYearMonth === selectedDate;
        }
        return false;
      });
    }

    return filtered;
  }, [searchTerm, selectedDepartment, selectedPosition, selectedServiceStatus, selectedDate]);

  // ✅ جلب البيانات دون تعديلها
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Employee?PageSize=1000`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const employees = Array.isArray(data) ? data : data.items || [];

      console.log("👥 Sample employee data:", employees[0]);
      console.log("📌 Does it have departmentID?", employees[0]?.departmentID);

      setAllEmployees(employees);

      // تطبيق الفلترة المتقدمة
      const filtered = applyAdvancedFilters(employees);
      setSearchResults(filtered);
    } catch (err) {
      console.error("خطأ في جلب بيانات الموظفين:", err);
      alert("فشل في تحميل قائمة الموظفين. تحقق من الاتصال.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized, getAuthHeaders, applyAdvancedFilters]);

  // عرض النتائج المفلترة دائماً
  const displayedEmployees = searchResults;

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
        setSelectedEmployee(updatedEmployee);
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
    fetchEmployees(); // تحميل جميع الموظفين عند فتح الصفحة
    fetchDepartments(); // جلب قائمة الأقسام
    fetchPositions(); // جلب قائمة المناصب
    fetchServiceStatuses(); // جلب حالات الخدمة
  }, [fetchEmployees, fetchDepartments, fetchPositions, fetchServiceStatuses]);

  // إعادة تطبيق الفلترة عند تغيير أي فلتر
  useEffect(() => {
    if (allEmployees.length > 0) {
      const filtered = applyAdvancedFilters(allEmployees);
      setSearchResults(filtered);
    }
  }, [searchTerm, selectedDepartment, selectedPosition, selectedServiceStatus, selectedDate, allEmployees, applyAdvancedFilters]);


  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowFullPageView(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowFullPageEdit(true);
  };

  const handleShowAll = () => {
    setSearchTerm("");
    setSelectedDepartment("");
    setSelectedPosition("");
    setSelectedServiceStatus("");
    setSelectedDate("");
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

  // عرض صفحة عرض التفاصيل الكاملة
  if (showFullPageView && selectedEmployee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-md mb-4 p-4">
          <button
            onClick={() => {
              setShowFullPageView(false);
              setSelectedEmployee(null);
            }}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <span className="text-xl">←</span>
            <span>العودة للقائمة</span>
          </button>
        </div>
        <EmployeeView employee={selectedEmployee} />
      </div>
    );
  }

  // عرض صفحة التعديل الكاملة
  if (showFullPageEdit && selectedEmployee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-md mb-4 p-4">
          <button
            onClick={() => {
              setShowFullPageEdit(false);
              setSelectedEmployee(null);
            }}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <span className="text-xl">←</span>
            <span>العودة للقائمة</span>
          </button>
        </div>
        <EditEmployee
          employee={selectedEmployee}
          onSave={async (updatedData) => {
            await updateEmployee(updatedData);
            setShowFullPageEdit(false);
          }}
          readOnly={false}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* العنوان الرئيسي */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">قسم الموارد البشرية</h1>
        <p className="text-gray-600">إدارة ومتابعة بيانات الموظفين</p>
      </div>

      {/* شريط البحث المتقدم */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 text-right">
        <form onSubmit={handleSearchSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
            <input
              type="text"
              placeholder="الاسم"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            >
              <option value="">اختر القسم</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name || dept.departmentName}
                </option>
              ))}
            </select>

            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            >
              <option value="">اختر المنصب</option>
              {positions.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>

            <select
              value={selectedServiceStatus}
              onChange={(e) => setSelectedServiceStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            >
              <option value="">اختر حالة الخدمة</option>
              {serviceStatuses.map((status) => (
                <option key={status.serviceStatusID} value={status.serviceStatusID}>
                  {status.serviceStatusName}
                </option>
              ))}
            </select>


          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
            >
              <span>🔍</span>
              <span>بحث</span>
            </button>
            <button
              type="button"
              onClick={handleShowAll}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              عرض الكل
            </button>
          </div>
        </form>
      </div>

      {/* جدول النتائج */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">جارٍ التحميل...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {displayedEmployees.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">
                {searchTerm.trim() === "" && !selectedDepartment && !selectedPosition && !selectedServiceStatus
                  ? "استخدم الفلاتر أعلاه للبحث عن الموظفين"
                  : "لا توجد نتائج مطابقة للفلاتر المحددة"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-semibold">#</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">الاسم الكامل</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">القسم</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">المنصب</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">العنوان الوظيفي</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">حالة الخدمة</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">الراتب الأساسي</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">الإجراءات</th>
                      </tr>
                    </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayedEmployees.map((emp, index) => (
                    <tr key={emp.id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-3 text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{getDisplayName(emp)}</div>
                        {emp.employeeNumber && (
                          <div className="text-xs text-gray-500">رقم: {emp.employeeNumber}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{emp.departmentName || emp.departmentID || "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{emp.positionName || emp.positionID || "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{emp.jobTitle || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          {emp.serviceStatusName || emp.serviceStatusID || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-green-600">
                          {emp.baseSalary ? `${emp.baseSalary.toLocaleString()} د.ع` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleViewDetails(emp)}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition shadow hover:shadow-md"
                            title="عرض التفاصيل"
                          >
                            📄
                          </button>
                          <button
                            onClick={() => handleEdit(emp)}
                            className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-600 transition shadow hover:shadow-md"
                            title="تعديل"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-700 transition shadow hover:shadow-md"
                            title="حذف"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeTabsPage;