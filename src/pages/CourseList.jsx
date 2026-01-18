import { useState, useEffect } from "react";
import api from "../services/api";

const cleanPayload = (data) => {
  const payload = {};
  for (const key in data) {
    let value = data[key];
    
    if (key !== "fileContent" && key !== "courseId" && typeof value === "string" && value.trim() === "") {
      value = null; 
    }
    
    if ((key === "dateStart" || key === "dateEnd") && value !== null && value !== "") {
      value = `${value.split('T')[0]}T00:00:00`;
    }

    payload[key] = value;
  }
  return payload;
};

const initialFormState = {
  courseId: null, 
  courseName: "",
  dateStart: "",
  dateEnd: "",
  content: "",
  teacher: "",
  fileContent: "", 
  type: "",
  level: "",
  isActive: true,
};

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // جلب جميع الدورات (READ: GET)
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.courses.getAll({ PageSize: 1000 });

      const courseList = Array.isArray(data) ? data : data.items || [];
      const sortedCourses = courseList.sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setCourses(sortedCourses);
    } catch (err) {
      setError(err.message || "خطأ في الاتصال بالخادم.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  // تهيئة نموذج التعديل
  const handleEdit = (course) => {
    const dateStart = course.dateStart ? course.dateStart.split("T")[0] : "";
    const dateEnd = course.dateEnd ? course.dateEnd.split("T")[0] : "";
    
    setFormData({
        ...course,
        content: course.content || "",
        teacher: course.teacher || "",
        fileContent: course.fileContent || "", 
        type: course.type || "",
        level: course.level || "",
        dateStart,
        dateEnd
    });
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setError(null);
  };

  // إضافة وتحديث الدورات (CREATE: POST / UPDATE: PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.courseName || !formData.dateStart || !formData.dateEnd || !formData.fileContent) {
      setError("الاسم، وتاريخ البدء والانتهاء، ومحتوى الملف (*) مطلوبة.");
      return;
    }
    if (new Date(formData.dateEnd) < new Date(formData.dateStart)) {
      setError("تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = cleanPayload(formData);

    try {
      if (isEditing) {
        await api.courses.update(formData.courseId, payload);
      } else {
        await api.courses.create(payload);
      }

      alert(`تم ${isEditing ? 'تحديث' : 'إضافة'} الدورة بنجاح!`);
      setFormData(initialFormState);
      setIsEditing(false);
      fetchCourses();

    } catch (err) {
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  // إلغاء الدورات (DELETE)
  const handleDelete = async (courseId) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذه الدورة؟")) return;

    setLoading(true);
    setError(null);

    try {
      await api.courses.delete(courseId);
      alert("تم حذف الدورة بنجاح!");
      fetchCourses();

    } catch (err) {
      setError(err.message || "حدث خطأ أثناء الحذف.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoDate) => isoDate?.split("T")[0] || "—";

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">إدارة الدورات </h1>
      
      <div className="mb-8 border p-4 rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">
          {isEditing ? `تحديث الدورة: ${formData.courseName}` : "إضافة دورة جديدة"}
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="courseName" className="block mb-1 font-medium">اسم الدورة</label>
              <input
                id="courseName"
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="اسم الدورة *"
                className="px-3 py-2 border rounded w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="dateStart" className="block mb-1 font-medium">تاريخ البدء</label>
              <input
                id="dateStart"
                type="date"
                name="dateStart"
                value={formData.dateStart}
                onChange={handleChange}
                className="px-3 py-2 border rounded w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="dateEnd" className="block mb-1 font-medium">تاريخ الانتهاء</label>
              <input
                id="dateEnd"
                type="date"
                name="dateEnd"
                value={formData.dateEnd}
                onChange={handleChange}
                className="px-3 py-2 border rounded w-full"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="fileContent" className="block mb-1 font-medium">محتوى الملف</label>
            <input
              id="fileContent"
              type="text"
              name="fileContent"
              value={formData.fileContent || ""}
              onChange={handleChange}
              placeholder="محتوى الملف (رابط أو نص) *" 
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block mb-1 font-medium">المحتوى</label>
            <textarea
              id="content"
              name="content"
              value={formData.content || ""} 
              onChange={handleChange}
              placeholder="المحتوى (اختياري)"
              rows="2"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="teacher" className="block mb-1 font-medium">المدرس</label>
              <input
                id="teacher"
                type="text"
                name="teacher"
                value={formData.teacher || ""}
                onChange={handleChange}
                placeholder="المدرس (اختياري)"
                className="px-3 py-2 border rounded w-full"
              />
            </div>

            <div>
              <label htmlFor="type" className="block mb-1 font-medium">النوع</label>
              <input
                id="type"
                type="text"
                name="type"
                value={formData.type || ""}
                onChange={handleChange}
                placeholder="النوع (اختياري)"
                className="px-3 py-2 border rounded w-full"
              />
            </div>

            <div>
              <label htmlFor="level" className="block mb-1 font-medium">المستوى</label>
              <input
                id="level"
                type="text"
                name="level"
                value={formData.level || ""}
                onChange={handleChange}
                placeholder="المستوى (اختياري)"
                className="px-3 py-2 border rounded w-full"
              />
            </div>

            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="font-medium">مفعلة</label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                إلغاء التعديل
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded transition ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "جاري الحفظ..." : isEditing ? "حفظ التحديث" : "إضافة الدورة"}
            </button>
          </div>
        </form>
      </div>

      <h2 className="text-2xl font-bold mb-4">قائمة الدورات ({courses.length} )</h2>
      
      {loading && !courses.length ? (
        <p className="text-center text-gray-500">جاري تحميل الدورات...</p>
      ) : courses.length === 0 ? (
        <p className="text-center text-red-500">لا توجد دورات  </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المدرس</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البدء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الانتهاء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.courseId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.courseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.teacher || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(course.dateStart)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(course.dateEnd)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {course.isActive ? "مفعلة" : "معطلة"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(course)}
                      className="text-indigo-600 hover:text-indigo-900 mx-1"
                      disabled={loading}
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(course.courseId)}
                      className="text-red-600 hover:text-red-900 mx-1"
                      disabled={loading}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CourseManager;