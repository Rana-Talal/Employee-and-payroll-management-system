import { useState } from "react";
import logo from "../assets/logo.jpg"; // تأكد من المسار

function PrintHeader() {
  return (
    <div className="hidden print:flex items-center justify-between border-b pb-4 mb-6">
      <img src={logo} alt="شعار المحافظة" className="h-20 w-auto" />
      <h1 className="text-3xl font-bold text-center flex-grow">
        محافظة بغداد
      </h1>
    </div>
  );
}

export default function EmployeeSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeData, setEmployeeData] = useState(null);

  const handleSearch = () => {
    const data = JSON.parse(localStorage.getItem("employeeData"));
    if (data && data.fullName && data.fullName.includes(searchTerm)) {
      setEmployeeData(data);
    } else {
      alert("لم يتم العثور على الموظف");
      setEmployeeData(null);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setEmployeeData(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg print:p-0 print:shadow-none print:bg-transparent">
      
      {/* شعار واسم المحافظة فقط في الطباعة */}
      <PrintHeader />

      {/* العناصر المرئية فقط في الشاشة، تختفي في الطباعة */}
      <div className="print:hidden">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">البحث عن موظف</h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <input
            type="text"
            placeholder="أدخل اسم الموظف"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow border border-gray-300 rounded-lg px-5 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow hover:bg-blue-700 transition text-lg"
          >
            بحث
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-400 text-white px-8 py-3 rounded-lg shadow hover:bg-gray-500 transition text-lg"
          >
            تصفير
          </button>
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-8 py-3 rounded-lg shadow hover:bg-green-700 transition text-lg"
          >
            طباعة
          </button>
        </div>
      </div>

      {/* عرض بيانات الموظف */}
      {employeeData ? (
        <>
          {/* عنوان معلومات الموظف في الوسط */}
          <h2 className="text-2xl font-bold text-center mb-6 print:mb-12 print:text-3xl">
            معلومات الموظف
          </h2>

          {/* جدول البيانات بدون رؤوس */}
          <table className="w-full border-collapse border border-gray-300 text-right print:border-0 print:shadow-none print:bg-transparent">
            <tbody>
              <tr className="even:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-semibold w-40">الاسم</td>
                <td className="border border-gray-300 px-6 py-3">{employeeData.fullName || "-"}</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-semibold w-40">الرقم الوظيفي</td>
                <td className="border border-gray-300 px-6 py-3">{employeeData.employeeId || "-"}</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-semibold w-40">العنوان الوظيفي</td>
                <td className="border border-gray-300 px-6 py-3">{employeeData.jobTitle || "-"}</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-semibold w-40">مكان العمل</td>
                <td className="border border-gray-300 px-6 py-3">{employeeData.workPlace || "-"}</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-semibold w-40">الحالة الوظيفية</td>
                <td className="border border-gray-300 px-6 py-3">{employeeData.jobStatus || "-"}</td>
              </tr>
            </tbody>
          </table>
        </>
      ) : (
        <p className="text-center text-gray-500 text-lg mt-12 print:mt-20">
          الرجاء إدخال اسم موظف والضغط على بحث
        </p>
      )}
    </div>
  );
}
