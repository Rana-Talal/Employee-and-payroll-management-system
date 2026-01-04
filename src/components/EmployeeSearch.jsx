import React, { useState, useEffect } from "react";

// قائمة الحقول الأساسية للموظف
const fields = [
  { label: "رقم الاستمارة", name: "serial" },
  { label: "رقم الحساب", name: "accountNumber" },
  { label: "الاسم الثلاثي", name: "fullName" },
  { label: "العنوان الوظيفي", name: "jobTitle" },
  { label: "القسم", name: "department" },
  { label: "التخصص", name: "major" },
  { label: "الراتب الاسمي", name: "baseSalary" },
];

// قائمة الأقسام المتاحة من الكود الأصلي
const departments = ["نظم المعلومات", "الموارد البشرية", "القانونية", "الاملاك"];

// هذه هي صفحة البحث عن الموظفين
const EmployeeSearch = () => {
  const [employee, setEmployee] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null); // State to hold the employee being edited
  const [editFormData, setEditFormData] = useState({}); // State for the edit form data

  // استخدام useEffect لتحميل البيانات من localStorage عند تحميل الصفحة
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSalaries = localStorage.getItem("salaries");
      if (storedSalaries) {
        try {
          const parsedSalaries = JSON.parse(storedSalaries);
          setEmployee(parsedSalaries);
        } catch (error) {
          console.error("Failed to parse salaries from localStorage", error);
        }
      }
    }
  }, []);

  // فلترة الموظفين بناءً على القسم المحدد والاسم الذي تم إدخاله في شريط البحث
  const filteredEmployee = employee.filter(employee => {
    const departmentMatch = selectedDepartment ? employee.department === selectedDepartment : false;
    const nameMatch = employee.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    return departmentMatch && nameMatch;
  });

  // Handle delete employee
  const handleDelete = (serial) => {
    if (window.confirm("هل أنت متأكد من حذف هذا القيد؟")) {
      const updatedEmployees = employee.filter(emp => emp.serial !== serial);
      setEmployee(updatedEmployees);
      localStorage.setItem("salaries", JSON.stringify(updatedEmployee));
    }
  };

  // Handle edit employee
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setEditFormData(employee);
  };

  // Handle save edited employee
  const handleSaveEdit = () => {
    const updatedEmployee = employee.map(emp =>
      emp.serial === editFormData.serial ? editFormData : emp
    );
    setEmployee(updatedEmployee);
    localStorage.setItem("salaries", JSON.stringify(updatedEmployee));
    setEditingEmployee(null);
  };

  // Handle change in edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-tajawal text-right">
      <div className="p-6 bg-white text-right border border-gray-400 rounded-xl shadow-md max-w-6xl mx-auto font-tajawal">
        {/* Header and Search Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4 mb-4">
          <h1 className="text-3xl font-bold text-center mb-4 md:mb-0 md:text-right">
            بحث عن موظف
          </h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Department Selection */}
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                // Clear name search when department changes
                setSearchQuery("");
              }}
              className="w-full md:w-48 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            >
              <option value="">اختر القسم...</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
            {/* Search by Name */}
            <input
              type="text"
              placeholder="ابحث بالاسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              disabled={!selectedDepartment} // Disable until a department is selected
            />
          </div>
        </div>

        {/* Display Search Results */}
        <div className="mt-8">
          {selectedDepartment && (
            <h2 className="text-2xl font-bold mb-6">
              نتائج البحث لقسم "{selectedDepartment}"
            </h2>
          )}
          
          {selectedDepartment && filteredEmployee.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-right table-auto border-collapse border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    {fields.map((field, index) => (
                      <th key={index} className="px-4 py-2 font-medium">
                        {field.label}
                      </th>
                    ))}
                    <th className="px-4 py-2 font-medium">الاجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployee.map((employee, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      {fields.map((field, i) => (
                        <td key={i} className="px-4 py-2 whitespace-nowrap">
                          {employee[field.name]}
                        </td>
                      ))}
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <button 
                          onClick={() => handleEdit(employee)} 
                          className="text-blue-500 hover:text-blue-700 mx-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(employee.serial)} 
                          className="text-red-500 hover:text-red-700 mx-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg py-10">
              {selectedDepartment ? "لم يتم العثور على موظفين في هذا القسم أو يرجى تعديل البحث." : "يرجى اختيار قسم للبدء."}
            </div>
          )}
        </div>

        {/* Edit Modal/Form */}
        {editingEmployee && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="p-8 bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
              <h3 className="text-2xl font-bold mb-4">تعديل بيانات الموظف</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  {fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-gray-700 font-medium mb-1">{field.label}</label>
                      <input
                        type="text"
                        name={field.name}
                        value={editFormData[field.name]}
                        onChange={handleEditChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly={field.name === "serial" || field.name === "department"} // Prevent editing serial and department
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-4">
                  <button 
                    type="button" 
                    onClick={() => setEditingEmployee(null)} 
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSearch;
