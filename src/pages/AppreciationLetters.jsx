import { useState, useEffect } from 'react';
import api from '../services/api';

const AppreciationLetters = () => {
  const [letters, setLetters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLetter, setEditingLetter] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
  });

  const [formData, setFormData] = useState({
    employeeID: '',
    letterType: '',
    period: '',
    reason: '',
    adminOrderDate: '',
    adminOrderNumber: '',
    periodOrderDate: '',
    periodOrderNumber: '',
  });

  const [filters, setFilters] = useState({
    employeeID: '',
    letterType: '',
    period: '',
  });

  // Letter Types
  const letterTypes = [
    { value: 0, label: 'كتاب شكر' },
    { value: 1, label: 'ترفيع' },
    { value: 2, label: 'تقدير' },
  ];

  // Periods
  const periods = [
    { value: 0, label: 'شهر' },
    { value: 1, label: 'شهرين' },
    { value: 2, label: 'ثلاثة أشهر' },
    { value: 3, label: 'ستة أشهر' },
    { value: 4, label: 'سنة' },
  ];

  useEffect(() => {
    fetchLetters();
    fetchEmployees();
  }, [pagination.pageNumber, pagination.pageSize]);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const response = await api.appreciationLetters.getAll({
        PageNumber: pagination.pageNumber,
        PageSize: pagination.pageSize,
        ...filters,
      });

      setLetters(response.items || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
      }));
    } catch (error) {
      console.error('خطأ في جلب كتب الشكر:', error);
      alert('فشل تحميل كتب الشكر: ' + error.message);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        employeeID: parseInt(formData.employeeID),
        letterType: parseInt(formData.letterType),
        period: parseInt(formData.period),
        reason: formData.reason,
        adminOrderDate: formData.adminOrderDate,
        adminOrderNumber: formData.adminOrderNumber,
        periodOrderDate: formData.periodOrderDate || null,
        periodOrderNumber: formData.periodOrderNumber || null,
      };

      if (editingLetter) {
        await api.appreciationLetters.update(editingLetter.id, data);
        alert('تم تحديث الكتاب بنجاح');
      } else {
        await api.appreciationLetters.create(data);
        alert('تم إضافة الكتاب بنجاح');
      }

      setShowModal(false);
      resetForm();
      fetchLetters();
    } catch (error) {
      console.error('خطأ في حفظ الكتاب:', error);
      alert('فشل حفظ الكتاب: ' + error.message);
    }
  };

  const handleEdit = (letter) => {
    setEditingLetter(letter);
    setFormData({
      employeeID: letter.employeeID.toString(),
      letterType: letter.letterType?.toString() || '',
      period: letter.period?.toString() || '',
      reason: letter.reason || '',
      adminOrderDate: letter.adminOrderDate?.split('T')[0] || '',
      adminOrderNumber: letter.adminOrderNumber || '',
      periodOrderDate: letter.periodOrderDate?.split('T')[0] || '',
      periodOrderNumber: letter.periodOrderNumber || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;

    try {
      await api.appreciationLetters.delete(id);
      alert('تم حذف الكتاب بنجاح');
      fetchLetters();
    } catch (error) {
      console.error('خطأ في حذف الكتاب:', error);
      alert('فشل حذف الكتاب: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeID: '',
      letterType: '',
      period: '',
      reason: '',
      adminOrderDate: '',
      adminOrderNumber: '',
      periodOrderDate: '',
      periodOrderNumber: '',
    });
    setEditingLetter(null);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
    fetchLetters();
  };

  const clearFilters = () => {
    setFilters({ employeeID: '', letterType: '', period: '' });
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
    setTimeout(fetchLetters, 100);
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">إدارة كتب الشكر والترفيعات</h2>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            + إضافة كتاب جديد
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3 text-gray-700">البحث والتصفية</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.employeeID}
              onChange={(e) => handleFilterChange('employeeID', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الموظفين</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.secondName} {emp.thirdName} {emp.lastName}
                </option>
              ))}
            </select>

            <select
              value={filters.letterType}
              onChange={(e) => handleFilterChange('letterType', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الأنواع</option>
              {letterTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع المدد</option>
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                بحث
              </button>
              <button
                onClick={clearFilters}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">اسم الموظف</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">نوع الكتاب</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">المدة</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">السبب</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">رقم الأمر</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">تاريخ الأمر</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {letters.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-gray-500">
                        لا توجد كتب
                      </td>
                    </tr>
                  ) : (
                    letters.map((letter, index) => (
                      <tr key={letter.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          {(pagination.pageNumber - 1) * pagination.pageSize + index + 1}
                        </td>
                        <td className="px-4 py-3">{letter.employeeFullName}</td>
                        <td className="px-4 py-3">{letter.letterTypeName || '-'}</td>
                        <td className="px-4 py-3">{letter.periodName || '-'}</td>
                        <td className="px-4 py-3">{letter.reason}</td>
                        <td className="px-4 py-3">{letter.adminOrderNumber}</td>
                        <td className="px-4 py-3">
                          {new Date(letter.adminOrderDate).toLocaleDateString('ar-IQ')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleEdit(letter)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded ml-2 transition"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(letter.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, pageNumber: Math.max(1, prev.pageNumber - 1) }))
                  }
                  disabled={pagination.pageNumber === 1}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <span className="text-gray-700">
                  صفحة {pagination.pageNumber} من {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageNumber: Math.min(prev.totalPages, prev.pageNumber + 1),
                    }))
                  }
                  disabled={pagination.pageNumber === pagination.totalPages}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {editingLetter ? 'تعديل كتاب' : 'إضافة كتاب جديد'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">الموظف *</label>
                    <select
                      value={formData.employeeID}
                      onChange={(e) => setFormData({ ...formData, employeeID: e.target.value })}
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
                    <label className="block text-gray-700 font-medium mb-2">نوع الكتاب *</label>
                    <select
                      value={formData.letterType}
                      onChange={(e) => setFormData({ ...formData, letterType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">اختر النوع</option>
                      {letterTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">المدة *</label>
                    <select
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">اختر المدة</option>
                      {periods.map((period) => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">تاريخ الأمر الإداري *</label>
                    <input
                      type="date"
                      value={formData.adminOrderDate}
                      onChange={(e) => setFormData({ ...formData, adminOrderDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">رقم الأمر الإداري *</label>
                    <input
                      type="text"
                      value={formData.adminOrderNumber}
                      onChange={(e) => setFormData({ ...formData, adminOrderNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">تاريخ أمر المدة</label>
                    <input
                      type="date"
                      value={formData.periodOrderDate}
                      onChange={(e) => setFormData({ ...formData, periodOrderDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">رقم أمر المدة</label>
                    <input
                      type="text"
                      value={formData.periodOrderNumber}
                      onChange={(e) => setFormData({ ...formData, periodOrderNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">السبب *</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    {editingLetter ? 'تحديث' : 'إضافة'}
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

export default AppreciationLetters;
