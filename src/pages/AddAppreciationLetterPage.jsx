import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X, User, FileText, Award } from "lucide-react";

const BASE_URL = "/api";

export default function AddAppreciationLetterPage() {
  const navigate = useNavigate();
  const [letterTypes, setLetterTypes] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    employeeID: "",
    employeeName: "",
    letterType: "",
    period: "",
    reason: "",
    adminOrderDate: "",
    adminOrderNumber: "",
    periodOrderDate: "",
    periodOrderNumber: ""
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // جلب أنواع كتب الشكر
      const typesRes = await fetch(`${BASE_URL}/Enums/appreciationlettertypes?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      const typesData = await typesRes.json();
      setLetterTypes(typesData || []);

      // جلب الفترات
      const periodsRes = await fetch(`${BASE_URL}/Enums/appreciationletterperiods?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      const periodsData = await periodsRes.json();
      setPeriods(periodsData || []);

      // جلب الموظفين
      const employeesRes = await fetch(`${BASE_URL}/Employee?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      const employeesData = await employeesRes.json();
      const employeeList = Array.isArray(employeesData) ? employeesData : employeesData.items || [];
      setEmployees(employeeList);
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
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
      employeeID: employee.id,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeID) {
      alert("يرجى اختيار موظف");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/AppreciationLetter`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeID: parseInt(formData.employeeID),
          letterType: parseInt(formData.letterType),
          period: parseInt(formData.period),
          reason: formData.reason,
          adminOrderDate: formData.adminOrderDate,
          adminOrderNumber: formData.adminOrderNumber,
          periodOrderDate: formData.periodOrderDate || null,
          periodOrderNumber: formData.periodOrderNumber || null,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("فشل في إضافة كتاب الشكر");

      alert("تم إضافة كتاب الشكر بنجاح");
      navigate("/appreciation-letters");
    } catch (error) {
      console.error("خطأ:", error);
      alert("فشل في إضافة كتاب الشكر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl shadow-xl p-8 text-white">
          <h1 className="text-4xl font-black mb-2">إضافة كتاب شكر وتقدير</h1>
          <p className="text-amber-100 text-lg">تكريم وتقدير جهود الموظفين المميزين</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* البحث عن الموظف */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-amber-500 flex items-center gap-2">
              <User className="h-5 w-5" />
              اختيار الموظف
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleEmployeeSearch(e.target.value)}
                placeholder="ابحث عن الموظف بالاسم..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                        className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-gray-100 last:border-b-0"
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

          {/* معلومات كتاب الشكر */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-amber-500 flex items-center gap-2">
              <Award className="h-5 w-5" />
              معلومات كتاب الشكر
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نوع كتاب الشكر</label>
                <select
                  value={formData.letterType}
                  onChange={(e) => setFormData({ ...formData, letterType: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                >
                  <option value="">[ اختر نوع كتاب الشكر ]</option>
                  {letterTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الفترة</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                >
                  <option value="">[ اختر الفترة ]</option>
                  {periods.map((period) => (
                    <option key={period.id} value={period.id}>{period.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">السبب / التفاصيل</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 min-h-[100px]"
                placeholder="اكتب سبب التكريم أو التفاصيل..."
                required
              />
            </div>
          </div>

          {/* معلومات الأمر الإداري */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-amber-500 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              معلومات الأمر الإداري
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رقم الأمر الإداري</label>
                <input
                  type="text"
                  value={formData.adminOrderNumber}
                  onChange={(e) => setFormData({ ...formData, adminOrderNumber: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الأمر الإداري</label>
                <input
                  type="date"
                  value={formData.adminOrderDate}
                  onChange={(e) => setFormData({ ...formData, adminOrderDate: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* معلومات أمر الفترة (اختياري) */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-bold text-gray-700 mb-3">معلومات أمر الفترة (اختياري)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">رقم أمر الفترة</label>
                  <input
                    type="text"
                    value={formData.periodOrderNumber}
                    onChange={(e) => setFormData({ ...formData, periodOrderNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">تاريخ أمر الفترة</label>
                  <input
                    type="date"
                    value={formData.periodOrderDate}
                    onChange={(e) => setFormData({ ...formData, periodOrderDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t-2 border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {loading ? "جارٍ الحفظ..." : "حفظ كتاب الشكر"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/appreciation-letters")}
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
