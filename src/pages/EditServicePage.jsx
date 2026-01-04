import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, User, Calendar, Building2 } from "lucide-react";

const BASE_URL = "/api";

export default function EditServicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [serviceTypes, setServiceTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    serviceType: "",
    administrativeOrderDate: "",
    administrativeOrderNumber: "",
    dateStart: "",
    dateEnd: "",
    day: 0,
    month: 0,
    year: 0
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // جلب أنواع الخدمات
      const typesRes = await fetch(`${BASE_URL}/Enums/servicetype?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      const typesData = await typesRes.json();
      setServiceTypes(typesData || []);

      // جلب الموظفين
      const employeesRes = await fetch(`${BASE_URL}/Employee?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      const employeesData = await employeesRes.json();
      const employeeList = Array.isArray(employeesData) ? employeesData : employeesData.items || [];
      setEmployees(employeeList);

      // جلب بيانات الخدمة الحالية
      const serviceRes = await fetch(`${BASE_URL}/EmployeeServiceRecord/${id}`, {
        headers: getAuthHeaders(),
      });

      if (serviceRes.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!serviceRes.ok) {
        throw new Error("فشل في جلب بيانات الخدمة");
      }

      const serviceData = await serviceRes.json();

      // البحث عن الموظف لجلب الاسم الكامل
      const employee = employeeList.find(emp => emp.id === serviceData.employeeId);
      const employeeName = employee ?
        (employee.fullName || [
          employee.firstName,
          employee.secondName,
          employee.thirdName,
          employee.fourthName,
          employee.lastName
        ].filter(Boolean).join(" ")) : "";

      // تعبئة النموذج بالبيانات الموجودة
      setFormData({
        employeeId: serviceData.employeeId || "",
        employeeName: employeeName,
        serviceType: serviceData.serviceType || "",
        administrativeOrderDate: serviceData.administrativeOrderDate || "",
        administrativeOrderNumber: serviceData.administrativeOrderNumber || "",
        dateStart: serviceData.dateStart || "",
        dateEnd: serviceData.dateEnd || "",
        day: serviceData.day || 0,
        month: serviceData.month || 0,
        year: serviceData.year || 0
      });

      setSearchQuery(employeeName);
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      alert("فشل في تحميل بيانات الخدمة");
      navigate("/service-management");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSearch = (query) => {
    setSearchQuery(query);
    setShowEmployeeList(query.length > 0);
  };

  const selectEmployee = (employee) => {
    const fullName = employee.fullName || [
      employee.firstName,
      employee.secondName,
      employee.thirdName,
      employee.fourthName,
      employee.lastName
    ].filter(Boolean).join(" ");

    setFormData({
      ...formData,
      employeeId: employee.id,
      employeeName: fullName
    });
    setSearchQuery(fullName);
    setShowEmployeeList(false);
  };

  const filteredEmployees = employees.filter(emp => {
    const fullName = emp.fullName || [
      emp.firstName,
      emp.secondName,
      emp.thirdName,
      emp.fourthName,
      emp.lastName
    ].filter(Boolean).join(" ");
    return fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const calculateDuration = (start, end) => {
    if (!start || !end) return { day: 0, month: 0, year: 0 };

    const startDate = new Date(start);
    const endDate = new Date(end);

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { day: days, month: months, year: years };
  };

  const handleDateChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };

    if (newFormData.dateStart && newFormData.dateEnd) {
      const duration = calculateDuration(newFormData.dateStart, newFormData.dateEnd);
      newFormData.day = duration.day;
      newFormData.month = duration.month;
      newFormData.year = duration.year;
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId) {
      alert("يرجى اختيار موظف");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/EmployeeServiceRecord/${id}`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceType: parseInt(formData.serviceType),
          administrativeOrderDate: formData.administrativeOrderDate,
          administrativeOrderNumber: formData.administrativeOrderNumber,
          dateStart: formData.dateStart,
          dateEnd: formData.dateEnd,
          day: formData.day,
          month: formData.month,
          year: formData.year,
          isActive: true
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("فشل في تحديث الخدمة");

      alert("تم تحديث الخدمة بنجاح");
      navigate("/service-management");
    } catch (error) {
      console.error("خطأ:", error);
      alert("فشل في تحديث الخدمة");
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
          <h1 className="text-4xl font-black mb-2">تعديل خدمة</h1>
          <p className="text-green-100 text-lg">تحديث بيانات الخدمة المسجلة</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* البحث عن الموظف */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-500 flex items-center gap-2">
              <User className="h-5 w-5" />
              الموظف
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleEmployeeSearch(e.target.value)}
                placeholder="ابحث عن الموظف بالاسم..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />

              {showEmployeeList && filteredEmployees.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {filteredEmployees.slice(0, 10).map((emp) => {
                    const fullName = emp.fullName || [
                      emp.firstName,
                      emp.secondName,
                      emp.thirdName,
                      emp.fourthName,
                      emp.lastName
                    ].filter(Boolean).join(" ");

                    return (
                      <div
                        key={emp.id}
                        onClick={() => selectEmployee(emp)}
                        className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{fullName}</p>
                        <p className="text-sm text-gray-500">{emp.jobTitle || "—"} - {emp.departmentName || "—"}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* معلومات الخدمة */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-500 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              معلومات الخدمة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نوع الخدمة</label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">[ اختر نوع الخدمة ]</option>
                  {serviceTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رقم الأمر الإداري</label>
                <input
                  type="text"
                  value={formData.administrativeOrderNumber}
                  onChange={(e) => setFormData({ ...formData, administrativeOrderNumber: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الأمر الإداري</label>
                <input
                  type="date"
                  value={formData.administrativeOrderDate}
                  onChange={(e) => setFormData({ ...formData, administrativeOrderDate: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* مدة الخدمة */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-500 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              مدة الخدمة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ البداية</label>
                <input
                  type="date"
                  value={formData.dateStart}
                  onChange={(e) => handleDateChange('dateStart', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ النهاية</label>
                <input
                  type="date"
                  value={formData.dateEnd}
                  onChange={(e) => handleDateChange('dateEnd', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            {/* عرض المدة المحسوبة */}
            {(formData.year > 0 || formData.month > 0 || formData.day > 0) && (
              <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                <p className="text-sm font-bold text-gray-700 mb-2">المدة المحسوبة:</p>
                <div className="flex items-center gap-4 text-lg font-bold text-green-700">
                  <span>{formData.year} سنة</span>
                  <span>•</span>
                  <span>{formData.month} شهر</span>
                  <span>•</span>
                  <span>{formData.day} يوم</span>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t-2 border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {submitting ? "جارٍ الحفظ..." : "حفظ التعديلات"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/service-management")}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold flex items-center justify-center gap-2"
            >
              <X className="h-5 w-5" />
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
