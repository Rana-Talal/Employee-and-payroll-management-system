import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "/api";

export default function GradeSalaryManagement() {
  const navigate = useNavigate();
  const [gradeSteps, setGradeSteps] = useState([]);
  const [filteredGradeSteps, setFilteredGradeSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالات التصفية
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableGrades, setAvailableGrades] = useState([]);

  // حالات النموذج
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" أو "edit"
  const [selectedGradeStep, setSelectedGradeStep] = useState(null);
  const [formData, setFormData] = useState({
    grade: "",
    step: "",
    baseSalary: "",
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

  // جلب البيانات
  const fetchGradeSteps = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/GradeAndStep?PageSize=1000`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const gradeStepList = Array.isArray(data) ? data : data.items || [];

      // ترتيب البيانات حسب الدرجة (تنازلياً) ثم المرحلة (تصاعدياً)
      const sortedList = gradeStepList.sort((a, b) => {
        if (a.grade !== b.grade) {
          return b.grade - a.grade; // الدرجات الأعلى أولاً
        }
        return a.step - b.step; // المراحل الأقل أولاً
      });

      setGradeSteps(sortedList);
      setFilteredGradeSteps(sortedList);

      // استخراج الدرجات المتاحة
      const grades = [...new Set(sortedList.map(item => item.grade))].sort((a, b) => b - a);
      setAvailableGrades(grades);
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

  useEffect(() => {
    fetchGradeSteps();
  }, []);

  // تصفية البيانات
  useEffect(() => {
    let filtered = gradeSteps;

    // تصفية حسب الدرجة
    if (selectedGrade !== "all") {
      filtered = filtered.filter(item => item.grade === parseInt(selectedGrade));
    }

    // تصفية حسب البحث (المرحلة أو الراتب)
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.step.toString().includes(searchTerm) ||
        item.baseSalary.toString().includes(searchTerm)
      );
    }

    setFilteredGradeSteps(filtered);
  }, [selectedGrade, searchTerm, gradeSteps]);

  // فتح نموذج الإضافة
  const openAddForm = () => {
    setFormMode("add");
    setFormData({ grade: "", step: "", baseSalary: "", isActive: true });
    setSelectedGradeStep(null);
    setIsFormOpen(true);
  };

  // فتح نموذج التعديل
  const openEditForm = (gradeStep) => {
    setFormMode("edit");
    setFormData({
      grade: gradeStep.grade,
      step: gradeStep.step,
      baseSalary: gradeStep.baseSalary,
      isActive: gradeStep.isActive,
    });
    setSelectedGradeStep(gradeStep);
    setIsFormOpen(true);
  };

  // إغلاق النموذج
  const closeForm = () => {
    setIsFormOpen(false);
    setTimeout(() => {
      setFormData({ grade: "", step: "", baseSalary: "", isActive: true });
      setSelectedGradeStep(null);
    }, 300);
  };

  // إضافة درجة جديدة
  const handleAdd = async () => {
    if (!formData.grade || !formData.step || !formData.baseSalary) {
      alert("الرجاء إدخال جميع الحقول المطلوبة");
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch(`${BASE_URL}/GradeAndStep`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          grade: parseInt(formData.grade),
          step: parseInt(formData.step),
          baseSalary: parseInt(formData.baseSalary),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchGradeSteps();
      closeForm();
      alert("تم إضافة الدرجة بنجاح");
    } catch (error) {
      console.error("خطأ في إضافة الدرجة:", error);
      alert("حدث خطأ أثناء إضافة الدرجة");
    } finally {
      setFormLoading(false);
    }
  };

  // تعديل درجة
  const handleEdit = async () => {
    if (!formData.grade || !formData.step || !formData.baseSalary) {
      alert("الرجاء إدخال جميع الحقول المطلوبة");
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch(`${BASE_URL}/GradeAndStep/${selectedGradeStep.gradeStepID}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          gradeStepID: selectedGradeStep.gradeStepID,
          grade: parseInt(formData.grade),
          step: parseInt(formData.step),
          baseSalary: parseInt(formData.baseSalary),
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchGradeSteps();
      closeForm();
      alert("تم تعديل الدرجة بنجاح");
    } catch (error) {
      console.error("خطأ في تعديل الدرجة:", error);
      alert("حدث خطأ أثناء تعديل الدرجة");
    } finally {
      setFormLoading(false);
    }
  };

  // حذف درجة
  const handleDelete = async (gradeStep) => {
    if (!window.confirm(`هل أنت متأكد من حذف الدرجة ${gradeStep.grade} - المرحلة ${gradeStep.step}؟`)) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/GradeAndStep/${gradeStep.gradeStepID}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchGradeSteps();
      alert("تم حذف الدرجة بنجاح");
    } catch (error) {
      console.error("خطأ في حذف الدرجة:", error);
      alert("حدث خطأ أثناء حذف الدرجة");
    }
  };

  // تنسيق الراتب
  const formatSalary = (salary) => {
    return new Intl.NumberFormat('ar-IQ').format(salary);
  };

  // نموذج الإضافة/التعديل
  const FormModal = () => {
    if (!isFormOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        dir="rtl"
        onClick={(e) => {
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
          <div className="bg-gradient-to-l from-blue-600 to-blue-500 text-white p-5 rounded-t-lg">
            <h2 className="text-xl font-bold">
              {formMode === "add" ? "➕ إضافة درجة جديدة" : "✏️ تعديل الدرجة"}
            </h2>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدرجة <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1-10"
                  min="1"
                  max="10"
                  disabled={formLoading}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المرحلة <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.step}
                  onChange={(e) => setFormData({ ...formData, step: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1-11"
                  min="1"
                  max="11"
                  disabled={formLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الراتب الأساسي (دينار) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل الراتب الأساسي"
                min="0"
                disabled={formLoading}
              />
            </div>

            {formMode === "edit" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
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
              <span>📊</span>
              إدارة سلم الرواتب
            </h1>
            <p className="text-gray-600 mt-1">إدارة الدرجات والمراحل والرواتب الأساسية</p>
          </div>
          <button
            onClick={() => navigate("/hr-dashboard")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
          >
            <span>←</span>
            <span>العودة للوحة التحكم</span>
          </button>
        </div>

        {/* التصفية والبحث */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الدرجات</option>
              {availableGrades.map(grade => (
                <option key={grade} value={grade}>الدرجة {grade}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="البحث عن مرحلة أو راتب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <button
              onClick={openAddForm}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span className="text-xl">➕</span>
              <span>إضافة درجة جديدة</span>
            </button>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
            <div className="text-sm opacity-90">إجمالي السجلات</div>
            <div className="text-2xl font-bold mt-1">{filteredGradeSteps.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
            <div className="text-sm opacity-90">عدد الدرجات</div>
            <div className="text-2xl font-bold mt-1">{availableGrades.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow">
            <div className="text-sm opacity-90">أعلى راتب</div>
            <div className="text-2xl font-bold mt-1">
              {gradeSteps.length > 0 ? formatSalary(Math.max(...gradeSteps.map(g => g.baseSalary))) : 0}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow">
            <div className="text-sm opacity-90">أدنى راتب</div>
            <div className="text-2xl font-bold mt-1">
              {gradeSteps.length > 0 ? formatSalary(Math.min(...gradeSteps.map(g => g.baseSalary))) : 0}
            </div>
          </div>
        </div>

        {/* الجدول */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              سلم الرواتب ({filteredGradeSteps.length} سجل)
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredGradeSteps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || selectedGrade !== "all" ? "لا توجد نتائج للبحث" : "لا توجد بيانات"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xl">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-right p-4 font-semibold text-gray-700">الرقم</th>
                    <th className="text-right p-4 font-semibold text-gray-700">الدرجة</th>
                    <th className="text-right p-4 font-semibold text-gray-700">المرحلة</th>
                    <th className="text-right p-4 font-semibold text-gray-700">الراتب الأساسي (دينار)</th>
                    <th className="text-right p-4 font-semibold text-gray-700">الحالة</th>
                    <th className="text-right p-4 font-semibold text-gray-700">تاريخ الإنشاء</th>
                    <th className="text-right p-4 font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredGradeSteps.map((gradeStep, index) => (
                    <tr key={gradeStep.gradeStepID} className="hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-600">{index + 1}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                          {gradeStep.grade}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                          {gradeStep.step}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-green-600">
                        {formatSalary(gradeStep.baseSalary)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            gradeStep.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {gradeStep.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(gradeStep.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(gradeStep)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-xs font-medium"
                          >
                            ✏️ تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(gradeStep)}
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
