import { useState, useEffect } from 'react';
import api from '../services/api';

const EmployeeCoursesTab = ({ employeeId }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    degree: '',
    notes: '',
  });

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeCourses();
    }
  }, [employeeId]);

  const fetchEmployeeCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب جميع تسجيلات الموظف في الدورات
      const data = await api.courseEmployee.getByEmployee(employeeId);
      const courseList = Array.isArray(data) ? data : data.items || [];

      setCourses(courseList);
    } catch (err) {
      console.error('خطأ في جلب دورات الموظف:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (courseEnrollment) => {
    setEditingId(courseEnrollment.courseEmployeeId);
    setEditForm({
      degree: courseEnrollment.degree || '',
      notes: courseEnrollment.notes || '',
    });
  };

  const handleUpdate = async (courseEmployeeId) => {
    try {
      await api.courseEmployee.update(courseEmployeeId, {
        degree: editForm.degree ? parseInt(editForm.degree) : null,
        notes: editForm.notes || null,
      });

      alert('تم تحديث معلومات الدورة بنجاح');
      setEditingId(null);
      fetchEmployeeCourses();
    } catch (err) {
      console.error('خطأ في التحديث:', err);
      alert('فشل تحديث معلومات الدورة: ' + err.message);
    }
  };

  const handleDelete = async (courseEmployeeId, courseName) => {
    if (!window.confirm(`هل أنت متأكد من حذف الدورة: ${courseName}؟`)) return;

    try {
      await api.courseEmployee.delete(courseEmployeeId);
      alert('تم حذف الدورة بنجاح');
      fetchEmployeeCourses();
    } catch (err) {
      console.error('خطأ في الحذف:', err);
      alert('فشل حذف الدورة: ' + err.message);
    }
  };

  const getCourseStatus = (dateStart, dateEnd) => {
    const now = new Date();
    const start = new Date(dateStart);
    const end = new Date(dateEnd);

    if (now < start) {
      return { label: 'لم تبدأ بعد', color: 'bg-gray-100 text-gray-700' };
    } else if (now >= start && now <= end) {
      return { label: 'جارية', color: 'bg-blue-100 text-blue-700' };
    } else {
      return { label: 'منتهية', color: 'bg-green-100 text-green-700' };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">جاري تحميل الدورات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        خطأ: {error}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد دورات</h3>
        <p className="text-gray-600">لم يتم تسجيل الموظف في أي دورة تدريبية بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">إجمالي الدورات</div>
          <div className="text-2xl font-bold text-blue-700">{courses.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">الدورات المكتملة</div>
          <div className="text-2xl font-bold text-green-700">
            {courses.filter(c => new Date(c.dateEnd) < new Date()).length}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-medium">معدل الدرجات</div>
          <div className="text-2xl font-bold text-purple-700">
            {courses.filter(c => c.degree).length > 0
              ? Math.round(
                  courses.reduce((sum, c) => sum + (parseInt(c.degree) || 0), 0) /
                    courses.filter(c => c.degree).length
                )
              : '-'}
          </div>
        </div>
      </div>

      {/* قائمة الدورات */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">اسم الدورة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المدرس</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">النوع</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المستوى</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الدرجة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">ملاحظات</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => {
                const isEditing = editingId === course.courseEmployeeId;
                const status = getCourseStatus(course.dateStart, course.dateEnd);

                return (
                  <tr key={course.courseEmployeeId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{course.courseName}</td>
                    <td className="px-4 py-3 text-gray-600">{course.teacher || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        {course.type || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                        {course.level || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{new Date(course.dateStart).toLocaleDateString('ar-IQ')}</div>
                      <div className="text-xs text-gray-500">
                        إلى {new Date(course.dateEnd).toLocaleDateString('ar-IQ')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.degree}
                          onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          max="100"
                          placeholder="0-100"
                        />
                      ) : (
                        <span className="font-semibold text-gray-900">
                          {course.degree || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {isEditing ? (
                        <textarea
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          rows="2"
                          placeholder="ملاحظات..."
                        />
                      ) : (
                        <span className="text-sm text-gray-600 block truncate">
                          {course.notes || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdate(course.courseEmployeeId)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(course)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(course.courseEmployeeId, course.courseName)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
                          >
                            حذف
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">ملاحظة</h4>
            <p className="text-sm text-blue-700">
              يمكنك تعديل الدرجات والملاحظات للدورات المسجل بها الموظف.
              الدورات المنتهية يمكن أن تؤثر على تقييم الموظف وترقياته.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCoursesTab;
