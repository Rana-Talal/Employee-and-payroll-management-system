import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Calendar, Award, CheckCircle, XCircle } from "lucide-react";

const BASE_URL = "/api";

export default function AppreciationLettersPage() {
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // جلب كتب الشكر
      const lettersRes = await fetch(`${BASE_URL}/AppreciationLetter?PageSize=1000`, {
        headers: getAuthHeaders(),
      });

      if (lettersRes.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const lettersData = await lettersRes.json();
      setLetters(lettersData.items || []);
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
      showToast("فشل في تحميل البيانات", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف كتاب الشكر؟")) return;

    try {
      const res = await fetch(`${BASE_URL}/AppreciationLetter/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("فشل في الحذف");

      showToast("تم حذف كتاب الشكر بنجاح", "success");
      fetchData();
    } catch (error) {
      console.error("خطأ:", error);
      showToast("فشل في الحذف", "error");
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-yellow-50 p-6" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl border-2 flex items-center gap-3 ${toast.type === "success"
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
      <div className="mb-8">
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl shadow-xl p-8 text-white">
          <h1 className="text-4xl font-black mb-2">إدارة كتب الشكر والتقدير</h1>
          <p className="text-amber-100 text-lg">إضافة وإدارة كتب الشكر والترفيعات للموظفين</p>
        </div>
      </div>

      {/* Add Button */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 flex justify-end">
        <button
          onClick={() => navigate("/add-appreciation-letter")}
          className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl hover:from-amber-700 hover:to-yellow-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          إضافة كتاب شكر
        </button>
      </div>

      {/* Letters List */}
      {letters.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
          <Award className="h-20 w-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">لا توجد كتب شكر</h3>
          <p className="text-gray-500 mb-4">ابدأ بإضافة كتب الشكر والتقدير للموظفين</p>
          <button
            onClick={() => navigate("/add-appreciation-letter")}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl hover:from-amber-700 hover:to-yellow-700 transition-all font-bold"
          >
            إضافة كتاب شكر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {letters.map((letter) => (
            <div key={letter.id} className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-300">
                      <Award className="h-6 w-6 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{letter.employeeFullName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300">
                          {letter.letterTypeName || "نوع الكتاب"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                          {letter.periodName || "المدة"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(letter.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Details */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">السبب</p>
                      <p className="text-sm text-gray-800">{letter.reason || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">رقم الأمر الإداري</p>
                      <p className="text-sm text-gray-800">{letter.adminOrderNumber || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>تاريخ الأمر: {formatDate(letter.adminOrderDate)}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    أضيف في: {formatDate(letter.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
