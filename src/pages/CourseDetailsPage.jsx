import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrolledEmployees, setEnrolledEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [enrollNotes, setEnrollNotes] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ degree: '', notes: '' });

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchEnrolledEmployees();
      fetchAllEmployees();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const data = await api.courses.getById(courseId);
      setCourse(data);
    } catch (err) {
      console.error('خطأ في جلب تفاصيل الدورة:', err);
      setError(err.message);
    }
  };

  const fetchEnrolledEmployees = async () => {
    try {
      setLoading(true);
      const data = await api.courseEmployee.getByCourse(courseId);
      const enrollmentList = Array.isArray(data) ? data : data.items || [];
      setEnrolledEmployees(enrollmentList);
    } catch (err) {
      console.error('خطأ في جلب الموظفين المسجلين:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const data = await api.employees.getAll({ PageSize: 1000 });
      const empList = Array.isArray(data) ? data : data.items || [];
      setAllEmployees(empList);
    } catch (err) {
      console.error('خطأ في جلب الموظفين:', err);
    }
  };

  const handleEnrollEmployee = async () => {
    if (!selectedEmployeeId) {
      alert('يرجى اختيار موظف');
      return;
    }

    try {
      await api.courseEmployee.enroll({
        courseId: parseInt(courseId),
        employeeId: parseInt(selectedEmployeeId),
        notes: enrollNotes || null,
        degree: null,
        isActive: true,
      });

      alert('تم تسجيل الموظف في الدورة بنجاح');
      setShowEnrollModal(false);
      setSelectedEmployeeId('');
      setEnrollNotes('');
      fetchEnrolledEmployees();
    } catch (err) {
      console.error('خطأ في تسجيل الموظف:', err);
      alert('فشل تسجيل الموظف: ' + err.message);
    }
  };

  const handleEdit = (enrollment) => {
    setEditingId(enrollment.courseEmployeeId);
    setEditForm({
      degree: enrollment.degree || '',
      notes: enrollment.notes || '',
    });
  };

  const handleUpdate = async (courseEmployeeId) => {
    try {
      await api.courseEmployee.update(courseEmployeeId, {
        degree: editForm.degree ? parseInt(editForm.degree) : null,
        notes: editForm.notes || null,
      });

      alert('تم تحديث بيانات الموظف بنجاح');
      setEditingId(null);
      fetchEnrolledEmployees();
    } catch (err) {
      console.error('خطأ في التحديث:', err);
      alert('فشل التحديث: ' + err.message);
    }
  };

  const handleDelete = async (courseEmployeeId, employeeName) => {
    if (!window.confirm(`هل أنت متأكد من حذف الموظف: ${employeeName} من الدورة؟`)) return;

    try {
      await api.courseEmployee.delete(courseEmployeeId);
      alert('تم حذف الموظف من الدورة بنجاح');
      fetchEnrolledEmployees();
    } catch (err) {
      console.error('خطأ في الحذف:', err);
      alert('فشل الحذف: ' + err.message);
    }
  };

  const getAvailableEmployees = () => {
    const enrolledIds = enrolledEmployees.map((e) => e.employeeId);
    return allEmployees.filter((emp) => !enrolledIds.includes(emp.id));
  };

  if (loading && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          خطأ: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/courses')}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              ← رجوع
            </button>
            <h1 className="text-3xl font-bold text-gray-900">تفاصيل الدورة</h1>
          </div>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            + تسجيل موظف
          </button>
        </div>

        {/* معلومات الدورة */}
        {course && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{course.courseName}</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">المدرس:</span>
                    <span className="text-gray-900">{course.teacher || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">النوع:</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                      {course.type || '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">المستوى:</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
                      {course.level || '-'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">تاريخ البدء:</span>
                    <span className="text-gray-900">
                      {new Date(course.dateStart).toLocaleDateString('ar-IQ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">تاريخ الانتهاء:</span>
                    <span className="text-gray-900">
                      {new Date(course.dateEnd).toLocaleDateString('ar-IQ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">الحالة:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        course.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {course.isActive ? 'مفعلة' : 'غير مفعلة'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {course.content && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">المحتوى:</h3>
                <p className="text-gray-700">{course.content}</p>
              </div>
            )}
          </div>
        )}

        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">عدد الموظفين</div>
            <div className="text-2xl font-bold text-blue-600">{enrolledEmployees.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">مع درجات</div>
            <div className="text-2xl font-bold text-green-600">
              {enrolledEmployees.filter((e) => e.degree).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">معدل الدرجات</div>
            <div className="text-2xl font-bold text-purple-600">
              {enrolledEmployees.filter((e) => e.degree).length > 0
                ? Math.round(
                    enrolledEmployees.reduce((sum, e) => sum + (parseInt(e.degree) || 0), 0) /
                      enrolledEmployees.filter((e) => e.degree).length
                  )
                : '-'}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">نشطين</div>
            <div className="text-2xl font-bold text-orange-600">
              {enrolledEmployees.filter((e) => e.isActive).length}
            </div>
          </div>
        </div>

        {/* قائمة الموظفين المسجلين */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              الموظفون المسجلون ({enrolledEmployees.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : enrolledEmployees.length === 0 ? (
            <div className="text-center py-12 text-gray-500">لا يوجد موظفون مسجلون في هذه الدورة</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">اسم الموظف</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المنصب</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">القسم</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الدرجة</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">ملاحظات</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrolledEmployees.map((enrollment, index) => {
                    const isEditing = editingId === enrollment.courseEmployeeId;

                    return (
                      <tr key={enrollment.courseEmployeeId} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {enrollment.employeeFullName || `موظف #${enrollment.employeeId}`}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{enrollment.jobTitle || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{enrollment.departmentName || '-'}</td>
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
                            <span className="font-semibold text-gray-900">{enrollment.degree || '-'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          {isEditing ? (
                            <textarea
                              value={editForm.notes}
                              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              rows="2"
                            />
                          ) : (
                            <span className="text-sm text-gray-600 block truncate">
                              {enrollment.notes || '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleUpdate(enrollment.courseEmployeeId)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                              >
                                حفظ
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(enrollment)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                              >
                                تعديل
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(
                                    enrollment.courseEmployeeId,
                                    enrollment.employeeFullName || `موظف #${enrollment.employeeId}`
                                  )
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
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
          )}
        </div>
      </div>

      {/* Modal تسجيل موظف */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">تسجيل موظف في الدورة</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">الموظف *</label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر الموظف</option>
                    {getAvailableEmployees().map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.secondName} {emp.thirdName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">ملاحظات</label>
                  <textarea
                    value={enrollNotes}
                    onChange={(e) => setEnrollNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="ملاحظات إضافية (اختياري)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEnrollModal(false);
                    setSelectedEmployeeId('');
                    setEnrollNotes('');
                  }}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleEnrollEmployee}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  تسجيل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsPage;
