import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  GraduationCap,
  Briefcase,
  CreditCard,
  FileText,
  Calendar,
  Award,
  Building2,
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

export default function HREmployeeDetailPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [approvedChanges, setApprovedChanges] = useState([]);
  const [services, setServices] = useState([]);
  const [letters, setLetters] = useState([]);

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

      // 1. جلب بيانات الموظف الكاملة
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

      // 2. جلب المخصصات والاستقطاعات المعتمدة (بعد موافقة التدقيق)
      const changesRes = await fetch(`${BASE_URL}/ChangeReports?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      if (changesRes.ok) {
        const changesData = await changesRes.json();
        const allChanges = changesData.items || changesData || [];
        // فلترة: فقط المعتمدة من التدقيق للموظف الحالي
        const approved = allChanges.filter(c =>
          c.employeeId === parseInt(employeeId) &&
          c.auditApproved === true
        );
        setApprovedChanges(approved);
      }

      // 3. جلب سجلات احتساب الخدمة
      const servicesRes = await fetch(`${BASE_URL}/EmployeeServiceRecord?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        const servicesList = Array.isArray(servicesData) ? servicesData : servicesData.items || [];
        const empServices = servicesList.filter(s => s.employeeId === parseInt(employeeId));
        setServices(empServices);
      }

      // 4. جلب كتب الشكر والترفيعات
      const lettersRes = await fetch(`${BASE_URL}/AppreciationLetter?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      if (lettersRes.ok) {
        const lettersData = await lettersRes.json();
        const lettersList = lettersData.items || [];
        const empLetters = lettersList.filter(l => l.employeeID === parseInt(employeeId));
        setLetters(empLetters);
      }

      // جلب أنواع الخدمات لعرض الأسماء
      const typesRes = await fetch(`${BASE_URL}/Enums/servicetype?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setServiceTypes(typesData || []);
      }

    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      alert("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const [serviceTypes, setServiceTypes] = useState([]);

  const getServiceTypeName = (typeId) => {
    if (!typeId) return "—";
    const numericId = parseInt(typeId);
    const type = serviceTypes.find(t => t.id === numericId || t.id === typeId);
    return type ? type.name : "—";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date)) return "—";
    return date.toLocaleDateString("ar-IQ", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const SectionCard = ({ icon: Icon, title, children, color = "green" }) => {
    const colorClasses = {
      green: "from-green-600 to-emerald-600",
      blue: "from-blue-600 to-indigo-600",
      purple: "from-purple-600 to-pink-600",
      amber: "from-amber-600 to-yellow-600"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-green-50">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-6" dir="rtl">
      <style>{printStyles}</style>

      <div className="max-w-7xl mx-auto print-full-width">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between no-print">
          <div>
            <h1 className="text-4xl font-black text-gray-800 mb-2">البيانات الكاملة للموظف</h1>
            <p className="text-gray-600 text-lg">{fullName}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/hr-dashboard")}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-bold shadow-md flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              العودة
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Printer className="h-5 w-5" />
              طباعة الصفحة
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-6 text-center border-b-2 border-gray-300 pb-4">
          <h1 className="text-3xl font-black text-gray-800 mb-2">البيانات الكاملة للموظف</h1>
          <p className="text-xl text-gray-700">{fullName}</p>
          <p className="text-sm text-gray-500">الرقم الوظيفي: {employee.employeeNumber || "—"}</p>
        </div>

        {/* القسم الأول: المعلومات الأساسية (4 أقسام فرعية) */}
        <SectionCard icon={User} title="المعلومات الأساسية" color="green">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* المعلومات الشخصية */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-green-500 pb-2">
                <User className="h-5 w-5" />
                المعلومات الشخصية
              </h3>
              <InfoRow label="الاسم الكامل" value={fullName} />
              <InfoRow label="الرقم الوظيفي" value={employee.employeeNumber} />
              <InfoRow label="تاريخ الميلاد" value={formatDate(employee.birthDate)} />
              <InfoRow label="الجنس" value={employee.genderName} />
              <InfoRow label="الحالة الاجتماعية" value={employee.maritalStatusName} />
              <InfoRow label="رقم الهاتف" value={employee.phonenumber} />
              <InfoRow label="البريد الإلكتروني" value={employee.email} />
              <InfoRow label="المنطقة" value={employee.region} />
              <InfoRow label="المحلة" value={employee.mahalla} />
              <InfoRow label="رقم الدار" value={employee.houseNumber} />
            </div>

            {/* التعليم والشهادات */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-blue-500 pb-2">
                <GraduationCap className="h-5 w-5" />
                التعليم والشهادات
              </h3>
              <InfoRow label="المستوى التعليمي" value={employee.educationLevelName} />
              <InfoRow label="التخصص" value={employee.specialization} />
              <InfoRow label="اسم الكلية/المعهد" value={employee.collegeName} />
            </div>

            {/* معلومات التعيين */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-purple-500 pb-2">
                <Briefcase className="h-5 w-5" />
                معلومات التعيين
              </h3>
              <InfoRow label="العنوان الوظيفي" value={employee.jobTitle} />
              <InfoRow label="القسم" value={employee.departmentName} />
              <InfoRow label="الفرع" value={employee.branchName} />
              <InfoRow label="الوحدة" value={employee.unitName} />
              <InfoRow label="الدرجة" value={employee.grade} />
              <InfoRow label="المرحلة" value={employee.step} />
              <InfoRow label="الراتب الأساسي" value={employee.baseSalary ? `${employee.baseSalary.toLocaleString()} د.ع` : "—"} />
              <InfoRow label="تاريخ التعيين" value={formatDate(employee.appointmentOrderDate)} />
              <InfoRow label="رقم أمر التعيين" value={employee.appointmentOrderNumber} />
            </div>

            {/* المعلومات المصرفية */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-amber-500 pb-2">
                <CreditCard className="h-5 w-5" />
                المعلومات المصرفية
              </h3>
              <InfoRow label="اسم البنك" value={employee.bankName} />
              <InfoRow label="رقم الحساب " value={employee.accountNumber} />
            </div>
          </div>
        </SectionCard>

        {/* القسم الثاني: المخصصات والاستقطاعات المعتمدة */}
        <SectionCard icon={FileText} title="المخصصات والاستقطاعات المعتمدة" color="blue">
          {approvedChanges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>لا توجد مخصصات أو استقطاعات معتمدة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedChanges.map((change, index) => (
                <div key={change.id || index} className="border border-blue-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">نوع التغيير</p>
                      <p className="font-bold text-gray-900">{change.changeTypeName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">المبلغ</p>
                      <p className="font-bold text-gray-900">{change.amount ? `${change.amount.toLocaleString()} د.ع` : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">تاريخ التأثير</p>
                      <p className="font-bold text-gray-900">{formatDate(change.effectiveDate)}</p>
                    </div>
                  </div>
                  {change.notes && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-gray-600 mb-1">الملاحظات</p>
                      <p className="text-sm text-gray-800">{change.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* القسم الثالث: احتساب الخدمة */}
        <SectionCard icon={Calendar} title="احتساب الخدمة" color="purple">
          {services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>لا توجد سجلات خدمة مسجلة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={service.id || index} className="border border-purple-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">نوع الخدمة</p>
                      <p className="font-bold text-gray-900">{getServiceTypeName(service.serviceType)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">رقم الأمر الإداري</p>
                      <p className="font-bold text-gray-900">{service.administrativeOrderNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">تاريخ الأمر الإداري</p>
                      <p className="font-bold text-gray-900">{formatDate(service.administrativeOrderDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">مدة الخدمة</p>
                      <p className="font-bold text-gray-900">
                        {formatDate(service.dateStart)} → {formatDate(service.dateEnd)}
                      </p>
                    </div>
                  </div>
                  {(service.year > 0 || service.month > 0 || service.day > 0) && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">المدة المحسوبة</p>
                      <div className="flex items-center gap-3 text-sm font-bold text-purple-700">
                        <span>{service.year || 0} سنة</span>
                        <span>•</span>
                        <span>{service.month || 0} شهر</span>
                        <span>•</span>
                        <span>{service.day || 0} يوم</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* القسم الرابع: كتب الشكر والترفيعات */}
        <SectionCard icon={Award} title="كتب الشكر والترفيعات" color="amber">
          {letters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>لا توجد كتب شكر أو ترفيعات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {letters.map((letter, index) => (
                <div key={letter.id || index} className="border border-amber-200 rounded-lg p-4 bg-gradient-to-br from-amber-50 to-yellow-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-700" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300">
                            {letter.letterTypeName || "نوع الكتاب"}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                            {letter.periodName || "المدة"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">السبب</p>
                      <p className="text-sm text-gray-800">{letter.reason || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">رقم الأمر الإداري</p>
                      <p className="text-sm text-gray-800">{letter.adminOrderNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">تاريخ الأمر الإداري</p>
                      <p className="text-sm text-gray-800">{formatDate(letter.adminOrderDate)}</p>
                    </div>
                    {letter.periodOrderNumber && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">رقم أمر الفترة</p>
                        <p className="text-sm text-gray-800">{letter.periodOrderNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
