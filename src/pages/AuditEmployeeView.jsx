import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Briefcase,
  DollarSign,
  FileText,
  Printer,
  ArrowLeft
} from "lucide-react";

const BASE_URL = "/api";

const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 1cm;
    }
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .no-print {
      display: none !important;
    }
    .print-full-width {
      max-width: 100% !important;
    }
  }
`;

export default function AuditEmployeeView() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [entitlements, setEntitlements] = useState([]);
  const [deductions, setDeductions] = useState([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // جلب بيانات الموظف
      const empRes = await fetch(`${BASE_URL}/Employee/${employeeId}`, {
        headers: getAuthHeaders(),
      });
      if (empRes.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      if (!empRes.ok) throw new Error("فشل في جلب بيانات الموظف");
      const empData = await empRes.json();
      setEmployee(empData);

      // جلب المخصصات
      const entitlementsRes = await fetch(
        `${BASE_URL}/EmployeeEntitlement/employee/${employeeId}`,
        { headers: getAuthHeaders() }
      );
      if (entitlementsRes.ok) {
        const entData = await entitlementsRes.json();
        setEntitlements(Array.isArray(entData) ? entData : entData.items || []);
      }

      // جلب الاستقطاعات
      const deductionsRes = await fetch(
        `${BASE_URL}/EmployeeDeduction/employee/${employeeId}`,
        { headers: getAuthHeaders() }
      );
      if (deductionsRes.ok) {
        const dedData = await deductionsRes.json();
        setDeductions(Array.isArray(dedData) ? dedData : dedData.items || []);
      }
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      alert("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return num.toLocaleString("en-US");
  };

  const InfoRow = ({ label, value }) => {
    if (!value || value === "—" || value === "0001-01-01") return null;
    return (
      <div className="py-2 border-b border-gray-100 last:border-0 grid grid-cols-3 gap-4">
        <span className="text-sm font-semibold text-gray-700">{label}:</span>
        <span className="text-sm text-gray-900 col-span-2">{value}</span>
      </div>
    );
  };

  const SectionCard = ({ icon: Icon, title, children, color = "purple" }) => {
    const colorClasses = {
      purple: "from-purple-600 to-pink-600",
      blue: "from-blue-600 to-indigo-600",
      green: "from-green-600 to-emerald-600"
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden mb-6">
        <div className={`bg-gradient-to-r ${colorClasses[color]} text-white px-6 py-4 flex items-center gap-3`}>
          <Icon className="h-6 w-6" />
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="text-center">
          <p className="text-xl text-gray-700">لم يتم العثور على الموظف</p>
        </div>
      </div>
    );
  }

  const fullName = employee.fullName || [
    employee.firstName,
    employee.secondName,
    employee.thirdName,
    employee.fourthName,
    employee.lastName
  ].filter(Boolean).join(" ") || "غير معروف";

  const totalEntitlements = entitlements.reduce((sum, ent) => sum + (ent.amount || 0), 0);
  const totalDeductions = deductions.reduce((sum, ded) => sum + (ded.amount || 0), 0);
  const baseSalary = employee.baseSalary || 0;
  const newSalary = baseSalary + totalEntitlements;
  const netSalary = newSalary - totalDeductions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6" dir="rtl">
      <style>{printStyles}</style>

      <div className="max-w-7xl mx-auto print-full-width">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between no-print">
          <div>
            <h1 className="text-4xl font-black text-gray-800 mb-2">بيانات الموظف  </h1>
            <p className="text-gray-600 text-lg">{fullName}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/audit-dashboard")}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-bold shadow-md flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              العودة
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Printer className="h-5 w-5" />
              طباعة الصفحة
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-6 text-center border-b-2 border-gray-300 pb-4">
          <h1 className="text-3xl font-black text-gray-800 mb-2">بيانات الموظف - للتدقيق</h1>
          <p className="text-xl text-gray-700">{fullName}</p>
          <p className="text-sm text-gray-500">الرقم الوظيفي: {employee.employeeNumber || "—"}</p>
        </div>

        {/* المعلومات الأساسية */}
        <SectionCard icon={User} title="المعلومات الأساسية" color="purple">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InfoRow label="الاسم الكامل" value={fullName} />
              <InfoRow label="الرقم الوظيفي" value={employee.employeeNumber} />
              <InfoRow label="الجنس" value={employee.genderName} />
              <InfoRow label="الحالة الاجتماعية" value={employee.maritalStatusName} />
              <InfoRow label="رقم الهاتف" value={employee.phonenumber} />
            </div>
            <div>
              <InfoRow label="العنوان الوظيفي" value={employee.jobTitle} />
              <InfoRow label="القسم" value={employee.departmentName} />
              <InfoRow label="الفرع" value={employee.branchName} />
              <InfoRow label="المستوى التعليمي" value={employee.educationLevelName} />
            </div>
          </div>
        </SectionCard>

        {/* معلومات الراتب */}
        <SectionCard icon={DollarSign} title="ملخص الراتب" color="green">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">الراتب الأساسي</div>
              <div className="text-lg font-bold text-gray-900">{formatNumber(baseSalary)}</div>
            </div>
            <div className="bg-green-50 p-4 border border-green-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">المخصصات</div>
              <div className="text-lg font-bold text-green-700">{formatNumber(totalEntitlements)}</div>
            </div>
            <div className="bg-red-50 p-4 border border-red-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">الاستقطاعات</div>
              <div className="text-lg font-bold text-red-700">{formatNumber(totalDeductions)}</div>
            </div>
            <div className="bg-purple-50 p-4 border border-purple-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">الاستحقاق</div>
              <div className="text-lg font-bold text-purple-700">{formatNumber(newSalary)}</div>
            </div>
            <div className="bg-gray-700 p-4 border border-gray-800 rounded-lg">
              <div className="text-sm text-gray-300 mb-1">الصافي</div>
              <div className="text-xl font-bold text-white">{formatNumber(netSalary)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* المخصصات */}
            <div className="border border-green-200 rounded-lg overflow-hidden">
              <div className="bg-green-100 text-green-800 px-4 py-2 font-bold">المخصصات</div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {entitlements.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد مخصصات</p>
                ) : (
                  <div className="space-y-2">
                    {entitlements.map((ent, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-700">{ent.entitlementTypeName || "—"}</span>
                        <span className="text-sm font-bold text-green-700">{formatNumber(ent.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* الاستقطاعات */}
            <div className="border border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-100 text-red-800 px-4 py-2 font-bold">الاستقطاعات</div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {deductions.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد استقطاعات</p>
                ) : (
                  <div className="space-y-2">
                    {deductions.map((ded, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-700">{ded.deductionTypeName || "—"}</span>
                        <span className="text-sm font-bold text-red-700">{formatNumber(ded.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* معلومات إضافية */}
        <SectionCard icon={FileText} title="معلومات إضافية" color="blue">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InfoRow label="الدرجة" value={employee.grade} />
              <InfoRow label="المرحلة" value={employee.step} />
              <InfoRow label="التخصص" value={employee.specialization} />
            </div>
            <div>
              <InfoRow label="اسم البنك" value={employee.bankName} />
              <InfoRow label="رقم الحساب " value={employee.accountNumber} />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
