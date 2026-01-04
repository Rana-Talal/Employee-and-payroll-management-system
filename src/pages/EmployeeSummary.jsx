import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatNumber } from "../utils/formatNumber";
import { Printer, ArrowLeft } from "lucide-react";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

const BASE_URL = "/api";

// أنماط الطباعة
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
      width: 100% !important;
      max-width: 100% !important;
    }

    details {
      display: none !important;
    }

    .bg-gradient-to-l {
      background: #2563eb !important;
    }
  }
`;

export default function EmployeeSummary() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [entitlements, setEntitlements] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers = getAuthHeaders();

        // جلب بيانات الموظف الأساسية
        const empRes = await fetch(`${BASE_URL}/Employee/${employeeId}`, { headers });
        if (!empRes.ok) throw new Error("فشل في جلب بيانات الموظف");
        const empData = await empRes.json();
        setEmployee(empData);

        // جلب المخصصات
        const entRes = await fetch(`${BASE_URL}/Entitlement?employeeID=${employeeId}&PageSize=1000`, { headers });
        if (entRes.ok) {
          const entData = await entRes.json();
          setEntitlements((entData.items || []).filter(e => e.isActive !== false));
        }

        // جلب الاستقطاعات
        const dedRes = await fetch(`${BASE_URL}/Deductions?employeeID=${employeeId}&PageSize=1000`, { headers });
        if (dedRes.ok) {
          const dedData = await dedRes.json();
          setDeductions((dedData.items || []).filter(d => d.isActive !== false));
        }

      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
        setError(err.message);
        if (err.message?.includes("401")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId, navigate]);

  const InfoCard = ({ title, children, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-100 text-blue-900",
      green: "bg-green-50 border-green-100 text-green-900",
      purple: "bg-purple-50 border-purple-100 text-purple-900",
      orange: "bg-orange-50 border-orange-100 text-orange-900",
      red: "bg-red-50 border-red-100 text-red-900",
      gray: "bg-gray-50 border-gray-100 text-gray-900"
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className={`px-5 py-4 border-b ${colorClasses[color] || colorClasses.blue}`}>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    );
  };

  const InfoRow = ({ label, value }) => {
    // إخفاء الصف إذا كانت القيمة فارغة
    if (!value || value === "غير محدد" || value === "0001-01-01") return null;

    return (
      <div className="py-3 border-b border-gray-100 last:border-0 grid grid-cols-5 gap-4 items-center">
        <span className="text-sm font-semibold text-gray-700 col-span-2">{label}:</span>
        <span className="text-sm text-gray-900 col-span-3">{value}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl text-red-600">خطأ: {error}</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">لم يتم العثور على الموظف</div>
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

  // حساب إجمالي المخصصات والاستقطاعات
  const totalEntitlements = entitlements.reduce((sum, ent) => sum + (ent.amount || 0), 0);
  const totalDeductions = deductions.reduce((sum, ded) => sum + (ded.amount || 0), 0);

  // حساب الراتب الجديد (الراتب الأساسي + المخصصات)
  const baseSalary = employee.baseSalary || 0;
  const newSalary = baseSalary + totalEntitlements;
  const netSalary = newSalary - totalDeductions;

  // فصل المخصصات حسب النوع
  const getEntitlementAmount = (typeName) => {
    const ent = entitlements.find(e => e.entitlementTypeName === typeName);
    return ent ? (ent.amount || 0) : 0;
  };

  // فصل الاستقطاعات حسب النوع
  const getDeductionAmount = (typeName) => {
    const ded = deductions.find(d => d.deductionTypeName === typeName);
    return ded ? (ded.amount || 0) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* إضافة أنماط الطباعة */}
      <style>{printStyles}</style>

      <div className="mx-auto print-full-width">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">بودرة الموظف</h1>
            <p className="text-gray-600">{fullName}</p>
          </div>
          <div className="flex gap-3 no-print">
            <button
              onClick={() => navigate("/accounting-dashboard")}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-bold shadow-md flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              العودة
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Printer className="h-5 w-5" />
              طباعة الصفحة
            </button>
          </div>
        </div>

        {/* بودرة الموظف */}
        <div className="bg-white border border-gray-300 mb-6">
          {/* Header بسيط */}
          <div className="bg-blue-600 text-white p-4 border-b border-gray-300">
            <h2 className="text-xl font-bold text-center">بودرة الموظف الشهرية</h2>
          </div>

          <div className="p-6">
            {/* معلومات الموظف الأساسية */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">الاسم الكامل: </span>
                <span className="font-bold text-gray-900">{fullName}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">الرقم الوظيفي: </span>
                <span className="font-bold text-gray-900">{employee.employeeNumber || "غير محدد"}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">القسم: </span>
                <span className="font-bold text-gray-900">{employee.departmentName || "غير محدد"}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">العنوان الوظيفي: </span>
                <span className="font-bold text-gray-900">{employee.jobTitle || "غير محدد"}</span>
              </div>
            </div>

            {/* ملخص الراتب */}
            <div className="mb-6 grid grid-cols-5 gap-4">
              <div className="bg-blue-50 p-4 border border-blue-200 rounded">
                <div className="text-lg text-gray-600 mb-1">الراتب الاسمي</div>
                <div className="text-xl font-bold text-gray-900">{formatNumber(baseSalary)}</div>
              </div>
              <div className="bg-green-50 p-4 border border-green-200 rounded">
                <div className="text-lg text-gray-600 mb-1">مجموع المخصصات</div>
                <div className="text-xl font-bold text-green-700">{formatNumber(totalEntitlements)}</div>
              </div>

              <div className="bg-red-50 p-4 border border-red-200 rounded">
                <div className="text-lg text-gray-600 mb-1">مجموع الاستقطاعات</div>
                <div className="text-xl font-bold text-red-700">{formatNumber(totalDeductions)}</div>
              </div>
              <div className="bg-purple-50 p-4 border border-purple-200 rounded">
                <div className="text-lg text-gray-600 mb-1">مجموع الاستحقاق</div>
                <div className="text-xl font-bold text-purple-700">{formatNumber(newSalary)}</div>
              </div>
              <div className="bg-gray-500 p-4 border border-gray-700 rounded">
                <div className="text-lg text-gray-300 mb-1">الصافي </div>
                <div className="text-2xl font-bold text-white">{formatNumber(netSalary)}</div>
              </div>
            </div>

            {/* المخصصات والاستقطاعات */}
            <div className="space-y-4 mb-6">
              {/* المخصصات */}
              <Disclosure defaultOpen={true}>
                {({ open }) => (
                  <div className="mb-4">
                    <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-cyan-800 rounded-t-lg rounded-lg focus:outline-none">
                      <span className="text-white font-bold">المخصصات</span>
                      <ChevronUpIcon className={`${open ? "rotate-180 transform" : ""} h-6 w-6 text-white transition duration-150 ease-in-out`} />
                    </Disclosure.Button>
                    <Disclosure.Panel className="p-4 bg-white border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مخصصات الشهادة</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getEntitlementAmount("مخصصات الشهادة"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مخصصات حرفية</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getEntitlementAmount("مخصصات حرفية"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مخصصات المنصب</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getEntitlementAmount("مخصصات المنصب"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مخصصات الزوجية</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getEntitlementAmount("مخصصات الزوجية"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مخصصات الأطفال</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getEntitlementAmount("مخصصات الأطفال"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مخصصات الهندسة</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getEntitlementAmount("مخصصات الهندسة"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مخصصات الجامعية</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getEntitlementAmount("مخصصات الجامعية"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مخصصات مهنية</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getEntitlementAmount("مخصصات مهنية"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مخصصات موقع</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getEntitlementAmount("مخصصات موقع"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مخصصات الخطورة</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getEntitlementAmount("مخصصات الخطورة"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مخصصات مقطوعة</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getEntitlementAmount("مخصصات مقطوعة"))}
                        </div>
                      </div>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>

              {/* الاستقطاعات */}
              <Disclosure defaultOpen={true}>
                {({ open }) => (
                  <div className="mb-4">
                    <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-red-300 rounded-t-lg rounded-lg focus:outline-none">
                      <span className="text-red-700 font-bold">الاستقطاعات</span>
                      <ChevronUpIcon className={`${open ? "rotate-180 transform" : ""} h-6 w-6 text-red-700 transition duration-150 ease-in-out`} />
                    </Disclosure.Button>
                    <Disclosure.Panel className="p-4 bg-white border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">التقاعد</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getDeductionAmount("التقاعد"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ضريبة الدخل</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getDeductionAmount("ضريبة الدخل"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ايجار دور</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getDeductionAmount("ايجار دور"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مصرف الرافدين</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getDeductionAmount("مصرف الرافدين"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الرعاية الاجتماعية</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getDeductionAmount("الرعاية الاجتماعية"))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">مصرف الرشيد</label>
                        <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                          {formatNumber(getDeductionAmount("مصرف الرشيد"))}
                        </div>
                      </div>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            </div>

            {/* الملاحظات */}
            {employee.notes && (
              <div className="border border-gray-300 rounded">
                <div className="bg-gray-600 text-white p-3 font-bold">الملاحظات</div>
                <div className="p-4 bg-gray-50">
                  <p className="text-gray-900 whitespace-pre-wrap">{employee.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* معلومات إضافية قابلة للطي */}
        <details className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <summary className="px-6 py-4 cursor-pointer font-bold text-gray-800 hover:bg-gray-50 transition">
            📋 معلومات تفصيلية إضافية
          </summary>

          <div className="p-6 border-t border-gray-200 space-y-4">
            {/* المعلومات الشخصية */}
            <Disclosure defaultOpen={false}>
              {({ open }) => (
                <div className="mb-4">
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-blue-300 rounded-t-lg rounded-lg focus:outline-none">
                    <span className="text-white font-bold">المعلومات الشخصية</span>
                    <ChevronUpIcon className={`${open ? "rotate-180 transform" : ""} h-6 w-6 text-white transition duration-150 ease-in-out`} />
                  </Disclosure.Button>
                  <Disclosure.Panel className="p-4 bg-white border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {fullName}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الرقم الوظيفي</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.employeeNumber || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.birthDate?.split("T")[0] || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.genderName || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الحالة الاجتماعية</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.maritalStatusName || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.phonenumber || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.email || "غير محدد"}
                      </div>
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>

            {/* المعلومات الوظيفية */}
            <Disclosure defaultOpen={false}>
              {({ open }) => (
                <div className="mb-4">
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-blue-300 rounded-t-lg rounded-lg focus:outline-none">
                    <span className="text-white font-bold">المعلومات الوظيفية</span>
                    <ChevronUpIcon className={`${open ? "rotate-180 transform" : ""} h-6 w-6 text-white transition duration-150 ease-in-out`} />
                  </Disclosure.Button>
                  <Disclosure.Panel className="p-4 bg-white border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الوظيفي</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.jobTitle || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.departmentName || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الفرع</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.branchName || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.unitName || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الدرجة والمرحلة</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.grade && employee.step ? `${employee.grade} / ${employee.step}` : "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الراتب الأساسي</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {formatNumber(employee.baseSalary)} د.ع
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التعيين</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.appointmentOrderDate?.split("T")[0] || "غير محدد"}
                      </div>
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>

            {/* المؤهلات العلمية */}
            <Disclosure defaultOpen={false}>
              {({ open }) => (
                <div className="mb-4">
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-blue-300 rounded-t-lg rounded-lg focus:outline-none">
                    <span className="text-white font-bold">المؤهلات العلمية</span>
                    <ChevronUpIcon className={`${open ? "rotate-180 transform" : ""} h-6 w-6 text-white transition duration-150 ease-in-out`} />
                  </Disclosure.Button>
                  <Disclosure.Panel className="p-4 bg-white border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المستوى التعليمي</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.educationLevelName || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">التخصص</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.specialization || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اسم الكلية/المعهد</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.collegeName || "غير محدد"}
                      </div>
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>

            {/* المعلومات الإضافية */}
            <Disclosure defaultOpen={false}>
              {({ open }) => (
                <div className="mb-4">
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-blue-300 rounded-t-lg rounded-lg focus:outline-none">
                    <span className="text-white font-bold">المعلومات الإضافية</span>
                    <ChevronUpIcon className={`${open ? "rotate-180 transform" : ""} h-6 w-6 text-white transition duration-150 ease-in-out`} />
                  </Disclosure.Button>
                  <Disclosure.Panel className="p-4 bg-white border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رقم الحساب</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.accountNumber || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.region || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المحلة</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.mahalla || "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رقم الدار</label>
                      <div className="border border-gray-300 rounded p-2 bg-gray-50 text-gray-900 font-semibold">
                        {employee.houseNumber || "غير محدد"}
                      </div>
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          </div>
        </details>
      </div>
    </div>
  );
}
