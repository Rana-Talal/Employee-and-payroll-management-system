import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "/api";

export default function PositionManagement() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // حالات النموذج
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" أو "edit"
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [formData, setFormData] = useState({
    positionName: "",
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // جلب المناصب
  const fetchPositions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/Position?PageSize=1000`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const positionList = Array.isArray(data) ? data : data.items || [];
      setPositions(positionList);
      setFilteredPositions(positionList);
    } catch (error) {
      console.error("خطأ في جلب المناصب:", error);
      if (error.message?.includes("401")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  // البحث
  useEffect(() => {
    const filtered = positions.filter((position) =>
      position.positionName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPositions(filtered);
  }, [searchTerm, positions]);

  // فتح نموذج الإضافة
  const openAddForm = () => {
    setFormMode("add");
    setFormData({ positionName: "", isActive: true });
    setSelectedPosition(null);
    setIsFormOpen(true);
  };

  // فتح نموذج التعديل
  const openEditForm = (position) => {
    setFormMode("edit");
    setFormData({
      positionName: position.positionName,
      isActive: position.isActive,
    });
    setSelectedPosition(position);
    setIsFormOpen(true);
  };

  // إغلاق النموذج
  const closeForm = () => {
    setIsFormOpen(false);
    setTimeout(() => {
      setFormData({ positionName: "", isActive: true });
      setSelectedPosition(null);
    }, 300);
  };

  // إضافة منصب جديد
  const handleAdd = async () => {
    if (!formData.positionName.trim()) {
      alert("الرجاء إدخال اسم المنصب");
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch(`${BASE_URL}/Position`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ positionName: formData.positionName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchPositions();
      closeForm();
      alert("تم إضافة المنصب بنجاح");
    } catch (error) {
      console.error("خطأ في إضافة المنصب:", error);
      alert("حدث خطأ أثناء إضافة المنصب");
    } finally {
      setFormLoading(false);
    }
  };

  // تعديل منصب
  const handleEdit = async () => {
    if (!formData.positionName.trim()) {
      alert("الرجاء إدخال اسم المنصب");
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch(`${BASE_URL}/Position/${selectedPosition.positionID}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          positionName: formData.positionName,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchPositions();
      closeForm();
      alert("تم تعديل المنصب بنجاح");
    } catch (error) {
      console.error("خطأ في تعديل المنصب:", error);
      alert("حدث خطأ أثناء تعديل المنصب");
    } finally {
      setFormLoading(false);
    }
  };

  // حذف منصب
  const handleDelete = async (position) => {
    if (!window.confirm(`هل أنت متأكد من حذف المنصب "${position.positionName}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/Position/${position.positionID}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchPositions();
      alert("تم حذف المنصب بنجاح");
    } catch (error) {
      console.error("خطأ في حذف المنصب:", error);
      alert("حدث خطأ أثناء حذف المنصب");
    }
  };

  // نموذج الإضافة/التعديل
  const FormModal = () => {
    if (!isFormOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        dir="rtl"
        onClick={(e) => {
          // إغلاق فقط عند الضغط على الخلفية وليس المحتوى
          if (e.target === e.currentTarget) {
            closeForm();
          }
        }}
      >
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-l from-green-600 to-green-500 text-white p-5 rounded-t-lg">
            <h2 className="text-xl font-bold">
              {formMode === "add" ? "➕ إضافة منصب جديد" : "✏️ تعديل المنصب"}
            </h2>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المنصب <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.positionName}
                onChange={(e) => setFormData({ ...formData, positionName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="أدخل اسم المنصب"
                disabled={formLoading}
                autoFocus
              />
            </div>

            {formMode === "edit" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  disabled={formLoading}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  نشط
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex gap-3 justify-end">
            <button
              onClick={closeForm}
              disabled={formLoading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              onClick={formMode === "add" ? handleAdd : handleEdit}
              disabled={formLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {formLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>{formMode === "add" ? "إضافة" : "حفظ التعديلات"}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span>🎯</span>
              إدارة المناصب
            </h1>
            <p className="text-gray-600 mt-1">إدارة وتنظيم مناصب الموظفين</p>
          </div>
          <button
            onClick={() => navigate("/hr-dashboard")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
          >
            <span>←</span>
            <span>العودة للوحة التحكم</span>
          </button>
        </div>

        {/* البحث والإضافة */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <input
              type="text"
              placeholder="البحث عن منصب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={openAddForm}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-xl">➕</span>
              <span>إضافة منصب جديد</span>
            </button>
          </div>
        </div>

        {/* قائمة المناصب */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              المناصب ({filteredPositions.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : filteredPositions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مناصب"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xl">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-right p-4 font-semibold text-gray-700">الرقم</th>
                    <th className="text-right p-4 font-semibold text-gray-700">اسم المنصب</th>
                    <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                    <th className="text-right p-4 font-semibold text-gray-700">تاريخ الإنشاء</th>
                    <th className="text-right p-4 font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPositions.map((position) => (
                    <tr key={position.positionID} className="hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-600">{position.positionID}</td>
                      <td className="p-4 font-medium text-gray-900">{position.positionName}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            position.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {position.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(position.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(position)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-xs font-medium"
                          >
                            ✏️ تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(position)}
                            className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-xs font-medium"
                          >
                            🗑️ حذف
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

      {/* نموذج الإضافة/التعديل */}
      <FormModal />
    </div>
  );
}
