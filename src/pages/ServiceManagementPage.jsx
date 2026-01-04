import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit, Calendar, User, Building2, FileText } from "lucide-react";

const BASE_URL = "/api";

export default function ServiceManagementPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchData();
  }, []);

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

      // جلب سجلات الخدمات
      const servicesRes = await fetch(`${BASE_URL}/EmployeeServiceRecord?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      const servicesData = await servicesRes.json();
      const servicesList = Array.isArray(servicesData) ? servicesData : servicesData.items || [];

      // ربط اسم الموظف مع كل سجل
      const servicesWithNames = servicesList.map(service => {
        const employee = employeeList.find(emp => emp.id === service.employeeId);
        const employeeName = employee ?
          (employee.fullName || [
            employee.firstName,
            employee.secondName,
            employee.thirdName,
            employee.fourthName,
            employee.lastName
          ].filter(Boolean).join(" ")) : "—";

        return {
          ...service,
          employeeName
        };
      });

      setServices(servicesWithNames);
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      if (error.message?.includes("401")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;

    try {
      const res = await fetch(`${BASE_URL}/EmployeeServiceRecord/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("فشل في حذف الخدمة");

      alert("تم حذف الخدمة بنجاح");
      fetchData(); // إعادة تحميل البيانات
    } catch (error) {
      console.error("خطأ:", error);
      alert("فشل في حذف الخدمة");
    }
  };

  const getServiceTypeName = (typeId) => {
    if (!typeId) return "—";
    // تحويل إلى رقم للتأكد من التطابق
    const numericId = parseInt(typeId);
    const type = serviceTypes.find(t => t.id === numericId || t.id === typeId);
    return type ? type.name : "—";
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
          <h1 className="text-4xl font-black mb-2">إدارة احتساب الخدمة</h1>
          <p className="text-green-100 text-lg">إضافة وإدارة خدمات الموظفين السابقة</p>
        </div>
      </div>

      {/* Add Button */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 flex justify-end">
        <button
          onClick={() => navigate("/add-service")}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          إضافة خدمة
        </button>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
          <FileText className="h-20 w-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">لا توجد خدمات مضافة</h3>
          <p className="text-gray-500 mb-4">ابدأ بإضافة خدمات الموظفين السابقة</p>
          {/* <button
            onClick={() => navigate("/add-service")}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold"
          >
            إضافة خدمة جديدة
          </button> */}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* معلومات الموظف */}
                  <div className="flex items-center gap-3 mb-4">
                    <User className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{service.employeeName || "—"}</h3>
                      <p className="text-sm text-gray-500">رقم الموظف: {service.employeeId}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* نوع الخدمة */}
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">نوع الخدمة</p>
                        <p className="font-medium text-gray-800">
                          {getServiceTypeName(service.serviceType) || `نوع ${service.serviceType}`}
                        </p>
                      </div>
                    </div>

                    {/* رقم الأمر الإداري */}
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">رقم الأمر الإداري</p>
                        <p className="font-medium text-gray-800">{service.administrativeOrderNumber || "—"}</p>
                      </div>
                    </div>

                    {/* تاريخ الأمر الإداري */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">تاريخ الأمر الإداري</p>
                        <p className="font-medium text-gray-800">
                          {service.administrativeOrderDate ? new Date(service.administrativeOrderDate).toLocaleDateString("ar-IQ") : "—"}
                        </p>
                      </div>
                    </div>

                    {/* مدة الخدمة */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">مدة الخدمة</p>
                        <p className="font-medium text-gray-800">
                          {service.dateStart ? new Date(service.dateStart).toLocaleDateString("ar-IQ") : "—"}
                          {" → "}
                          {service.dateEnd ? new Date(service.dateEnd).toLocaleDateString("ar-IQ") : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* المدة المحسوبة */}
                  {(service.year > 0 || service.month > 0 || service.day > 0) && (
                    <div className="mt-4 p-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-300 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">المدة المحسوبة:</p>
                      <div className="flex items-center gap-3 text-sm font-bold text-green-700">
                        <span>{service.year || 0} سنة</span>
                        <span>•</span>
                        <span>{service.month || 0} شهر</span>
                        <span>•</span>
                        <span>{service.day || 0} يوم</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/edit-service/${service.id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="تعديل"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="حذف"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
