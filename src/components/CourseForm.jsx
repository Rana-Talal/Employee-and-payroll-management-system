import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import Select from "react-select";
import api from "../services/api";

const CourseForm = ({ onAdd, onClose, employeeId }) => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [notes, setNotes] = useState("");
  const [degree, setDegree] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await api.courses.getAll({ PageSize: 1000 });

        const courseList = Array.isArray(data) ? data : data.items || [];
        const mappedCourses = courseList.map(c => ({
          value: c.courseId,
          label: `${c.courseName} (${c.teacher || 'مدرس غير محدد'})`,
          courseData: c,
        }));
        setAvailableCourses(mappedCourses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId || !selectedCourseId) {
      setError("يجب اختيار دورة والموظف يجب أن يكون محدداً.");
      return;
    }

    setLoading(true);
    setError(null);
    
    const courseIDNumber = Number(selectedCourseId);
    const employeeIDNumber = Number(employeeId);

    if (isNaN(courseIDNumber) || isNaN(employeeIDNumber)) {
        setError("خطأ في تنسيق المعرفات. يجب أن تكون أرقاماً.");
        setLoading(false);
        return;
    }

    const payload = {
      courseId: courseIDNumber,
      employeeId: employeeIDNumber,
      notes: notes.trim() || null, 
      degree: degree.trim() || null,
      isActive: isActive,
    };

    try {
      const newCourseEmployeeLink = await api.courses.enrollEmployee(payload);
      const selectedCourse = availableCourses.find(c => c.value === selectedCourseId)?.courseData;

      const newCourseData = {
          courseEmployeeId: newCourseEmployeeLink.courseEmployeeId,
          ...selectedCourse,
          notes: payload.notes || "—", 
          degree: payload.degree || "—",
          isActive: payload.isActive,
          dateStart: selectedCourse.dateStart ? selectedCourse.dateStart.split('T')[0] : "—",
          dateEnd: selectedCourse.dateEnd ? selectedCourse.dateEnd.split('T')[0] : "—",
      };
      
      onAdd(newCourseData);
      onClose();
      alert("تم ربط الدورة بنجاح.");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4">
        ربط دورة تدريبية للموظف
      </Dialog.Title>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اختر الدورة *</label>
          <Select
            options={availableCourses}
            onChange={(selected) => setSelectedCourseId(selected?.value || null)}
            placeholder={loading ? "جاري تحميل الدورات..." : "ابدأ بكتابة اسم الدورة"}
            isClearable
            isSearchable 
            isDisabled={loading || !employeeId}
            className="text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الدرجة المكتسبة (اختياري)</label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="مثل: امتياز، 90/100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تفعيل الربط</label>
            <div className="flex items-center h-full pt-1">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                id="courseIsActive"
              />
              <label htmlFor="courseIsActive" className="ml-2 text-sm text-gray-900">مفعل</label>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات على الدورة للموظف</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            placeholder="ملاحظات خاصة بربط هذه الدورة بهذا الموظف"
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300"
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
            disabled={loading || !selectedCourseId || !employeeId}
          >
            {loading ? "جاري الربط..." : "ربط الدورة"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;