// import { useState } from "react";

// const API_BASE = "http://192.168.11.230:1006";

// // 🔹 الحقول: الملف الشخصي
// const profileFields = [
//   { label: "الاسم الرباعي", name: "fullName", type: "text" },
//   { label: "الرقم الوظيفي", name: "employeeId", type: "number" },
//   { label: "رقم كتاب المالية للترفيع", name: "promotionFinanceBookNumber", type: "number" },
//   { label: "تاريخ كتاب المالية للترفيع", name: "promotionFinanceBookDate", type: "date" },
//   { label: "العنوان الوظيفي", name: "jobTitle", type: "text" },
//   { label: "الدرجة الوظيفية", name: "jobGrade", type: "text" },
//   { label: "رقم أمر التعيين", name: "appointmentOrderNumber", type: "number" },
//   { label: "تاريخ أمر التعيين", name: "appointmentOrderDate", type: "date" },
//   { label: "تاريخ المباشرة", name: "startDate", type: "date" },
//   { label: "تاريخ الاستقالة", name: "resignationDate", type: "date" },
//   { label: "تاريخ إعادة التعيين", name: "reappointmentDate", type: "date" },
//   { label: "الحالة الدراسية", name: "studyStatus", type: "text" },
//   { label: "التخصص الدقيق", name: "specialization", type: "text" },
//   { label: "اسم المعهد أو الكلية", name: "instituteName", type: "text" },
//   { label: "الشهادات", name: "certificates", type: "text" },
//   { label: "مكان العمل", name: "workPlace", type: "text" },
//   { label: "الشُعبة", name: "division", type: "text" },
//   { label: "مكان التنسيب", name: "assignmentLocation", type: "text" },
//   { label: "حالة الخدمة", name: "serviceStatus", type: "text" },
//   { label: "الملاحظات", name: "notes", type: "text" },
//   {
//     label: "القسم",
//     name: "department",
//     type: "select",
//     options: ["الموارد البشرية", "الشؤون المالية", "تكنولوجيا المعلومات"],
//   },
//   {
//     label: "الحالة الوظيفية",
//     name: "jobStatus",
//     type: "select",
//     options: ["مستمر", "مجاز", "منقول", "متقاعد"],
//   },
//   { label: "تاريخ منح الدرجة", name: "degreeGrantDate", type: "date" },
// ];

// // 🔹 الاستحقاقات
// const allowancesFields = [
//   { label: "الراتب الاسمي", name: "baseSalary", type: "number" },
//   { label: "المخصصات", name: "Entitlement", type: "select" },
//   { label: "مخصصات زوجية", name: "marriageAllowance", type: "number" },
//   { label: "مخصصات اطفال", name: "childrenAllowance", type: "number" },
//   { label: "مخصصات استثنائية", name: "specialAllowance", type: "number" },
//   { label: "مخصصات موقع", name: "locationAllowance", type: "number" },
//   { label: "مخصصات خطورة", name: "riskAllowance", type: "select" },
//   { label: "مخصصات مهنية", name: "professionalAllowance", type: "select" },
//   { label: "مخصصات حرفية", name: "craftAllowance", type: "select" },
//   { label: "مخصصات هندسية", name: "engineeringAllowance", type: "select" },
//   { label: "مخصصات المنصب", name: "positionAllowance", type: "select" },
//   { label: "مخصصات الشهادة", name: "degreeAllowance", type: "select" },
//   { label: "مخصصات جامعية", name: "universityAllowance", type: "select" },
// ];

// // 🔹 الاستقطاعات
// const deductionsFields = [
//   { label: "عدد أيام الغياب", name: "absenceDays", type: "number" },
//   { label: "استقطاع الغياب", name: "absenceDeduction", type: "number" },
//   { label: "استقطاع التقاعد", name: "retirementDeduction", type: "number" },
//   { label: "استقطاع إيجار الدور (%)", name: "houseRentPercent", type: "number" },
//   { label: "استقطاع إيجار الدور (المبلغ)", name: "houseRentAmount", type: "number" },
//   { label: "استقطاع مصارف (سلف)", name: "bankLoans", type: "number" },
//   { label: "رعاية اجتماعية", name: "socialCare", type: "number" },
//   { label: "استقطاع ضريبة الدخل", name: "incomeTax", type: "number" },
//   { label: "دائرة التنفيذ", name: "execution", type: "number" },
// ];


// export default function DataEmployee() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeTab, setActiveTab] = useState("profile");
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({});
//   const [showData, setShowData] = useState(false);

//   const handleChange = (e, name) => {
//     setFormData({ ...formData, [name]: e.target.value });
//   };

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) return;

//     try {
//       const res = await fetch(`${API_BASE}/employees?name=${searchQuery}`);
//       if (!res.ok) throw new Error("خطأ في جلب البيانات");
//       const data = await res.json();
//       if (data.length === 0) {
//         alert("الموظف غير موجود");
//         setShowData(false);
//         return;
//       }
//       setFormData(data[0]); // نفترض أن API ترجع array من الموظفين
//       setShowData(true);
//     } catch (err) {
//       console.error(err);
//       alert("حدث خطأ أثناء البحث");
//     }
//   };

//   const handleSave = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/employees/${formData.employeeId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });
//       if (!res.ok) throw new Error("خطأ في حفظ البيانات");
//       alert("تم حفظ التعديلات ✅");
//       setIsEditing(false);
//     } catch (err) {
//       console.error(err);
//       alert("حدث خطأ أثناء الحفظ");
//     }
//   };

//   const renderFields = (fields) => (
//     <div className="grid grid-cols-5 gap-4 mt-4">
//       {fields.map((field, idx) => (
//         <div key={idx} className="flex flex-col">
//           <label className="text-base font-semibold text-gray-700">{field.label}</label>
//           {field.type === "select" ? (
//             <select
//               value={formData[field.name] || ""}
//               onChange={(e) => handleChange(e, field.name)}
//               disabled={!isEditing}
//               className={`border p-2 rounded ${!isEditing ? "bg-gray-100" : ""}`}
//             >
//               <option value="">اختر...</option>
//               {field.options?.map((opt, i) => (
//                 <option key={i} value={opt}>{opt}</option>
//               ))}
//             </select>
//           ) : (
//             <input
//               type={field.type}
//               value={formData[field.name] || ""}
//               onChange={(e) => handleChange(e, field.name)}
//               disabled={!isEditing}
//               className={`border p-2 rounded ${!isEditing ? "bg-gray-100" : ""}`}
//             />
//           )}
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <div className="p-6 bg-white rounded shadow w-3/4 mx-auto">
//       {/* البحث */}
//       <div className="flex gap-2 mb-6">
//         <input
//           type="text"
//           placeholder="ادخل الاسم الثلاثي للموظف..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="border p-2 rounded text-base w-72"
//         />
//         <button
//           onClick={handleSearch}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-base"
//         >
//           بحث
//         </button>
//       </div>

//       {/* التبويبات */}
//       <div className="flex border-b mb-4 gap-2">
//         <button
//           className={`px-5 py-2 text-base rounded transition-shadow duration-300 shadow-cyan-500/50 hover:shadow-lg ${activeTab === "profile" ? "border-b-4 border-blue-500 font-bold" : "border-b-2 border-gray-200"}`}
//           onClick={() => setActiveTab("profile")}
//         >
//           الملف الشخصي
//         </button>
//         <button
//           className={`px-5 py-2 text-base rounded transition-shadow duration-300 shadow-cyan-500/50 hover:shadow-lg ${activeTab === "allowances" ? "border-b-4 border-blue-500 font-bold" : "border-b-2 border-gray-200"}`}
//           onClick={() => setActiveTab("allowances")}
//         >
//           الاستحقاقات
//         </button>
//         <button
//           className={`px-5 py-2 text-base rounded transition-shadow duration-300 shadow-cyan-500/50 hover:shadow-lg ${activeTab === "deductions" ? "border-b-4 border-blue-500 font-bold" : "border-b-2 border-gray-200"}`}
//           onClick={() => setActiveTab("deductions")}
//         >
//           الاستقطاعات
//         </button>
//       </div>

//       {/* الحقول */}
//       {showData && (
//         <>
//           {activeTab === "profile" && renderFields(profileFields)}
//           {activeTab === "allowances" && renderFields(allowancesFields)}
//           {activeTab === "deductions" && renderFields(deductionsFields)}

//           {/* الأزرار */}
//           <div className="mt-6 flex gap-2">
//             {!isEditing ? (
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
//               >
//                 تعديل
//               </button>
//             ) : (
//               <>
//                 <button
//                   onClick={handleSave}
//                   className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//                 >
//                   حفظ
//                 </button>
//                 <button
//                   onClick={() => setIsEditing(false)}
//                   className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//                 >
//                   إلغاء
//                 </button>
//               </>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }