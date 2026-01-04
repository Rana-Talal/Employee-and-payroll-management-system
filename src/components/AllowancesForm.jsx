// // src/pages/EditEmployee.jsx

// import React, { useState, useEffect, Fragment, useCallback } from "react";
// import { Disclosure, Dialog, Transition } from "@headlessui/react";
// import { ChevronUpIcon, TrashIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/solid";
// import { useNavigate } from "react-router-dom";
// import Select from "react-select";

// const url = "http://192.168.11.230:1006";

// // =================================================================
// // 🔹 LabeledInput Component (تم إبقاؤه كما هو مع تعديل بسيط للوضوح)
// // =================================================================
// const LabeledInput = ({
//     label,
//     type = "text",
//     name,
//     value,
//     onChange,
//     readOnly,
//     options,
//     className,
// }) => {
//     if (type === "select") {
//         return (
//             <div className={`flex flex-col ${className}`}>
//                 <label className="text-sm font-semibold mb-1 text-gray-700">{label}</label>
//                 <select
//                     name={name}
//                     // تحويل null/undefined إلى سلسلة فارغة ليتم عرضها في عنصر select
//                     value={value === null || value === undefined ? "" : String(value)}
//                     onChange={onChange}
//                     readOnly={readOnly}
//                     className={`border border-gray-300 rounded p-2 text-sm ${readOnly ? "bg-gray-100" : ""
//                         }`}
//                     disabled={readOnly}
//                 >
//                     <option value="">اختر...</option>
//                     {options &&
//                         options.map((opt, idx) => (
//                             <option key={idx} value={opt.value}>
//                                 {opt.label}
//                             </option>
//                         ))}
//                 </select>
//             </div>
//         );
//     }

//     if (type === "search-select") {
//         return (
//             <div className={`flex flex-col ${className}`}>
//                 <label className="text-sm font-semibold mb-1 text-gray-700">{label}</label>
//                 <Select
//                     name={name}
//                     value={options.find((opt) => opt.value === value) || null}
//                     onChange={(selectedOption) => {
//                         const event = {
//                             target: {
//                                 name,
//                                 value: selectedOption ? selectedOption.value : "",
//                             },
//                         };
//                         onChange(event);
//                     }}
//                     options={options}
//                     isDisabled={readOnly}
//                     className="text-sm"
//                     placeholder="اختر..."
//                     isClearable={true}
//                     isRtl={true}
//                 />
//             </div>
//         );
//     }

//     return (
//         <div className={`flex flex-col ${className}`}>
//             <label className="text-sm font-semibold mb-1 text-gray-700">{label}</label>
//             <input
//                 type={type}
//                 name={name}
//                 // تحويل null/undefined إلى سلسلة فارغة
//                 value={value ?? ""}
//                 onChange={onChange}
//                 readOnly={readOnly}
//                 className={`border border-gray-300 rounded p-2 text-sm ${readOnly ? "bg-gray-100" : ""
//                     }`}
//             />
//         </div>
//     );
// };


// // =================================================================
// // 🔹 ServiceForm Component (إضافة / تعديل خدمة سابقة)
// // =================================================================
// const ServiceForm = ({ onAdd, onClose }) => {
//     const serviceTypes = [
//         { value: "سابقة", label: "خدمة سابقة" },
//         { value: "محاماة", label: "خدمة محاماة" },
//         { value: "تقاعد", label: "خدمة لأغراض التقاعد" },
//         { value: "عسكرية", label: "خدمة عسكرية" },
//         { value: "جهادية", label: "خدمة جهادية" },
//         { value: "صحفية", label: "خدمة صحفية" },
//         { value: "سياسي", label: "خدمة فصل سياسي" },
//     ];
//     const [serviceData, setServiceData] = useState({
//         serviceType: "",
//         startDate: "",
//         endDate: "",
//         day: 0,
//         month: 0,
//         year: 0,
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setServiceData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleCalculateDuration = () => {
//         const start = new Date(serviceData.startDate);
//         const end = new Date(serviceData.endDate);
//         if (start && end && start <= end) {
//             const diffTime = Math.abs(end - start);
//             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//             const years = Math.floor(diffDays / 365.25);
//             const remainingDaysAfterYears = diffDays % 365.25;
//             const months = Math.floor(remainingDaysAfterYears / 30.44);
//             const days = Math.floor(remainingDaysAfterYears % 30.44);
//             setServiceData((prevData) => ({
//                 ...prevData,
//                 year: years,
//                 month: months,
//                 day: days,
//             }));
//         } else {
//             alert("الرجاء إدخال تاريخ بدء وتاريخ انتهاء صحيحين.");
//         }
//     };

//     const handleAdd = () => {
//         if (!serviceData.serviceType || !serviceData.startDate || !serviceData.endDate) {
//             alert("الرجاء إدخال جميع الحقول المطلوبة (نوع الخدمة، تاريخ البدء والانتهاء).");
//             return;
//         }
//         onAdd(serviceData);
//         onClose(); // إغلاق النموذج بعد الإضافة
//     };

//     return (
//         <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
//             <h3 className="text-xl font-bold mb-4 text-gray-800">حساب مدة الخدمة</h3>
//             <div className="grid grid-cols-2 gap-4">
//                 <LabeledInput
//                     label="نوع الخدمة"
//                     name="serviceType"
//                     type="select"
//                     value={serviceData.serviceType}
//                     onChange={handleChange}
//                     options={serviceTypes}
//                     className="col-span-2"
//                 />
//                 <LabeledInput
//                     label="تاريخ البدء"
//                     name="startDate"
//                     type="date"
//                     value={serviceData.startDate}
//                     onChange={handleChange}
//                 />
//                 <LabeledInput
//                     label="تاريخ الانتهاء"
//                     name="endDate"
//                     type="date"
//                     value={serviceData.endDate}
//                     onChange={handleChange}
//                 />
//                 <button
//                     type="button"
//                     onClick={handleCalculateDuration}
//                     className="bg-blue-600 text-white px-4 py-2 rounded col-span-2 mt-2 text-sm hover:bg-blue-700 transition"
//                 >
//                     احتساب المدة
//                 </button>
//             </div>
//             <div className="grid grid-cols-3 gap-4 mt-6 border-t pt-4 border-gray-200">
//                 <LabeledInput
//                     label="سنة"
//                     name="year"
//                     value={serviceData.year}
//                     onChange={handleChange}
//                     type="number"
//                 />
//                 <LabeledInput
//                     label="شهر"
//                     name="month"
//                     value={serviceData.month}
//                     onChange={handleChange}
//                     type="number"
//                 />
//                 <LabeledInput
//                     label="يوم"
//                     name="day"
//                     value={serviceData.day}
//                     onChange={handleChange}
//                     type="number"
//                 />
//             </div>
//             <div className="flex justify-end mt-6 space-x-2 rtl:space-x-reverse">
//                 <button
//                     type="button"
//                     onClick={handleAdd}
//                     className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
//                 >
//                     حفظ الخدمة
//                 </button>
//                 <button
//                     type="button"
//                     onClick={onClose}
//                     className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
//                 >
//                     إلغاء
//                 </button>
//             </div>
//         </div>
//     );
// };


// // =================================================================
// // 🔹 PromotionAndSalaryForm Component (إضافة ترقية / علاوة / عقوبة)
// // =================================================================
// const PromotionAndSalaryForm = ({ onAdd, onClose, gradeSteps, currentGrade, currentStep, currentSalary }) => {
//     // 💡 ملاحظة: يجب أن تكون الحقول التي تتضمن ID أو رقم عبارة عن أرقام أو سلاسل نصية حسب الـ API
//     const [formData, setFormData] = useState({
//         type: "ترقية", // Default type
//         // حقول مشتركة للترقية
//         promotionOrderNumber: "",
//         promotionOrderDate: "",
//         year: "",
//         entitlement: "",
//         previousGrade: currentGrade,
//         previousStep: currentStep,
//         previousSalary: currentSalary,
//         newGrade: "",
//         newStep: "",
//         newSalary: "",
//         entitlementDate: "",
//         // حقول العلاوة
//         appreciationCount: "",
//         allowanceOrderNumber: "",
//         allowanceOrderDate: "",
//         appreciationBookNumber: "",
//         appreciationDate: "",
//         reason: "",
//         giver: "",
//         // حقول العقوبة
//         penaltyOrderNumber: "",
//         penaltyDate: "",
//         penaltyReason: "",
//         penaltyType: "",
//         cancelPenaltyOrderNumber: "",
//         cancelPenaltyDate: ""
//     });

//     useEffect(() => {
//         // تحديث بيانات الدرجة والمرحلة الحالية عند تغيير نوع الإجراء إلى "ترقية"
//         if (formData.type === "ترقية") {
//             setFormData(prev => ({
//                 ...prev,
//                 previousGrade: currentGrade,
//                 previousStep: currentStep,
//                 previousSalary: currentSalary,
//             }));
//         }
//     }, [formData.type, currentGrade, currentStep, currentSalary]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         let finalValue = value;
//         let newFormData = { ...formData, [name]: finalValue };

//         if (name === "newGrade" || name === "newStep") {
//             const grade = newFormData.newGrade;
//             const step = newFormData.newStep;
//             if (grade && step) {
//                 const selectedGradeStep = gradeSteps.find(
//                     (g) => g.grade === parseInt(grade) && g.step === parseInt(step)
//                 );
//                 // استخدام `baseSalary` إذا وُجد
//                 newFormData.newSalary = selectedGradeStep ? selectedGradeStep.baseSalary : "";
//             } else {
//                 newFormData.newSalary = "";
//             }
//         }
        
//         if (name === "type") {
//              // مسح حقول النموذج عند تغيير النوع لتجنب تداخل البيانات
//             newFormData = {
//                 ...newFormData,
//                 promotionOrderNumber: "", promotionOrderDate: "", year: "", entitlement: "",
//                 newGrade: "", newStep: "", newSalary: "", entitlementDate: "",
//                 appreciationCount: "", allowanceOrderNumber: "", allowanceOrderDate: "",
//                 appreciationBookNumber: "", appreciationDate: "", reason: "", giver: "",
//                 penaltyOrderNumber: "", penaltyDate: "", penaltyReason: "", penaltyType: "",
//                 cancelPenaltyOrderNumber: "", cancelPenaltyDate: "",
//             };
//         }


//         setFormData(newFormData);
//     };

//     const handleAdd = () => {
//         onAdd(formData);
//         onClose(); // إغلاق النموذج بعد الإضافة
//     };

//     const uniqueGradesOptions = [...new Set(gradeSteps.map(g => g.grade))].map(g => ({ value: g, label: g }));
//     const filteredStepsOptions = [...new Set(gradeSteps.filter(g => g.grade === parseInt(formData.newGrade)).map(g => g.step))].map(s => ({ value: s, label: s }));


//     const formFields = {
//         "ترقية": [
//             { label: "رقم أمر الترقية", name: "promotionOrderNumber", type: "text" },
//             { label: "تاريخ أمر الترقية", name: "promotionOrderDate", type: "date" },
//             { label: "السنة", name: "year", type: "number" },
//             { label: "الاستحقاق", name: "entitlement", type: "text" },
//             { label: "الدرجة السابقة", name: "previousGrade", type: "text", readOnly: true },
//             { label: "المرحلة السابقة", name: "previousStep", type: "text", readOnly: true },
//             { label: "مقدار الراتب السابق", name: "previousSalary", type: "number", readOnly: true },
//             { label: "الدرجة الجديدة", name: "newGrade", type: "select", options: uniqueGradesOptions },
//             { label: "المرحلة الجديدة", name: "newStep", type: "select", options: filteredStepsOptions },
//             { label: "مقدار الراتب الجديد", name: "newSalary", type: "number", readOnly: false },
//             { label: "تاريخ الاستحقاق", name: "entitlementDate", type: "date" },
//         ],
//         "علاوة": [
//             { label: "عدد الشكر والعقوبات (المحتسبة)", name: "appreciationCount", type: "number" },
//             { label: "رقم الأمر الإداري للعلاوة", name: "allowanceOrderNumber", type: "text" },
//             { label: "تاريخ الأمر الإداري للعلاوة", name: "allowanceOrderDate", type: "date" },
//             { label: "رقم كتاب الشكر", name: "appreciationBookNumber", type: "text" },
//             { label: "تاريخ الكتاب", name: "appreciationDate", type: "date" },
//             { label: "السبب", name: "reason", type: "text" },
//             { label: "جهة المنح", name: "giver", type: "text" },
//         ],
//         "عقوبة": [
//             { label: "رقم الأمر الإداري للعقوبة", name: "penaltyOrderNumber", type: "text" },
//             { label: "تاريخ الأمر الإداري للعقوبة", name: "penaltyDate", type: "date" },
//             { label: "أسباب العقوبة", name: "penaltyReason", type: "text" },
//             { label: "نوع العقوبة", name: "penaltyType", type: "text" },
//             { label: "رقم أمر إلغاء العقوبة", name: "cancelPenaltyOrderNumber", type: "text" },
//             { label: "تاريخ إلغاء العقوبة", name: "cancelPenaltyDate", type: "date" },
//         ],
//     };

//     return (
//         <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
//             <h3 className="text-xl font-bold mb-4 text-gray-800">إضافة ترفيع / علاوة / عقوبة</h3>
//             <div className="mb-4">
//                 <LabeledInput
//                     label="نوع الإجراء"
//                     name="type"
//                     type="select"
//                     value={formData.type}
//                     onChange={handleChange}
//                     options={[
//                         { value: "ترقية", label: "ترقية" },
//                         { value: "علاوة", label: "علاوة" },
//                         { value: "عقوبة", label: "عقوبة" },
//                     ]}
//                     className="col-span-2"
//                 />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//                 {formFields[formData.type]?.map((field, index) => (
//                     <LabeledInput
//                         key={index}
//                         label={field.label}
//                         name={field.name}
//                         type={field.type}
//                         value={formData[field.name] ?? ""}
//                         onChange={handleChange}
//                         readOnly={field.readOnly}
//                         options={field.options}
//                     />
//                 ))}
//             </div>
//             <div className="flex justify-end mt-6 space-x-2 rtl:space-x-reverse">
//                 <button
//                     type="button"
//                     onClick={handleAdd}
//                     className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
//                 >
//                     حفظ
//                 </button>
//                 <button
//                     type="button"
//                     onClick={onClose}
//                     className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
//                 >
//                     إلغاء
//                 </button>
//             </div>
//         </div>
//     );
// };

// // =================================================================
// // 🔹 EditEmployee Component (المكون الرئيسي المُعدَّل)
// // =================================================================

// // 💡 تم تغيير اسم المكون ليكون EditEmployee كما طلبت
// export default function EditEmployee({ selectedEmployee }) { 
//     const navigate = useNavigate();
//     // 💡 تم إضافة منطق التحقق من دور المستخدم للسماح له بكتابة بياناته
//     const [userRole] = useState("superadmin"); // لتبسيط الكود، نعتبره superadmin حاليًا
//     const [isSaving, setIsSaving] = useState(false);
    
//     // حالات النماذج المنبثقة والجداول الإضافية
//     const [showServiceForm, setShowServiceForm] = useState(false);
//     const [showPromotionForm, setShowPromotionForm] = useState(false);
//     const [services, setServices] = useState([]); // قائمة الخدمات السابقة
//     const [promotions, setPromotions] = useState([]); // قائمة الترفيعات/العلاوات/العقوبات

//     const initialFormData = {
//         employeeId: "", // سيكون موجودًا فقط في وضع التعديل
//         firstName: "", secondName: "", thirdName: "", fourthName: "", lastName: "",
//         mothersName: "", email: "", phonenumber: "", gender: "", birthDate: "",
//         maritalStatus: "", husbandsName: "", educationLevel: "", specialization: "",
//         collegeName: "", certificates: "", appointmentOrderNumber: "", appointmentOrderDate: "",
//         startWorkDate: "", resignationOrRetirementDate: "", reAppointmentDate: "", employeeNumber: "",
//         jobTitle: "", grade: null, step: null, position: "", branchID: null, departmentID: null,
//         unitID: null, assignmentLocation: "", serviceStatus: "", bankName: "", accountNumber: "",
//         idIssuer: "", unifiedIDIssuer: "", idIssuerDate: "", familyNumber: "", rationCardNumber: "",
//         residenceCardNumber: "", residenceCardDate: "", informationOffice: "", region: "",
//         mahalla: "", alley: "", houseNumber: "", street: "", building: "", apartment: "",
//         baseSalary: null, birthProvince: "", nationalId: "",
        
//         // 💡 إضافة حقول جديدة مطلوبة للمزامنة مع PromotionAndSalaryForm
//         currentGrade: null, 
//         currentStep: null,
//         currentBaseSalary: null,
        
//         // 💡 افتراضات للحقول الجديدة في كودك الأصلي
//         serviceStatus: "Active", // يجب أن يكون له قيمة ابتدائية
//         unifiedIDIssuer: "",
//         assignmentLocation: "",
//     };

//     const [formData, setFormData] = useState(initialFormData);
//     const [gradeSteps, setGradeSteps] = useState([]);
//     const [departments, setDepartments] = useState([]);
//     const [units, setUnits] = useState([]);
//     const [branches, setBranches] = useState([]);


//     // 💡 جلب البيانات المرجعية
//     useEffect(() => {
//         // جلب الدرجات والمراحل
//         fetch(`${url}/api/GradeAndStep?PageSize=1000`)
//             .then((res) => res.json())
//             .then((data) => setGradeSteps(data.items || []))
//             .catch((err) => console.error("خطأ في جلب الدرجات:", err));

//         // جلب الأقسام
//         fetch(`${url}/api/Departments?PageSize=1000`)
//             .then((res) => res.json())
//             .then((data) => {
//                 const depts = data.items || [];
//                 setDepartments(depts.map((d) => ({ value: d.departmentID, label: d.name })));
//             });

//         // جلب الشعب
//         fetch(`${url}/api/Unit?PageSize=1000`)
//             .then((res) => res.json())
//             .then((data) => {
//                 const unitsData = data.items || [];
//                 setUnits(unitsData.map((u) => ({ value: u.unitID, label: u.name })));
//             });

//         // جلب الفروع
//         fetch(`${url}/api/Branch`)
//             .then((res) => {
//                 if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//                 return res.json();
//             })
//             .then((data) => {
//                 const branchesData = data.items || [];
//                 setBranches(
//                     branchesData.map((b) => ({
//                         value: b.branchID,
//                         label: b.name,
//                     }))
//                 );
//             })
//             .catch((err) => console.error("خطأ في جلب الفروع:", err));
//     }, []);

//     // 💡 منطق تحميل بيانات الموظف (سواء من prop أو localStorage)
//     useEffect(() => {
//         let loadedEmployeeData = null;

//         // 1. التحقق من الخاصية (prop) - الأولوية القصوى
//         if (selectedEmployee && selectedEmployee.employeeId) {
//             loadedEmployeeData = selectedEmployee;
//             console.log("✔️ Loading data from selectedEmployee prop.");
//         } 
//         // 2. التحقق من localStorage (للحالات القديمة أو الفردية)
//         else {
//             const storedData = localStorage.getItem("employeeData");
//             if (storedData) {
//                 try {
//                     loadedEmployeeData = JSON.parse(storedData);
//                     // مسحها بعد الاستخدام لعدم تداخلها في المرة القادمة
//                     // localStorage.removeItem("employeeData"); 
//                     console.log("✔️ Loading data from localStorage.");
//                 } catch (e) {
//                     console.error("Failed to parse stored employee data:", e);
//                 }
//             }
//         }

//         if (loadedEmployeeData) {
//             // تهيئة حالة الفورم بالبيانات المحملة
//             const loadedData = { ...initialFormData, ...loadedEmployeeData };
            
//             // تحديث الحقول الخاصة بالجداول الإضافية
//             setServices(loadedEmployeeData.services || []);
//             setPromotions(loadedEmployeeData.promotions || []);

//             // التأكد من أن الأرقام هي أرقام وليس سلاسل نصية
//             loadedData.grade = loadedData.grade ? Number(loadedData.grade) : null;
//             loadedData.step = loadedData.step ? Number(loadedData.step) : null;
//             loadedData.branchID = loadedData.branchID ? Number(loadedData.branchID) : null;
//             loadedData.departmentID = loadedData.departmentID ? Number(loadedData.departmentID) : null;
//             loadedData.unitID = loadedData.unitID ? Number(loadedData.unitID) : null;
//             loadedData.baseSalary = loadedData.baseSalary ? Number(loadedData.baseSalary) : null;

//             // تحديث حالة الفورم
//             setFormData(prev => ({
//                 ...prev,
//                 ...loadedData,
//                 currentGrade: loadedData.grade,
//                 currentStep: loadedData.step,
//                 currentBaseSalary: loadedData.baseSalary,
//             }));
//         } else {
//              // إفراغ الفورم إذا لم تكن هناك بيانات محملة
//              setFormData(initialFormData);
//              setServices([]);
//              setPromotions([]);
//              console.log("🔄 Starting with fresh form data.");
//         }
//     }, [selectedEmployee]); // 💡 يعتمد على الموظف المُختار

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         let finalValue = value;

//         if (name === "grade" || name === "step") {
//             finalValue = value === "" ? null : Number(value);
//         } else if (["branchID", "departmentID", "unitID"].includes(name)) {
//             finalValue = value === "" ? null : Number(value);
//         }

//         let newFormData = { ...formData, [name]: finalValue };

//         // منطق احتساب الراتب الأساسي
//         if (name === "grade") {
//             newFormData = { ...newFormData, step: null, baseSalary: null };
//         } else if (name === "step") {
//             const match = gradeSteps.find(
//                 (g) => g.grade === newFormData.grade && g.step === finalValue
//             );
//             newFormData.baseSalary = match ? match.baseSalary : null;
//         }

//         setFormData(newFormData);
//     };

//     const handleAddService = (serviceData) => {
//         setServices((prev) => [...prev, serviceData]);
//     };

//     const handleRemoveService = (index) => {
//         setServices((prev) => prev.filter((_, i) => i !== index));
//     };

//     const handleAddPromotion = (promotionData) => {
//         setPromotions((prev) => [...prev, promotionData]);
        
//         // تحديث الدرجة والمرحلة والراتب الأساسي في النموذج الرئيسي بعد الترقية/العلاوة
//         if (promotionData.type === 'ترقية' && promotionData.newGrade && promotionData.newStep) {
//             setFormData(prev => ({
//                 ...prev,
//                 grade: Number(promotionData.newGrade),
//                 step: Number(promotionData.newStep),
//                 baseSalary: Number(promotionData.newSalary),
//                 currentGrade: Number(promotionData.newGrade),
//                 currentStep: Number(promotionData.newStep),
//                 currentBaseSalary: Number(promotionData.newSalary),
//             }));
//         }
//     };

//     const handleRemovePromotion = (index) => {
//         setPromotions((prev) => prev.filter((_, i) => i !== index));
//     };


//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsSaving(true);

//         if (!formData.branchID) {
//             alert("الرجاء اختيار الفرع.");
//             setIsSaving(false);
//             return;
//         }

//         try {
//             const finalData = {};
//             // تنسيق البيانات لتناسب متطلبات الـ API
//             for (const [key, value] of Object.entries(formData)) {
//                  // استبعاد الحقول الداخلية غير المرغوبة في API (مثل currentGrade)
//                  if (['currentGrade', 'currentStep', 'currentBaseSalary'].includes(key)) continue;

//                  if (key.toLowerCase().includes("date") && value) {
//                     // تحويل التاريخ إلى صيغة ISO أو تركه سلسلة
//                     finalData[key] = value;
//                 } else if (["grade", "step", "branchID", "departmentID", "unitID"].includes(key)) {
//                     // تحويل المعرفات والأرقام الصغيرة إلى Number أو null
//                     finalData[key] = value === "" || value == null ? null : Number(value);
//                 } else if (key === "baseSalary") {
//                     // تحويل الراتب الأساسي إلى Number أو null
//                     finalData[key] = value === "" || value == null ? null : Number(value);
//                 } else {
//                     // التعامل مع الحقول النصية (تحويل السلسلة الفارغة إلى null)
//                     finalData[key] = value === "" || value == null ? null : value;
//                 }
//             }

//             // 💡 إضافة مصفوفات الخدمات والترفيعات إلى الـ Payload
//             finalData.services = services.map(s => ({
//                 ...s,
//                 day: Number(s.day),
//                 month: Number(s.month),
//                 year: Number(s.year),
//                 startDate: s.startDate,
//                 endDate: s.endDate,
//             }));
//             finalData.promotions = promotions; // يجب أن تكون البيانات جاهزة من النموذج الفرعي

//             // تحديد ما إذا كانت عملية إضافة (POST) أو تعديل (PUT)
//             const isEditMode = !!formData.employeeId;
//             const apiEndpoint = isEditMode
//                 ? `${url}/api/Employee/${formData.employeeId}` // 💡 تأكد من أن الـ API يدعم PUT/PATCH بهذا المسار
//                 : `${url}/api/Employee`;
//             const method = isEditMode ? "PUT" : "POST";

//             console.log(`📤 Payload to API (${method}):`, finalData);

//             const res = await fetch(apiEndpoint, {
//                 method: method,
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(finalData),
//             });

//             if (!res.ok) {
//                 let err;
//                 try {
//                     err = await res.json();
//                 } catch {
//                     err = { message: "حدث خطأ في الخادم ولم نستطع قراءة الاستجابة." };
//                 }
//                 console.error("❌ API Error Response:", err);
//                 const errorMsg = JSON.stringify(err, null, 2);
//                 alert(`فشل ${isEditMode ? "التعديل" : "الحفظ"}!\n\n${errorMsg}`);
//             } else {
//                 alert(`تم ${isEditMode ? "التعديل" : "الحفظ"} بنجاح!`);
//                 // إذا كنا في وضع التعديل ضمن التبويبات، لا ننتقل
//                 if (!isEditMode) {
//                     navigate("/salary"); // أو أي مسار آخر
//                 }
//             }
//         } catch (error) {
//             console.error("🌐 Network Error:", error);
//             alert("فشل الاتصال بالخادم!");
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     const uniqueGrades = [...new Set(gradeSteps.map((g) => g.grade))].map((grade) => ({
//         value: grade,
//         label: grade,
//     }));

//     // تقسيم الحقول إلى مجموعات للتحكم بالصلاحيات
//     const sections = [
//         {
//             title: "البيانات الشخصية والعنوان الوطني",
//             responsibleParty: "شعبة أنظمة المعلومات والإحصاء",
//             fields: [
//                 { label: "الاسم الاول", name: "firstName" },
//                 { label: "اسم الاب", name: "secondName" },
//                 { label: "اسم الجد", name: "thirdName" },
//                 { label: "الاسم الرابع", name: "fourthName" },
//                 { label: "اللقب", name: "lastName" },
//                 { label: "اسم الام الكامل", name: "mothersName" },
//                 { label: "رقم الهاتف", name: "phonenumber" },
//                 { label: "تاريخ التولد", name: "birthDate", type: "date" },
//                 { label: "محافظة الولادة", name: "birthProvince" },
//                 { label: "الجنس", name: "gender", type: "select", options: [{ value: "Male", label: "ذكر" }, { value: "Female", label: "أنثى" }] },
//                 { label: "الحالة الاجتماعية", name: "maritalStatus", type: "select", options: [{ value: "Single", label: "أعزب" }, { value: "Married", label: "متزوج" }, { value: "Divorced", label: "مطلق" }, { value: "Widowed", label: "أرمل" }] },
//                 { label: "اسم الزوج / الزوجة", name: "husbandsName" },
//                 { label: "رقم البطاقة التموينية", name: "rationCardNumber" },
//                 { label: "رقم البطاقة الوطنية", name: "nationalId" },
//                 { label: "تاريخ اصدار البطاقة الموحدة", name: "idIssuerDate", type: "date" },
//                 { label: "جهة الاصدار للبطاقة الموحدة", name: "idIssuer" },
//                 { label: "رقم العائلة", name: "familyNumber" },
//                 { label: "رقم بطاقة السكن", name: "residenceCardNumber" },
//                 { label: "تاريخ بطاقة السكن", name: "residenceCardDate", type: "date" },
//                 { label: "مكتب معلومات", name: "informationOffice" },
//                 { label: "المنطقة", name: "region" },
//                 { label: "محلة", name: "mahalla" },
//                 { label: "زقاق", name: "alley" },
//                 { label: "دار", name: "houseNumber" },
//                 { label: "شارع", name: "street" },
//                 { label: "عمارة", name: "building" },
//                 { label: "شقة", name: "apartment" },
//                 { label: "الايميل", name: "email" },
//                 { label: "اسم المصرف", name: "bankName" },
//                 { label: "رقم الحساب المصرفي", name: "accountNumber" },
//                 { label: "جهة إصدار الهوية الموحدة", name: "unifiedIDIssuer" },
//             ],
//         },
//         {
//             title: "مكان العمل",
//             responsibleParty: "شعبة شؤون الموظفين",
//             fields: [
//                 {
//                     label: "الفرع",
//                     name: "branchID",
//                     type: "select",
//                     options: branches,
//                 },
//                 {
//                     label: "القسم",
//                     name: "departmentID",
//                     type: "search-select",
//                     options: departments,
//                 },
//                 {
//                     label: "الشعبة",
//                     name: "unitID",
//                     type: "search-select",
//                     options: units,
//                 },
//             ],
//         },
//         {
//             title: "تفاصيل التعيين والخدمة",
//             responsibleParty: "شعبة أنظمة المعلومات والإحصاء",
//             fields: [
//                 { label: "رقم الموظف", name: "employeeNumber" },
//                 { label: "العنوان الوظيفي", name: "jobTitle" },
//                 {
//                     label: "الدرجة الوظيفية",
//                     name: "grade",
//                     type: "select",
//                     options: uniqueGrades,
//                 },
//                 {
//                     label: "المرحلة",
//                     name: "step",
//                     type: "select",
//                     options: [
//                         { value: "", label: "اختر…" },
//                         ...gradeSteps
//                             .filter((g) => g.grade === formData.grade)
//                             .map((g) => ({ value: g.step, label: g.step })),
//                     ],
//                 },
//                 { label: "الراتب الأساسي", name: "baseSalary", readOnly: true, type: "number" },
//                 { label: "المنصب", name: "position" },
//                 { label: "رقم أمر التعيين", name: "appointmentOrderNumber" },
//                 { label: "تاريخ أمر التعيين", name: "appointmentOrderDate", type: "date" },
//                 { label: "تاريخ المباشرة", name: "startWorkDate", type: "date" },
//                 { label: "مكان التعيين", name: "assignmentLocation" },
//                 { label: "الحالة الدراسية", name: "educationLevel" },
//                 { label: "التخصص الدقيق", name: "specialization" },
//                 { label: "اسم المعهد / الكلية", name: "collegeName" },
//                 { label: "الشهادات الحاصل", name: "certificates" },
//                 {
//                     label: "حالة الخدمة",
//                     name: "serviceStatus",
//                     type: "select",
//                     options: [
//                         { value: "Active", label: "نشط" },
//                         { value: "Resigned", label: "مستقيل" },
//                         { value: "Retired", label: "متقاعد" },
//                         { value: "Terminated", label: "منهي" },
//                         { value: "Leave", label: "في إجازة" },
//                     ],
//                 },
//                 { label: "تاريخ الاستقالة / التقاعد", name: "resignationOrRetirementDate", type: "date" },
//                 { label: "تاريخ إعادة التعيين", name: "reAppointmentDate", type: "date" },
//             ],
//         },
//         // 💡 إضافة قسم للخدمات الإضافية
//         {
//             title: "الخدمات السابقة",
//             responsibleParty: "شعبة شؤون الموظفين",
//             fields: [
//                 { label: "إدارة الخدمات السابقة", name: "servicesManagement", type: "custom" },
//             ],
//         },
//         // 💡 إضافة قسم للترفيعات/العلاوات/العقوبات
//         {
//             title: "تاريخ الترفيعات والعلاوات والعقوبات",
//             responsibleParty: "شعبة شؤون الموظفين",
//             fields: [
//                 { label: "إدارة الترفيعات والإجراءات", name: "promotionsManagement", type: "custom" },
//             ],
//         },
//     ];

//     const adminSections = sections.filter(
//         (section) => section.responsibleParty === "شعبة أنظمة المعلومات والإحصاء"
//     );
//     const otherSections = sections.filter(
//         (section) => section.responsibleParty !== "شعبة أنظمة المعلومات والإحصاء"
//     );

//     const isEditMode = !!formData.employeeId;

//     return (
//         <form onSubmit={handleSubmit} className="p-6 space-y-4" dir="rtl">
//             <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
//                 {isEditMode ? `تعديل بيانات الموظف: ${formData.firstName} ${formData.lastName}` : "إضافة موظف جديد"}
//             </h1>
            
//             {/* ----------------------------------------------------- */}
//             {/* 1. بيانات شعبة أنظمة المعلومات والإحصاء (Super Admin) */}
//             {/* ----------------------------------------------------- */}
//             {(userRole === "superadmin" || userRole === "شعبة انظمة المعلومات والاحصاء") && (
//                 <Disclosure defaultOpen={true}>
//                     {({ open }) => (
//                         <div className="border border-blue-300 rounded-lg shadow-md">
//                             <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-base font-semibold text-right bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none">
//                                 <div className="flex flex-col text-blue-800">
//                                     <span>بيانات شعبة أنظمة المعلومات والإحصاء</span>
//                                     <span className="text-xs text-gray-600 font-normal mt-1">
//                                         الحقول التي تديرها شعبة أنظمة المعلومات والإحصاء
//                                     </span>
//                                 </div>
//                                 <ChevronUpIcon
//                                     className={`${open ? "rotate-180 transform" : ""} w-6 h-6 text-blue-500`}
//                                 />
//                             </Disclosure.Button>
//                             <Disclosure.Panel className="p-4 bg-white space-y-4">
//                                 {adminSections.map((subSection, subIdx) => (
//                                     <Disclosure key={subIdx} defaultOpen={true}>
//                                         {({ open: subOpen }) => (
//                                             <div className="border border-gray-200 rounded-lg">
//                                                 <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-right bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none">
//                                                     <span className="font-bold text-gray-700">{subSection.title}</span>
//                                                     <ChevronUpIcon
//                                                         className={`${subOpen ? "rotate-180 transform" : ""} w-5 h-5 text-gray-500`}
//                                                     />
//                                                 </Disclosure.Button>
//                                                 <Disclosure.Panel className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
//                                                     {subSection.fields.map((field, fidx) => (
//                                                         <LabeledInput
//                                                             key={fidx}
//                                                             label={field.label}
//                                                             name={field.name}
//                                                             type={field.type || "text"}
//                                                             value={formData[field.name] ?? ""}
//                                                             onChange={handleChange}
//                                                             readOnly={userRole !== "superadmin"}
//                                                             options={field.options || []}
//                                                             className="col-span-1"
//                                                         />
//                                                     ))}
//                                                 </Disclosure.Panel>
//                                             </div>
//                                         )}
//                                     </Disclosure>
//                                 ))}
//                             </Disclosure.Panel>
//                         </div>
//                     )}
//                 </Disclosure>
//             )}

//             {/* ----------------------------------------------------- */}
//             {/* 2. بيانات شعبة شؤون الموظفين (Other Sections) */}
//             {/* ----------------------------------------------------- */}
//             {userRole === "superadmin" && (
//                 <>
//                     {otherSections.map((section, secIdx) => (
//                         <Disclosure key={secIdx} defaultOpen={false}>
//                             {({ open }) => (
//                                 <div className="border border-green-300 rounded-lg shadow-md">
//                                     <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-base font-semibold text-right bg-green-100 rounded-lg hover:bg-green-200 focus:outline-none">
//                                         <div className="flex flex-col text-green-800">
//                                             <span>{section.title}</span>
//                                             <span className="text-xs text-gray-600 font-normal mt-1">
//                                                 {section.responsibleParty}
//                                             </span>
//                                         </div>
//                                         <ChevronUpIcon
//                                             className={`${open ? "rotate-180 transform" : ""} w-6 h-6 text-green-500`}
//                                         />
//                                     </Disclosure.Button>
//                                     <Disclosure.Panel className="p-4 bg-white">
//                                         {/* إذا لم تكن إدارة مخصصة، استخدم الشبكة العادية */}
//                                         {section.fields.some(f => f.type !== 'custom') && (
//                                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                                                 {section.fields.filter(f => f.type !== 'custom').map((field, fidx) => (
//                                                     <LabeledInput
//                                                         key={fidx}
//                                                         label={field.label}
//                                                         name={field.name}
//                                                         type={field.type || "text"}
//                                                         value={formData[field.name] ?? ""}
//                                                         onChange={handleChange}
//                                                         readOnly={userRole !== "superadmin"}
//                                                         options={field.options || []}
//                                                         className="col-span-1"
//                                                     />
//                                                 ))}
//                                             </div>
//                                         )}

//                                         {/* إدارة الخدمات السابقة */}
//                                         {section.title === "الخدمات السابقة" && (
//                                             <div className="space-y-4">
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => setShowServiceForm(true)}
//                                                     className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
//                                                 >
//                                                     <PlusIcon className="h-4 w-4 ml-2" />
//                                                     إضافة خدمة سابقة
//                                                 </button>
//                                                 {services.length > 0 && (
//                                                     <div className="mt-4 overflow-x-auto">
//                                                         <table className="min-w-full bg-white border border-gray-200">
//                                                             <thead className="bg-gray-50">
//                                                                 <tr>
//                                                                     <th className="py-2 px-4 border-b text-right text-sm font-semibold text-gray-600">نوع الخدمة</th>
//                                                                     <th className="py-2 px-4 border-b text-right text-sm font-semibold text-gray-600">المدة</th>
//                                                                     <th className="py-2 px-4 border-b text-center text-sm font-semibold text-gray-600">الإجراء</th>
//                                                                 </tr>
//                                                             </thead>
//                                                             <tbody>
//                                                                 {services.map((s, index) => (
//                                                                     <tr key={index} className="border-b hover:bg-gray-50">
//                                                                         <td className="py-2 px-4 text-sm">{s.serviceType}</td>
//                                                                         <td className="py-2 px-4 text-sm">
//                                                                             {`${s.year} سنة و ${s.month} شهر و ${s.day} يوم`}
//                                                                         </td>
//                                                                         <td className="py-2 px-4 text-center">
//                                                                             <button
//                                                                                 type="button"
//                                                                                 onClick={() => handleRemoveService(index)}
//                                                                                 className="text-red-500 hover:text-red-700"
//                                                                             >
//                                                                                 <TrashIcon className="h-5 w-5" />
//                                                                             </button>
//                                                                         </td>
//                                                                     </tr>
//                                                                 ))}
//                                                             </tbody>
//                                                         </table>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         )}
                                        
//                                         {/* إدارة الترفيعات والعلاوات والعقوبات */}
//                                         {section.title === "تاريخ الترفيعات والعلاوات والعقوبات" && (
//                                             <div className="space-y-4">
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => setShowPromotionForm(true)}
//                                                     className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
//                                                 >
//                                                     <PlusIcon className="h-4 w-4 ml-2" />
//                                                     إضافة ترقية / علاوة / عقوبة
//                                                 </button>
//                                                 {promotions.length > 0 && (
//                                                     <div className="mt-4 overflow-x-auto">
//                                                         <table className="min-w-full bg-white border border-gray-200">
//                                                             <thead className="bg-gray-50">
//                                                                 <tr>
//                                                                     <th className="py-2 px-4 border-b text-right text-sm font-semibold text-gray-600">النوع</th>
//                                                                     <th className="py-2 px-4 border-b text-right text-sm font-semibold text-gray-600">التفاصيل</th>
//                                                                     <th className="py-2 px-4 border-b text-right text-sm font-semibold text-gray-600">الرقم والتاريخ</th>
//                                                                     <th className="py-2 px-4 border-b text-center text-sm font-semibold text-gray-600">الإجراء</th>
//                                                                 </tr>
//                                                             </thead>
//                                                             <tbody>
//                                                                 {promotions.map((p, index) => (
//                                                                     <tr key={index} className="border-b hover:bg-gray-50">
//                                                                         <td className="py-2 px-4 text-sm font-bold text-blue-600">{p.type}</td>
//                                                                         <td className="py-2 px-4 text-sm">
//                                                                             {p.type === 'ترقية' ? `من درجة ${p.previousGrade}/${p.previousStep} إلى ${p.newGrade}/${p.newStep}` :
//                                                                              p.type === 'علاوة' ? `أمر علاوة رقم ${p.allowanceOrderNumber}` :
//                                                                              `عقوبة من نوع ${p.penaltyType}`}
//                                                                         </td>
//                                                                         <td className="py-2 px-4 text-sm">
//                                                                             {p.promotionOrderNumber || p.allowanceOrderNumber || p.penaltyOrderNumber} بتاريخ {p.promotionOrderDate || p.allowanceOrderDate || p.penaltyDate}
//                                                                         </td>
//                                                                         <td className="py-2 px-4 text-center">
//                                                                             <button
//                                                                                 type="button"
//                                                                                 onClick={() => handleRemovePromotion(index)}
//                                                                                 className="text-red-500 hover:text-red-700"
//                                                                             >
//                                                                                 <TrashIcon className="h-5 w-5" />
//                                                                             </button>
//                                                                         </td>
//                                                                     </tr>
//                                                                 ))}
//                                                             </tbody>
//                                                         </table>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         )}

//                                     </Disclosure.Panel>
//                                 </div>
//                             )}
//                         </Disclosure>
//                     ))}
//                 </>
//             )}

//             {/* زر الحفظ */}
//             <div className="flex justify-end mt-8 border-t pt-4">
//                 <button
//                     type="submit"
//                     className="bg-green-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
//                     disabled={isSaving}
//                 >
//                     {isSaving ? "جاري الحفظ..." : isEditMode ? "تعديل وحفظ بيانات الموظف" : "حفظ بيانات الموظف"}
//                 </button>
//             </div>

//             {/* Modal for Service Form */}
//             <ModalWrapper isOpen={showServiceForm} onClose={() => setShowServiceForm(false)}>
//                 <ServiceForm
//                     onAdd={handleAddService}
//                     onClose={() => setShowServiceForm(false)}
//                 />
//             </ModalWrapper>

//             {/* Modal for Promotion Form */}
//             <ModalWrapper isOpen={showPromotionForm} onClose={() => setShowPromotionForm(false)}>
//                 <PromotionAndSalaryForm
//                     onAdd={handleAddPromotion}
//                     onClose={() => setShowPromotionForm(false)}
//                     gradeSteps={gradeSteps}
//                     currentGrade={formData.currentGrade}
//                     currentStep={formData.currentStep}
//                     currentSalary={formData.currentBaseSalary}
//                 />
//             </ModalWrapper>
//         </form>
//     );
// }

// // =================================================================
// // 🔹 Modal Wrapper Component
// // =================================================================
// function ModalWrapper({ isOpen, onClose, children }) {
//     return (
//         <Transition appear show={isOpen} as={Fragment}>
//             <Dialog as="div" className="relative z-50" onClose={onClose}>
//                 <Transition.Child
//                     as={Fragment}
//                     enter="ease-out duration-300"
//                     enterFrom="opacity-0"
//                     enterTo="opacity-100"
//                     leave="ease-in duration-200"
//                     leaveFrom="opacity-100"
//                     leaveTo="opacity-0"
//                 >
//                     <div className="fixed inset-0 bg-black bg-opacity-40" />
//                 </Transition.Child>

//                 <div className="fixed inset-0 overflow-y-auto">
//                     <div className="flex min-h-full items-center justify-center p-4 text-center">
//                         <Transition.Child
//                             as={Fragment}
//                             enter="ease-out duration-300"
//                             enterFrom="opacity-0 scale-95"
//                             enterTo="opacity-100 scale-100"
//                             leave="ease-in duration-200"
//                             leaveFrom="opacity-100 scale-100"
//                             leaveTo="opacity-0 scale-95"
//                         >
//                             <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-right align-middle shadow-xl transition-all">
//                                 {children}
//                             </Dialog.Panel>
//                         </Transition.Child>
//                     </div>
//                 </div>
//             </Dialog>
//         </Transition>
//     );
// }