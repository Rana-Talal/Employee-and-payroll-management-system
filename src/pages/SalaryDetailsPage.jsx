import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Edit2, Save, X, CheckCircle, XCircle, Calendar, User, DollarSign } from "lucide-react";
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

export default function SalaryDetailsPage() {
  const { salaryId } = useParams();
  const navigate = useNavigate();

  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    month: 1,
    year: 2025,
    notes: "",
    isActive: true
  });
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
    const fetchSalaryDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/FinalSalary/${salaryId}`, {
          headers: getAuthHeaders(),
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("فشل في جلب تفاصيل الراتب");

        const data = await res.json();
        setSalary(data);
        setEditData({
          month: data.month,
          year: data.year,
          notes: data.notes || "",
          isActive: data.isActive
        });
      } catch (error) {
        console.error("خطأ في جلب تفاصيل الراتب:", error);
        showToast("فشل في تحميل تفاصيل الراتب", "error");
      } finally {
        setLoading(false);
      }
    };

    if (salaryId) {
      fetchSalaryDetails();
    }
  }, [salaryId, navigate]);

  const handleUpdateSalary = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/FinalSalary/update/${salaryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          employeeID: null,
          month: editData.month,
          year: editData.year,
          notes: editData.notes || null,
          isActive: editData.isActive,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "فشل في تحديث السجل");
      }

      showToast("تم تحديث السجل بنجاح ✓", "success");
      setIsEditing(false);

      // Refresh data
      const refreshRes = await fetch(`${BASE_URL}/FinalSalary/${salaryId}`, {
        headers: getAuthHeaders(),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setSalary(data);
      }
    } catch (error) {
      console.error("خطأ في تحديث السجل:", error);
      showToast(error.message || "فشل في تحديث السجل", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center text-blue-600 font-medium">
          <svg className="animate-spin h-8 w-8 text-blue-600 inline-block mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2">جارٍ تحميل تفاصيل الراتب...</p>
        </div>
      </div>
    );
  }

  if (!salary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">لم يتم العثور على بيانات الراتب</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
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

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              <ArrowRight className="h-5 w-5" />
              رجوع
            </button>
            <h1 className="text-3xl font-extrabold text-gray-900">
              تفاصيل راتب {salary.month}/{salary.year}
            </h1>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <Edit2 className="h-5 w-5" />
              تعديل
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpdateSalary}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                <Save className="h-5 w-5" />
                حفظ التعديلات
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    month: salary.month,
                    year: salary.year,
                    notes: salary.notes || "",
                    isActive: salary.isActive
                  });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
              >
                <X className="h-5 w-5" />
                إلغاء
              </button>
            </div>
          )}
        </div>

        {/* Employee Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <User className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">اسم الموظف</p>
              <p className="text-xl font-bold text-gray-900">{salary.employeeFullName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Edit Section */}
        {isEditing && (
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-300 shadow-lg">
            <h3 className="font-bold text-gray-800 text-xl mb-6 flex items-center gap-2">
              <Edit2 className="h-6 w-6 text-blue-600" />
              تعديل بيانات الراتب
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الشهر</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={editData.month}
                  onChange={(e) => setEditData({ ...editData, month: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">السنة</label>
                <input
                  type="number"
                  min="2000"
                  value={editData.year}
                  onChange={(e) => setEditData({ ...editData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">الملاحظات</label>
              <textarea
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="أضف ملاحظات (اختياري)"
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={editData.isActive}
                onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-base font-semibold text-gray-700">
                سجل نشط
              </label>
            </div>
          </div>
        )}

        {/* Salary Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">الراتب الأساسي</p>
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-3xl font-extrabold text-blue-700">{formatCurrency(salary.baseSalary)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">إجمالي المخصصات</p>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-extrabold text-green-700">+{formatCurrency(salary.totalEntitlements)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">الراتب مع المخصصات</p>
              <DollarSign className="h-6 w-6 text-purple-500" />
            </div>
            <p className="text-3xl font-extrabold text-purple-700">{formatCurrency(salary.salaryWithEntitlements)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">إجمالي الاستقطاعات</p>
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-3xl font-extrabold text-red-700">-{formatCurrency(salary.totalDeductions)}</p>
          </div>
        </div>

        {/* Final Amount - Highlighted */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-10 w-10 text-white" />
              <span className="text-2xl font-bold text-white">صافي الراتب النهائي</span>
            </div>
            <span className="text-5xl font-extrabold text-white">{formatCurrency(salary.finalAmount)}</span>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entitlements Table */}
          {salary.entitlements && salary.entitlements.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  تفاصيل المخصصات
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-right p-4 text-sm font-semibold text-gray-700">نوع المخصص</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-700">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salary.entitlements.map((ent, index) => (
                      <tr key={ent.entitlementID} className={`border-t border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="p-4 text-gray-800 font-medium">{ent.entitlementTypeName}</td>
                        <td className="p-4 text-green-700 font-bold text-lg">{formatCurrency(ent.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-green-50 border-t-2 border-green-200">
                    <tr>
                      <td className="p-4 font-bold text-gray-800">الإجمالي</td>
                      <td className="p-4 font-extrabold text-green-700 text-xl">{formatCurrency(salary.totalEntitlements)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Deductions Table */}
          {salary.deductions && salary.deductions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <XCircle className="h-6 w-6 text-red-600" />
                  تفاصيل الاستقطاعات
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-right p-4 text-sm font-semibold text-gray-700">نوع الاستقطاع</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-700">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salary.deductions.map((ded, index) => (
                      <tr key={ded.deductionID} className={`border-t border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="p-4 text-gray-800 font-medium">{ded.deductionTypeName}</td>
                        <td className="p-4 text-red-700 font-bold text-lg">{formatCurrency(ded.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-red-50 border-t-2 border-red-200">
                    <tr>
                      <td className="p-4 font-bold text-gray-800">الإجمالي</td>
                      <td className="p-4 font-extrabold text-red-700 text-xl">{formatCurrency(salary.totalDeductions)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {salary.createdAt && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">تاريخ الإنشاء</p>
              </div>
              <p className="text-lg font-bold text-gray-800">{formatDate(salary.createdAt)}</p>
            </div>
          )}
          {salary.updatedAt && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">تاريخ آخر تحديث</p>
              </div>
              <p className="text-lg font-bold text-gray-800">{formatDate(salary.updatedAt)}</p>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-gray-600 font-medium">حالة السجل</p>
            </div>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
              salary.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-200 text-gray-800"
            }`}>
              {salary.isActive ? "✓ نشط" : "غير نشط"}
            </span>
          </div>
        </div>

        {/* Notes */}
        {salary.notes && !isEditing && (
          <div className="bg-amber-50 rounded-xl p-6 border-r-4 border-amber-400 shadow-md">
            <h4 className="text-sm text-gray-600 font-semibold mb-3">ملاحظات:</h4>
            <p className="text-base text-gray-800 leading-relaxed">{salary.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
