import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserIcon, Briefcase, GraduationCap, CalendarDays, TrashIcon, Calculator, CheckCircle, XCircle, DollarSign, Eye } from "lucide-react";
import { formatCurrency as formatCurrencyUtil } from "../utils/formatNumber";

const BASE_URL = "/api";

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
    return "0 د.ع";
  }
  return formatCurrencyUtil(parseFloat(amount));
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("ar-IQ");
};

const DataSection = ({ title, data, icon: Icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-blue-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-blue-700" />}
          <h3 className="text-gray-800 font-bold text-lg">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs font-medium text-gray-500 block mb-1">{key}</span>
              <span className="font-semibold text-gray-900 text-sm break-words">{value || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LatestSalaryCard = ({ latestSalary, baseSalary }) => {
  if (!latestSalary) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-yellow-600" />
          <div>
            <p className="font-bold text-yellow-800 text-lg">لم يتم احتساب راتب بعد</p>
            <p className="text-yellow-700 text-sm mt-1">اضغط على "احتساب راتب شهر جديد" أدناه لحساب الراتب</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100">


      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <span className="font-semibold text-gray-700">الراتب الأساسي</span>
          <span className="font-bold text-xl text-blue-700">{formatCurrency(latestSalary.baseSalary || baseSalary)}</span>
        </div>

        <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <span className="font-semibold text-gray-700">إجمالي المخصصات</span>
          <span className="font-bold text-xl text-green-700">+{formatCurrency(latestSalary.totalEntitlements || 0)}</span>
        </div>

        <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
          <span className="font-semibold text-gray-700">إجمالي الاستقطاعات</span>
          <span className="font-bold text-xl text-red-700">-{formatCurrency(latestSalary.totalDeductions || 0)}</span>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg font-bold border-t-2 border-gray-300">
          <span className="text-gray-800 text-base">الراتب الإجمالي</span>
          <span className="text-lg text-gray-900">{formatCurrency(latestSalary.salaryWithEntitlements || 0)}</span>
        </div>

        <div className="flex justify-between items-center p-4 bg-blue-600 rounded-lg text-white shadow-xl">
          <span className="font-extrabold text-lg">صافي الراتب</span>
          <span className="font-extrabold text-2xl">{formatCurrency(latestSalary.finalAmount || 0)}</span>
        </div>

        {latestSalary.notes && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 font-medium">ملاحظات:</p>
            <p className="text-sm text-gray-800 mt-1">{latestSalary.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};


export default function SalaryPage({ employee: employeeProp }) {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(employeeProp || null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [finalSalaries, setFinalSalaries] = useState([]);
  const [loadingSalaries, setLoadingSalaries] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (employeeProp) {
        setEmployee(employeeProp);
        setLoading(false);
        return;
      }

      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/Employee/${employeeId}`, {
          headers: getAuthHeaders(),
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("فشل في جلب بيانات الموظف");

        const data = await res.json();
        setEmployee(data);
      } catch (error) {
        console.error("خطأ في جلب بيانات الموظف:", error);
        showToast("فشل في تحميل بيانات الموظف", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId, employeeProp, navigate]);

  const fetchFinalSalaries = async () => {
    const empID = employee?.id || employee?.employeeID || employee?.employeeNumber;
    if (!empID) return;

    try {
      setLoadingSalaries(true);
      const res = await fetch(
        `${BASE_URL}/FinalSalary?employeeID=${empID}&PageSize=1000`,
        { headers: getAuthHeaders() }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("فشل في جلب سجل الرواتب");

      const data = await res.json();
      setFinalSalaries(data.items || data || []);
    } catch (error) {
      console.error("خطأ في جلب سجل الرواتب:", error);
      showToast("فشل في تحميل سجل الرواتب", "error");
    } finally {
      setLoadingSalaries(false);
    }
  };

  useEffect(() => {
    if (employee) {
      fetchFinalSalaries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee]);

  const handleCalculateSalary = async () => {
    const empID = employee?.id || employee?.employeeID || employee?.employeeNumber;
    if (!empID) {
      showToast("الموظف غير محدد", "error");
      return;
    }

    const month = prompt("أدخل الشهر (1-12):");
    if (!month || isNaN(month) || month < 1 || month > 12) {
      showToast("الرجاء إدخال شهر صحيح (1-12)", "error");
      return;
    }

    const year = prompt("أدخل السنة :");
    if (!year || isNaN(year) || year < 2000) {
      showToast("الرجاء إدخال سنة صحيحة", "error");
      return;
    }

    const notes = prompt("ملاحظات (اختياري):") || null;

    try {
      setLoadingSalaries(true);
      const body = {
        employeeID: parseInt(empID, 10),
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        notes: notes,
      };

      const res = await fetch(`${BASE_URL}/FinalSalary/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "فشل في احتساب الراتب");
      }

      showToast("تم احتساب الراتب بنجاح ✓", "success");
      fetchFinalSalaries();
    } catch (error) {
      console.error("خطأ في احتساب الراتب:", error);
      showToast(error.message || "فشل في احتساب الراتب", "error");
    } finally {
      setLoadingSalaries(false);
    }
  };

  const handleDeleteSalary = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا السجل؟")) return;

    try {
      const res = await fetch(`${BASE_URL}/FinalSalary/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("فشل في حذف السجل");

      showToast("تم حذف السجل بنجاح ✓", "success");
      fetchFinalSalaries();
    } catch (error) {
      console.error("خطأ في حذف السجل:", error);
      showToast("فشل في حذف السجل", "error");
    }
  };

  const organizeEmployeeData = () => {
    if (!employee) return null;

    return {
      personal: {
        "الاسم الكامل": employee.fullName,
        "البريد الإلكتروني": employee.email,
        "رقم الهاتف": employee.phonenumber,
        "الجنس": employee.genderName,
        "تاريخ الميلاد": formatDate(employee.birthDate),
        "الحالة الاجتماعية": employee.maritalStatusName,
      },
      education: {
        "المستوى التعليمي": employee.educationLevelName,
        "التخصص": employee.specialization,
        "اسم الكلية/المعهد": employee.collegeName,
      },
      job: {
        "الرقم الوظيفي": employee.employeeNumber,
        "العنوان الوظيفي": employee.jobTitle,
        "القسم": employee.departmentName,
        "الفرع": employee.branchName,
        "الدرجة": employee.grade,
        "تاريخ المباشرة": formatDate(employee.startWorkDate),
      },
    };
  };

  if (!employee) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-lg">الرجاء تحديد موظف لعرض بيانات الراتب.</p>
      </div>
    );
  }

  const employeeData = organizeEmployeeData();

  if (loading) {
    return (
      <div className="p-6 text-center text-blue-600 font-medium">
        <svg className="animate-spin h-5 w-5 text-blue-600 inline-block mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        جارٍ تحميل بيانات الراتب...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl border-2 flex items-center gap-3 animate-bounce ${
          toast.type === "success"
            ? "bg-green-50 border-green-500 text-green-800"
            : "bg-red-50 border-red-500 text-red-800"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="h-6 w-6" />
          ) : (
            <XCircle className="h-6 w-6" />
          )}
          <span className="font-bold text-lg">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-blue-900">
          إدارة راتب الموظف: {employee.fullName}
        </h1>
        {employeeId && (
          <button
            onClick={() => navigate("/salary-department")}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            رجوع
          </button>
        )}
      </div>
      <div className="border-b border-blue-100 pb-3 mb-8"></div>

      <div className="mb-10 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UserIcon className="h-7 w-7 text-blue-600" />
          البيانات الشخصية والوظيفية
        </h2>

        <div className="flex gap-2 mb-4 border-b">
          {[
            { id: "personal", label: "البيانات الشخصية", icon: UserIcon },
            { id: "education", label: "البيانات التعليمية", icon: GraduationCap },
            { id: "job", label: "البيانات الوظيفية", icon: Briefcase },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "personal" && <DataSection title="المعلومات الشخصية" data={employeeData.personal} icon={UserIcon} />}
        {activeTab === "education" && <DataSection title="المعلومات التعليمية" data={employeeData.education} icon={GraduationCap} />}
        {activeTab === "job" && <DataSection title="المعلومات الوظيفية" data={employeeData.job} icon={Briefcase} />}
      </div>


      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-t pt-6 border-gray-200">
        <CalendarDays className="h-7 w-7 text-blue-600" />
        سجل الرواتب الشهرية
      </h2>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-700" />
              <h3 className="text-gray-800 font-bold text-lg">سجل الرواتب الشهرية</h3>
            </div>
            <button
              onClick={handleCalculateSalary}
              disabled={loadingSalaries}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              <Calculator className="h-4 w-4" />
              احتساب راتب شهر جديد
            </button>
          </div>

          <div className="p-6">
            {loadingSalaries ? (
              <div className="text-center text-blue-600 py-8">
                <svg className="animate-spin h-5 w-5 text-blue-600 inline-block mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جارٍ التحميل...
              </div>
            ) : finalSalaries.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg">لا توجد سجلات رواتب محفوظة</p>
                <p className="text-sm mt-2">استخدم زر "احتساب راتب شهر جديد" لإنشاء سجل جديد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-right p-3 font-semibold text-gray-700">الشهر/السنة</th>
                      <th className="text-right p-3 font-semibold text-gray-700">الراتب الأساسي</th>
                      <th className="text-right p-3 font-semibold text-gray-700">إجمالي المخصصات</th>
                      <th className="text-right p-3 font-semibold text-gray-700">إجمالي الاستقطاعات</th>
                      <th className="text-right p-3 font-semibold text-gray-700">صافي الراتب</th>
                      <th className="text-right p-3 font-semibold text-gray-700">ملاحظات</th>
                      <th className="text-right p-3 font-semibold text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalSalaries.map((salary) => (
                      <tr key={salary.finalSalaryID} className="border-b hover:bg-blue-50 cursor-pointer transition" onClick={() => navigate(`/salary-details/${salary.finalSalaryID}`)}>
                        <td className="p-3 font-medium">
                          {salary.month}/{salary.year}
                        </td>
                        <td className="p-3">{formatCurrency(salary.baseSalary)}</td>
                        <td className="p-3 text-green-700 font-medium">
                          {formatCurrency(salary.totalEntitlements)}
                        </td>
                        <td className="p-3 text-red-700 font-medium">
                          {formatCurrency(salary.totalDeductions)}
                        </td>
                        <td className="p-3 font-bold text-blue-700 text-base">
                          {formatCurrency(salary.finalAmount)}
                        </td>
                        <td className="p-3 text-gray-600 text-xs max-w-xs truncate">
                          {salary.notes || "—"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/salary-details/${salary.finalSalaryID}`);
                              }}
                              className="text-blue-600 hover:text-blue-800 transition p-1 hover:bg-blue-50 rounded"
                              title="عرض التفاصيل"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSalary(salary.finalSalaryID);
                              }}
                              className="text-red-600 hover:text-red-800 transition p-1 hover:bg-red-50 rounded"
                              title="حذف"
                            >
                              <TrashIcon className="h-4 w-4" />
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
        </div>
    </div>
  );
}