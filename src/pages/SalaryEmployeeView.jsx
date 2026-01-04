import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserIcon, Briefcase, GraduationCap, DollarSign } from "lucide-react";

const BASE_URL = "/api";

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
    return "0 د.ع";
  }
  return `${parseFloat(amount).toLocaleString("ar-IQ")} د.ع`;
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

export default function SalaryEmployeeView() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [entitlements, setEntitlements] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const headers = getAuthHeaders();

        // جلب بيانات الموظف
        const empRes = await fetch(`${BASE_URL}/Employee/${employeeId}`, { headers });
        if (empRes.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        if (!empRes.ok) throw new Error("فشل في جلب بيانات الموظف");
        const empData = await empRes.json();
        setEmployee(empData);

        // جلب المخصصات (فقط المعتمدة والنشطة)
        const entRes = await fetch(`${BASE_URL}/Entitlements?employeeID=${employeeId}&PageSize=1000`, { headers });
        if (entRes.ok) {
          const entData = await entRes.json();
          setEntitlements((entData.items || []).filter(e => e.isActive && !e.isStopped));
        }

        // جلب الاستقطاعات (فقط المعتمدة والنشطة)
        const dedRes = await fetch(`${BASE_URL}/Deductions?employeeID=${employeeId}&PageSize=1000`, { headers });
        if (dedRes.ok) {
          const dedData = await dedRes.json();
          setDeductions((dedData.items || []).filter(d => d.isActive && !d.isStopped));
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        alert("فشل في تحميل بيانات الموظف");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId, navigate]);

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

  if (loading) {
    return (
      <div className="p-6 text-center text-blue-600 font-medium">
        <svg className="animate-spin h-5 w-5 text-blue-600 inline-block mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        جارٍ تحميل بيانات الموظف...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-lg">لم يتم العثور على الموظف</p>
      </div>
    );
  }

  const employeeData = organizeEmployeeData();
  const baseSalary = employee?.baseSalary || 0;

  // حساب إجمالي المخصصات والاستقطاعات
  const totalEntitlements = entitlements.reduce((sum, ent) => sum + (ent.amount || 0), 0);
  const totalDeductions = deductions.reduce((sum, ded) => sum + (ded.amount || 0), 0);
  const netSalary = baseSalary + totalEntitlements - totalDeductions;

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-blue-900">
          عرض بيانات راتب الموظف: {employee.fullName}
        </h1>
        <button
          onClick={() => navigate("/salary-department")}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          رجوع
        </button>
      </div>
      <div className="border-b border-blue-100 pb-3 mb-8"></div>

      {/* بطاقات الملخص المالي */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">الراتب الأساسي</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(baseSalary)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">المخصصات</p>
          <p className="text-2xl font-bold text-green-600">+{formatCurrency(totalEntitlements)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">الاستقطاعات</p>
          <p className="text-2xl font-bold text-red-600">-{formatCurrency(totalDeductions)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">الصافي</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(netSalary)}</p>
        </div>
      </div>

      {/* البيانات الشخصية والوظيفية */}
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

      {/* المعلومات المالية */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <DollarSign className="h-7 w-7 text-blue-600" />
          المعلومات المالية
        </h2>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-gray-800 font-bold text-lg">البيانات المالية</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs font-medium text-gray-500 block mb-1">الراتب الأساسي</span>
                <span className="font-semibold text-gray-900 text-sm">{formatCurrency(baseSalary)}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs font-medium text-gray-500 block mb-1">رقم الحساب </span>
                <span className="font-semibold text-gray-900 text-sm">{employee.accountNumber || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* المخصصات */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-gray-800 font-bold text-lg">المخصصات الشهرية</h3>
          </div>
          <div className="p-6">
            {entitlements.length === 0 ? (
              <div className="text-center py-4 text-gray-500">لا توجد مخصصات</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-right p-3">النوع</th>
                      <th className="text-right p-3">المبلغ</th>
                      <th className="text-right p-3">النسبة</th>
                      <th className="text-right p-3">رقم الكتاب</th>
                      <th className="text-right p-3">تاريخ الكتاب</th>
                      <th className="text-right p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entitlements.map((ent, idx) => {
                      // حساب النسبة المئوية من المبلغ والراتب الأساسي
                      let displayPercentage = ent.percentage;
                      if (!displayPercentage && ent.amount && baseSalary > 0) {
                        displayPercentage = ((ent.amount / baseSalary) * 100).toFixed(2);
                      }

                      return (
                        <tr key={idx} className={`border-b hover:bg-green-50 ${ent.isStopped ? 'bg-gray-100 opacity-60' : ''}`}>
                          <td className="p-3">{ent.entitlementTypeName || "غير محدد"}</td>
                          <td className="p-3 font-medium">{formatCurrency(ent.amount)}</td>
                          <td className="p-3">{displayPercentage ? `${displayPercentage}%` : "—"}</td>
                          <td className="p-3">{ent.letterNumber || "—"}</td>
                          <td className="p-3">{ent.letterDate ? new Date(ent.letterDate).toLocaleDateString('ar-IQ') : "—"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ent.isStopped ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {ent.isStopped ? 'متوقف' : 'نشط'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td className="p-3 text-right">المجموع:</td>
                      <td className="p-3 text-green-600">{formatCurrency(totalEntitlements)}</td>
                      <td colSpan="4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* الاستقطاعات */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-gray-800 font-bold text-lg">الاستقطاعات الشهرية</h3>
          </div>
          <div className="p-6">
            {deductions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">لا توجد استقطاعات</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-right p-3">النوع</th>
                      <th className="text-right p-3">المبلغ</th>
                      <th className="text-right p-3">النسبة</th>
                      <th className="text-right p-3">رقم الكتاب</th>
                      <th className="text-right p-3">تاريخ الكتاب</th>
                      <th className="text-right p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deductions.map((ded, idx) => {
                      // حساب النسبة المئوية من المبلغ والراتب الأساسي
                      let displayPercentage = ded.percentage;
                      if (!displayPercentage && ded.amount && baseSalary > 0) {
                        displayPercentage = ((ded.amount / baseSalary) * 100).toFixed(2);
                      }

                      return (
                        <tr key={idx} className={`border-b hover:bg-red-50 ${ded.isStopped ? 'bg-gray-100 opacity-60' : ''}`}>
                          <td className="p-3">{ded.deductionTypeName || "غير محدد"}</td>
                          <td className="p-3 font-medium">{formatCurrency(ded.amount)}</td>
                          <td className="p-3">{displayPercentage ? `${displayPercentage}%` : "—"}</td>
                          <td className="p-3">{ded.letterNumber || "—"}</td>
                          <td className="p-3">{ded.letterDate ? new Date(ded.letterDate).toLocaleDateString('ar-IQ') : "—"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ded.isStopped ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {ded.isStopped ? 'متوقف' : 'نشط'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td className="p-3 text-right">المجموع:</td>
                      <td className="p-3 text-red-600">{formatCurrency(totalDeductions)}</td>
                      <td colSpan="4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
