import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CoursesManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [courseFormData, setCourseFormData] = useState({
    courseName: '',
    dateStart: '',
    dateEnd: '',
    content: '',
    teacher: '',
    type: '',
    level: '',
    fileContent: '',
  });

  const [enrollFormData, setEnrollFormData] = useState({
    employeeId: '',
    notes: '',
    degree: '',
  });

  const courseTypes = ['تقنية', 'إدارية', 'لغات', 'تطوير ذاتي', 'أخرى'];
  const courseLevels = ['مبتدئ', 'متوسط', 'متقدم'];

  useEffect(() => {
    fetchCourses();
    fetchEmployees();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.courses.getAll();
      setCourses(Array.isArray(response) ? response : response.items || []);
    } catch (error) {
      console.error('خطأ في جلب الدورات:', error);
      alert('فشل تحميل الدورات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.employees.getAll({ PageSize: 1000 });
      setEmployees(Array.isArray(response) ? response : response.items || []);
    } catch (error) {
      console.error('خطأ في جلب الموظفين:', error);
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        courseName: courseFormData.courseName,
        dateStart: new Date(courseFormData.dateStart).toISOString(),
        dateEnd: new Date(courseFormData.dateEnd).toISOString(),
        content: courseFormData.content,
        teacher: courseFormData.teacher,
        type: courseFormData.type,
        level: courseFormData.level,
        fileContent: courseFormData.fileContent || '',
      };

      if (editingCourse) {
        await api.courses.update(editingCourse.id, data);
        alert('تم تحديث الدورة بنجاح');
      } else {
        await api.courses.create(data);
        alert('تم إضافة الدورة بنجاح');
      }

      setShowCourseModal(false);
      resetCourseForm();
      fetchCourses();
    } catch (error) {
      console.error('خطأ في حفظ الدورة:', error);
      alert('فشل حفظ الدورة: ' + error.message);
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        courseId: parseInt(selectedCourseId),
        employeeId: parseInt(enrollFormData.employeeId),
        notes: enrollFormData.notes || null,
        degree: enrollFormData.degree ? parseInt(enrollFormData.degree) : null,
      };

      await api.courses.enrollEmployee(data);
      alert('تم تسجيل الموظف في الدورة بنجاح');
      setShowEnrollModal(false);
      resetEnrollForm();
    } catch (error) {
      console.error('خطأ في تسجيل الموظف:', error);
      alert('فشل تسجيل الموظف: ' + error.message);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setCourseFormData({
      courseName: course.courseName || '',
      dateStart: course.dateStart?.split('T')[0] || '',
      dateEnd: course.dateEnd?.split('T')[0] || '',
      content: course.content || '',
      teacher: course.teacher || '',
      type: course.type || '',
      level: course.level || '',
      fileContent: course.fileContent || '',
    });
    setShowCourseModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الدورة؟')) return;

    try {
      await api.courses.delete(id);
      alert('تم حذف الدورة بنجاح');
      fetchCourses();
    } catch (error) {
      console.error('خطأ في حذف الدورة:', error);
      alert('فشل حذف الدورة: ' + error.message);
    }
  };

  const resetCourseForm = () => {
    setCourseFormData({
      courseName: '',
      dateStart: '',
      dateEnd: '',
      content: '',
      teacher: '',
      type: '',
      level: '',
      fileContent: '',
    });
    setEditingCourse(null);
  };

  const resetEnrollForm = () => {
    setEnrollFormData({
      employeeId: '',
      notes: '',
      degree: '',
    });
    setSelectedCourseId(null);
  };

  const openEnrollModal = (courseId) => {
    setSelectedCourseId(courseId);
    setShowEnrollModal(true);
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">إدارة الدورات التدريبية</h2>
          <button
            onClick={() => {
              resetCourseForm();
              setShowCourseModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            + إضافة دورة جديدة
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">لا توجد دورات</div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition p-5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-800 flex-1">{course.courseName}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {course.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium ml-2">المدرس:</span>
                      <span>{course.teacher}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium ml-2">النوع:</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        {course.type}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium ml-2">المستوى:</span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                        {course.level}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium ml-2">من:</span>
                      <span>{new Date(course.dateStart).toLocaleDateString('ar-IQ')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium ml-2">إلى:</span>
                      <span>{new Date(course.dateEnd).toLocaleDateString('ar-IQ')}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{course.content}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/course-details/${course.id}`)}
                      className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition font-medium"
                    >
                      📊 عرض التفاصيل
                    </button>
                    <button
                      onClick={() => openEnrollModal(course.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition"
                    >
                      تسجيل موظف
                    </button>
                    <button
                      onClick={() => handleEdit(course)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm transition"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="col-span-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {editingCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
              </h3>
              <form onSubmit={handleCourseSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">اسم الدورة *</label>
                    <input
                      type="text"
                      value={courseFormData.courseName}
                      onChange={(e) =>
                        setCourseFormData({ ...courseFormData, courseName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">المدرس *</label>
                    <input
                      type="text"
                      value={courseFormData.teacher}
                      onChange={(e) =>
                        setCourseFormData({ ...courseFormData, teacher: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">النوع *</label>
                    <select
                      value={courseFormData.type}
                      onChange={(e) =>
                        setCourseFormData({ ...courseFormData, type: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">اختر النوع</option>
                      {courseTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">المستوى *</label>
                    <select
                      value={courseFormData.level}
                      onChange={(e) =>
                        setCourseFormData({ ...courseFormData, level: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">اختر المستوى</option>
                      {courseLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">تاريخ البدء *</label>
                    <input
                      type="date"
                      value={courseFormData.dateStart}
                      onChange={(e) =>
                        setCourseFormData({ ...courseFormData, dateStart: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">تاريخ الانتهاء *</label>
                    <input
                      type="date"
                      value={courseFormData.dateEnd}
                      onChange={(e) =>
                        setCourseFormData({ ...courseFormData, dateEnd: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">محتوى الدورة *</label>
                    <textarea
                      value={courseFormData.content}
                      onChange={(e) =>
                        setCourseFormData({ ...courseFormData, content: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">رابط أو وصف الملفات</label>
                    <input
                      type="text"
                      value={courseFormData.fileContent}
                      onChange={(e) =>
                        setCourseFormData({ ...courseFormData, fileContent: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="رابط الملفات أو وصف المحتوى"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCourseModal(false);
                      resetCourseForm();
                    }}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    {editingCourse ? 'تحديث' : 'إضافة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">تسجيل موظف في الدورة</h3>
              <form onSubmit={handleEnrollSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">الموظف *</label>
                    <select
                      value={enrollFormData.employeeId}
                      onChange={(e) =>
                        setEnrollFormData({ ...enrollFormData, employeeId: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">اختر الموظف</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.secondName} {emp.thirdName} {emp.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">الدرجة</label>
                    <input
                      type="number"
                      value={enrollFormData.degree}
                      onChange={(e) =>
                        setEnrollFormData({ ...enrollFormData, degree: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                      placeholder="الدرجة (0-100)"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">ملاحظات</label>
                    <textarea
                      value={enrollFormData.notes}
                      onChange={(e) =>
                        setEnrollFormData({ ...enrollFormData, notes: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="أي ملاحظات إضافية"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEnrollModal(false);
                      resetEnrollForm();
                    }}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                  >
                    تسجيل
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManagement;
