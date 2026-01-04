import React, { useState, useEffect, Fragment } from "react";
import { Disclosure, Dialog, Transition } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import Select from "react-select";

import CourseForm from "../components/CourseForm";


const LabeledInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  readOnly,
  options,
  className,
}) => {
  // -------------------- Select Field (HTML Native) --------------------
  if (type === "select") {
    return (
      <div className={`flex flex-col ${className}`}>
        <label className="text-sm font-semibold mb-1 text-gray-700">{label}</label>
        <select
          name={name}
          // التأكد من تحويل القيمة إلى سلسلة نصية لتعمل مقارنة الـ HTML SELECT
          value={value === null || value === undefined ? "" : String(value)}
          onChange={onChange}
          disabled={readOnly}
          className={`border border-gray-300 rounded p-2 text-sm ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
        >
          <option value="">اختر...</option>
          {options &&
            options.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
      </div>
    );
  }

  // -------------------- Search-Select Field (React-Select) --------------------
  if (type === "search-select") {
    return (
      <div className={`flex flex-col ${className}`}>
        <label className="text-sm font-semibold mb-1 text-gray-700">{label}</label>
        <Select
          name={name}
          // القيمة هي الكائن {value: ID, label: Name}
          value={value}
          onChange={onChange}
          options={options}
          isDisabled={readOnly}
          placeholder="ابحث واختر..."
          classNamePrefix="react-select"
          isClearable={true}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-semibold mb-1 text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        readOnly={readOnly}
        className={`border border-gray-300 rounded p-2 text-sm ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
      />
    </div>
  );
};

// ------------------------------------------------------------------
// نهاية المكون LabeledInput
// ------------------------------------------------------------------

const parseFullName = (fullName) => {
  if (!fullName) return {};
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "", secondName: parts[1] || "", thirdName: parts[2] || "",
    fourthName: parts[3] || "", lastName: parts.slice(4).join(" ") || "",
  };
};

const INITIAL_FORM_DATA = {
  // بيانات الموظف الأساسية
  firstName: "", secondName: "", thirdName: "", fourthName: "", lastName: "",
  mothersName: "", email: "", phonenumber: "",
  gender: null, // رقم
  birthDate: "",
  maritalStatus: null, // رقم
  husbandsName: null,
  educationLevel: null, // رقم
  specialization: null, collegeName: null, certificates: null,
  appointmentOrderNumber: "", appointmentOrderDate: "", startWorkDate: "",
  resignationDate: null, retirementDate: null, reAppointmentDate: null,
  employeeNumber: "", jobTitle: "",
  grade: null, // رقم
  step: null, // رقم
  position: null, // رقم
  branchID: null, // رقم
  departmentID: null, // رقم
  unitID: null, // رقم
  bank: null, // رقم
  accountNumber: null, idIssuer: null, unifiedIDIssuer: null, idIssuerDate: "",
  familyNumber: null, rationCardNumber: null, residenceCardNumber: null,
  residenceCardDate: "", informationOffice: null, region: null, mahalla: null,
  alley: null, houseNumber: null, street: null, building: null, apartment: null,
  serviceStatus: null, // رقم
  assignmentLocation: null, isActive: true,
  employeeId_display: "",
};

const NUMERIC_FIELDS = [
  "grade", "step", "branchID", "departmentID", "unitID",
  "gender", "maritalStatus", "educationLevel", "bank", "position",
  "serviceStatus",
];


export default function EditEmployee({ employee = null, onSave, readOnly = false }) {
  const [userRole] = useState("superadmin");
  const isEditing = !!employee;
  // ✅ تم إضافة Transition و Dialog لمكون CourseForm لمعالجة مشكلة Z-Index
  const [showCourseForm, setShowCourseForm] = useState(false); 
  const [_courses, setCourses] = useState([]);

  const BASE_URL = "http://192.168.11.230:1006/api";
  const [gradeSteps, setGradeSteps] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [gender, setGender] = useState([]);
  const [maritalStatus, setMaritalStatus] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const [banks, setBanks] = useState([]);
  const [positions, setPositions] = useState([]);
  const [serviceStatuses, setServiceStatuses] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [baseSalary, setBaseSalary] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const endpoints = [
          { key: "gradeSteps", url: `${BASE_URL}/GradeAndStep?PageSize=1000` },
          { key: "branches", url: `${BASE_URL}/Branch` },
          { key: "gender", url: `${BASE_URL}/Enums/gender` },
          { key: "maritalStatus", url: `${BASE_URL}/Enums/maritalStatus` },
          { key: "educationLevels", url: `${BASE_URL}/Enums/educationlevel` },
          { key: "banks", url: `${BASE_URL}/Enums/bank` },
          { key: "positions", url: `${BASE_URL}/Enums/position` },
          { key: "serviceStatuses", url: `${BASE_URL}/Enums/servicestatus` },
        ];
        const results = await Promise.all(
          endpoints.map(async (ep) => {
            const res = await fetch(ep.url);
            if (!res.ok) throw new Error(`${ep.url} failed: ${res.status}`);
            const data = await res.json();
            return { key: ep.key, data };
          })
        );
        const refs = {};
        results.forEach((r) => {
          switch (r.key) {
            case "gradeSteps":
              refs.gradeSteps = r.data.items || r.data || [];
              break;
            case "branches":
              // ✅ تهيئة خيارات الفرع (BranchID هي رقم)
              refs.branches = (r.data.items || []).map((b) => ({ value: b.branchID, label: b.name }));
              break;
            case "gender":
            case "maritalStatus":
            case "educationLevels":
            case "banks":
            case "positions":
            case "serviceStatuses":
              refs[r.key] = (r.data || []).map((it) => ({ value: it.id, label: it.name }));
              break;
            default:
              break;
          }
        });
        setGradeSteps(refs.gradeSteps || []);
        setBranches(refs.branches || []);
        setGender(refs.gender || []);
        setMaritalStatus(refs.maritalStatus || []);
        setEducationLevels(refs.educationLevels || []);
        setBanks(refs.banks || []);
        setPositions(refs.positions || []);
        setServiceStatuses(refs.serviceStatuses || []);
      } catch (err) {
        console.error("خطأ في جلب المرجعيات:", err);
        setError("فشل في جلب بعض البيانات المرجعية الأساسية.");
      } finally {
        setDataLoaded(true);
      }
    };
    fetchReferences();
  }, [BASE_URL]);

  useEffect(() => {
    // 🔑 جلب الأقسام بناءً على الفرع المحدد
    const branchId = formData.branchID;
    if (!branchId) {
      setDepartments([]);
      setUnits([]);
      return; // لا نحتاج لمسح departmentID/unitID هنا، يتم المسح في handleSelectChange عند تغيير الفرع
    }
    const fetchDepartmentsByBranch = async () => {
      try {
        const res = await fetch(`${BASE_URL}/Departments/by-branch/${branchId}`);
        if (!res.ok) throw new Error("Failed to load departments");
        const data = await res.json();
        const mapped = (data.items || data || []).map((d) => ({ value: d.departmentID, label: d.name }));
        setDepartments(mapped);
        
        // مسح القسم والشعبة إذا كانا غير متواجدين في القائمة الجديدة (في حالة التعديل)
        if (isEditing && formData.departmentID && !mapped.find(d => d.value === formData.departmentID)) {
             setFormData((prev) => ({ ...prev, departmentID: null, unitID: null }));
        }

      } catch (err) {
        console.error("خطأ في جلب الأقسام للفرع:", err);
        setDepartments([]);
        setFormData((prev) => ({ ...prev, departmentID: null, unitID: null }));
      }
    };
    fetchDepartmentsByBranch();
  }, [formData.branchID, BASE_URL, isEditing, formData.departmentID]);

  useEffect(() => {
    // 🔑 جلب الشعب بناءً على القسم المحدد
    const departmentId = formData.departmentID;
    if (!departmentId) {
      setUnits([]);
      return; // لا نحتاج لمسح unitID هنا، يتم المسح في handleSelectChange عند تغيير القسم
    }
    const fetchUnitsByDepartment = async () => {
      try {
        const res = await fetch(`${BASE_URL}/Unit/by-department/${departmentId}`);
        if (!res.ok) throw new Error("Failed to load units");
        const data = await res.json();
        const mapped = (data.items || data || []).map((u) => ({ value: u.unitID, label: u.name }));
        setUnits(mapped);

        // مسح الشعبة إذا كانت غير متواجدة في القائمة الجديدة (في حالة التعديل)
        if (isEditing && formData.unitID && !mapped.find((u) => u.value === formData.unitID)) {
          setFormData((prev) => ({ ...prev, unitID: null }));
        }
      } catch (err) {
        console.error("خطأ في جلب الوحدات للقسم:", err);
        setUnits([]);
        setFormData((prev) => ({ ...prev, unitID: null }));
      }
    };
    fetchUnitsByDepartment();
  }, [formData.departmentID, BASE_URL, isEditing, formData.unitID]);

  const getID = (list, displayName, targetValue) => {
    if (!list || (!displayName && !targetValue)) return null;
    if (targetValue !== undefined && targetValue !== null) {
      const foundByValue = list.find((it) => it.value === targetValue);
      if (foundByValue) return targetValue;
    }
    const item = list.find((it) => String(it.label) === String(displayName));
    return item ? item.value : null;
  };

  useEffect(() => {
    // 🔑 تعبئة البيانات عند التعديل
    if (!dataLoaded || !isEditing || !employee) return;
    const fmtDate = (s) => (s ? String(s).split("T")[0] : "");
    const populated = {
      ...INITIAL_FORM_DATA,
      ...parseFullName(employee.fullName || ""),
      mothersName: employee.mothersName ?? "",
      email: employee.email ?? "",
      phonenumber: employee.phonenumber ?? "",
      gender: getID(gender, employee.genderName, employee.gender),
      birthDate: fmtDate(employee.birthDate),
      maritalStatus: getID(maritalStatus, employee.maritalStatusName, employee.maritalStatus),
      husbandsName: employee.husbandsName ?? null,
      educationLevel: getID(educationLevels, employee.educationLevelName, employee.educationLevel),
      specialization: employee.specialization ?? null,
      collegeName: employee.collegeName ?? null,
      certificates: employee.certificates ?? null,
      appointmentOrderNumber: employee.appointmentOrderNumber ?? "",
      appointmentOrderDate: fmtDate(employee.appointmentOrderDate),
      startWorkDate: fmtDate(employee.startWorkDate),
      resignationDate: employee.resignationDate ? fmtDate(employee.resignationDate) : null,
      retirementDate: employee.retirementDate ? fmtDate(employee.retirementDate) : null,
      reAppointmentDate: fmtDate(employee.reAppointmentDate),
      employeeNumber: employee.employeeNumber ?? "",
      jobTitle: employee.jobTitle ?? "",
      grade: employee.grade ?? null,
      step: employee.step ?? null,
      position: getID(positions, employee.positionName, employee.position),
      // 🔑 تم استخدام ID مباشرة لربط الفرع والقسم والشعبة بشكل صحيح
      branchID: employee.branchID ?? null, 
      departmentID: employee.departmentID ?? null,
      unitID: employee.unitID ?? null,
      bank: getID(banks, employee.bankName, employee.bank),
      accountNumber: employee.accountNumber ?? null,
      idIssuer: employee.idIssuer ?? null,
      unifiedIDIssuer: employee.unifiedIDIssuer ?? null,
      idIssuerDate: fmtDate(employee.idIssuerDate),
      familyNumber: employee.familyNumber ?? null,
      rationCardNumber: employee.rationCardNumber ?? null,
      residenceCardNumber: employee.residenceCardNumber ?? null,
      residenceCardDate: fmtDate(employee.residenceCardDate),
      informationOffice: employee.informationOffice ?? null,
      region: employee.region ?? null,
      mahalla: employee.mahalla ?? null,
      alley: employee.alley ?? null,
      houseNumber: employee.houseNumber ?? null,
      street: employee.street ?? null,
      building: employee.building ?? null,
      apartment: employee.apartment ?? null,
      serviceStatus: getID(serviceStatuses, employee.serviceStatusName, employee.serviceStatus),
      assignmentLocation: employee.assignmentLocation ?? null,
      isActive: employee.isActive ?? true,
      employeeId_display: employee.id || "N/A",
    };
    setFormData(populated);
    // ... (منطق جلب الدورات)

    if (populated.grade && populated.step) {
      const matched = gradeSteps.find(
        (gs) => gs.grade === populated.grade && gs.step === populated.step
      );
      setBaseSalary(matched ? matched.baseSalary : null);
    }
  }, [
    dataLoaded, isEditing, employee, gender, maritalStatus, educationLevels,
    banks, positions, branches, departments, units, gradeSteps, serviceStatuses, BASE_URL
  ]);

  const handleChange = (e) => {
    if (readOnly) return;
    const { name, value, type } = e.target;
    let finalValue = value;

    // 🔑 تحويل القيمة الفارغة إلى null دائماً
    if (value === "" || value === null || value === undefined) {
      finalValue = null;
    }
    // تحويل الحقول الرقمية إلى رقم إذا لم تكن null
    else if (type === "number" || NUMERIC_FIELDS.includes(name)) {
      const numValue = Number(value);
      finalValue = isNaN(numValue) ? null : numValue;
    }

    const newForm = { ...formData, [name]: finalValue };

    // ... (منطق الدرجة والراتب)
    if (name === "grade") {
      newForm.step = null;
      setBaseSalary(null);
    }
    if ((name === "grade" || name === "step") && newForm.grade && newForm.step) {
      const matched = gradeSteps.find(
        (gs) => gs.grade === newForm.grade && gs.step === newForm.step
      );
      setBaseSalary(matched ? matched.baseSalary : null);
    }
    setFormData(newForm);
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    if (readOnly) return;
    const { name } = actionMeta;

    let value = selectedOption ? selectedOption.value : null;

    // تحويل القيمة إلى رقم إذا كانت ضمن الحقول الرقمية
    if (NUMERIC_FIELDS.includes(name) && value !== null) {
      const numValue = Number(value);
      value = isNaN(numValue) ? value : numValue;
    }

    let newForm = { ...formData, [name]: value };

    // 🔑 معالجة تبعية الفرع والقسم والشعبة (BranchID, DepartmentID, UnitID)
    if (name === "branchID") {
      newForm.departmentID = null;
      newForm.unitID = null;
      setDepartments([]); // مسح خيارات القسم
      setUnits([]); // مسح خيارات الشعبة
    }
    if (name === "departmentID") {
      newForm.unitID = null;
      setUnits([]); // مسح خيارات الشعبة
    }

    // ... (منطق الدرجة والراتب)
    if (name === "grade") {
      newForm.step = null;
      setBaseSalary(null);
    }
    if ((name === "grade" || name === "step") && newForm.grade && newForm.step) {
      const matched = gradeSteps.find(
        (gs) => gs.grade === newForm.grade && gs.step === newForm.step
      );
      setBaseSalary(matched ? matched.baseSalary : null);
    }
    setFormData(newForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly || !onSave) return;

    const employeePayload = { ...formData };

    // 🔑 التصحيح الرئيسي: معالجة الـ Payload لضمان عدم إرسال سلاسل نصية فارغة
    const payload = {
      id: employee?.id,
      ...Object.fromEntries(
        Object.entries(employeePayload).map(([key, val]) => [
          // إذا كانت القيمة سلسلة نصية فارغة، اجعلها null
          key,
          (typeof val === "string" && val.trim() === "") ? null : val,
        ])
      ),
    };

    // حذف حقل العرض
    delete payload.employeeId_display;

    onSave(payload);
  };

  const handleAddCourse = (newCourseData) => {
    setCourses((prev) => [
      ...prev,
      {
        id: newCourseData.courseEmployeeId, courseEmployeeId: newCourseData.courseEmployeeId, courseId: newCourseData.courseId,
        employeeId: employee.id, notes: newCourseData.notes || "—", degree: newCourseData.degree || "—",
        isActive: newCourseData.isActive ?? true,
        courseName: newCourseData.courseName || "دورة جديدة",
        dateStart: newCourseData.dateStart || "—", dateEnd: newCourseData.dateEnd || "—",
        teacher: newCourseData.teacher || "—", level: newCourseData.level || "—",
      }
    ]);
    setShowCourseForm(false);
  };

  const _handleDeleteCourse = async (courseEmployeeId) => {
    if (!window.confirm("هل أنت متأكد من إلغاء ربط هذه الدورة؟")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/CourseEmployee/${courseEmployeeId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const errorText = await res.status === 404 ? "الرابط غير موجود." : await res.text();
        console.error("Server error:", errorText);
        throw new Error("فشل إلغاء ربط الدورة");
      }

      setCourses(prev => prev.filter(course => course.courseEmployeeId !== courseEmployeeId));
      alert("تم إلغاء ربط الدورة بنجاح!");
    } catch (err) {
      console.error("خطأ في الحذف:", err);
      alert("فشل في إلغاء ربط الدورة: " + err.message);
    }
  };


  const uniqueGrades = [...new Set(gradeSteps.map((g) => g.grade))].map((grade) => ({
    value: grade, label: String(grade),
  }));
  const filteredSteps = gradeSteps
    .filter((g) => g.grade === formData.grade)
    .map((g) => ({ value: g.step, label: String(g.step) }));

  const getSelectedValue = (optionsList, formValue) => {
    if (formValue === null || formValue === undefined) return null;
    return optionsList.find(option => String(option.value) === String(formValue));
  };


  const sections = [
    {
      title: "البيانات الشخصية",
      responsibleParty: "شعبة أنظمة المعلومات والإحصاء",
      fields: [
         { label: " الموظف (ID)", name: "employeeId_display", type: "text", readOnly: true },
         { label: "الاسم الأول", name: "firstName" },
         { label: "اسم الأب", name: "secondName" },
         { label: "اسم الجد", name: "thirdName" },
         { label: "الاسم الرابع", name: "fourthName" },
         { label: "اللقب", name: "lastName" },
         { label: "اسم الأم", name: "mothersName" },
         { label: "الإيميل", name: "email" },
         { label: "رقم الهاتف", name: "phonenumber" },
         { label: "الجنس", name: "gender", type: "select", options: gender },
         { label: "تاريخ الميلاد", name: "birthDate", type: "date" },
         { label: "الحالة الاجتماعية", name: "maritalStatus", type: "select", options: maritalStatus },
         { label: "اسم الزوج/الزوجة", name: "husbandsName" },
         { label: "حالة الخدمة", name: "serviceStatus", type: "select", options: serviceStatuses },
      ],
    },
    {
      title: "التعليم والشهادات",
      responsibleParty: "شعبة أنظمة المعلومات والإحصاء",
      fields: [
         { label: "المستوى التعليمي", name: "educationLevel", type: "select", options: educationLevels },
         { label: "التخصص", name: "specialization" },
         { label: "اسم الكلية/المعهد", name: "collegeName" },
         { label: "الشهادات", name: "certificates" },
      ],
    },
    {
      title: "مكان العمل والتعيين",
      responsibleParty: "شعبة شؤون الموظفين",
      fields: [
         { label: "رقم أمر التعيين", name: "appointmentOrderNumber" },
         { label: "تاريخ أمر التعيين", name: "appointmentOrderDate", type: "date" },
         { label: "تاريخ المباشرة", name: "startWorkDate", type: "date" },
         { label: "تاريخ الاستقالة", name: "resignationDate", type: "date" },
         { label: "تاريخ التقاعد", name: "retirementDate", type: "date" },
         { label: "تاريخ إعادة التعيين", name: "reAppointmentDate", type: "date" },
         { label: "الرقم الوظيفي", name: "employeeNumber" },
         { label: "العنوان الوظيفي", name: "jobTitle" },
         { label: "الدرجة", name: "grade", type: "select", options: uniqueGrades },
         { label: "المرحلة", name: "step", type: "select", options: filteredSteps },
         { label: "المنصب", name: "position", type: "select", options: positions },
         // 🔑 تم توحيد الفرع ليصبح search-select
         { label: "الفرع", name: "branchID", type: "search-select", options: branches },
         { label: "القسم", name: "departmentID", type: "search-select", options: departments },
         { label: "الشعبة", name: "unitID", type: "search-select", options: units },
      ],
    },
    {
      title: "البيانات المصرفية والهوية",
      responsibleParty: "شعبة أنظمة المعلومات والإحصاء",
      fields: [
         { label: "اسم المصرف", name: "bank", type: "select", options: banks },
         { label: "رقم الحساب", name: "accountNumber" },
         { label: "رقم البطاقة الموحدة", name: "idIssuer" },
         { label: "جهة إصدار البطاقة الموحدة", name: "unifiedIDIssuer" },
         { label: "تاريخ إصدار البطاقة الموحدة", name: "idIssuerDate", type: "date" },
         { label: "الرقم العائلي", name: "familyNumber" },
         { label: "رقم البطاقة التموينية", name: "rationCardNumber" },
         { label: "رقم بطاقة السكن", name: "residenceCardNumber" },
         { label: "تاريخ بطاقة السكن", name: "residenceCardDate", type: "date" },
         { label: "مكتب المعلومات", name: "informationOffice" },
      ],
    },
    {
      title: "العنوان",
      responsibleParty: "شعبة أنظمة المعلومات والإحصاء",
      fields: [
         { label: "المنطقة", name: "region" },
         { label: "المحلة", name: "mahalla" },
         { label: "الزقاق", name: "alley" },
         { label: "الدار", name: "houseNumber" },
         { label: "الشارع", name: "street" },
         { label: "العمارة", name: "building" },
         { label: "الشقة", name: "apartment" },
      ],
    },
    {
      title: "الدورات والملاحظات",
      responsibleParty: "شعبة التدريب والتطوير",
      fields: [],
    },
  ];

  const canEdit = !readOnly && (userRole === "superadmin" || userRole === "شعبة انظمة المعلومات والاحصاء");

  if (!dataLoaded && isEditing) {
    return <div className="p-6 text-center text-lg">جاري تحميل البيانات... ⏳</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 border border-red-300">
          {error}
        </div>
      )}

      <Disclosure defaultOpen={true}>
        {() => (
          <>
            <Disclosure.Panel className="p-4 bg-white border border-gray-200 rounded-b-lg space-y-4">
              {sections.map((sec, idx) => (
                <Disclosure key={idx} defaultOpen={idx === 0}>
                  {({ open: subOpen }) => (
                    <div className="mb-4">
                      <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none">
                        <span>{sec.title}</span>
                        <ChevronUpIcon className={`${subOpen ? "rotate-180 transform" : ""} w-5 h-5 text-gray-500`} />
                      </Disclosure.Button>
                      <Disclosure.Panel className="p-4 bg-white border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {sec.fields.map((field, fidx) => {
                          const isReactSelect = field.type === "search-select";

                          let currentValue = formData[field.name] ?? "";

                          if (isReactSelect) {
                            let optionsList;
                            if (field.name === "departmentID") optionsList = departments;
                            else if (field.name === "unitID") optionsList = units;
                            else optionsList = field.options;

                            currentValue = getSelectedValue(optionsList, formData[field.name]);
                          }

                          const isReadOnlyField = field.readOnly || !canEdit;

                          return (
                            <LabeledInput
                              key={fidx}
                              label={field.label}
                              name={field.name}
                              type={field.type || "text"}
                              value={currentValue}
                              // نستخدم handleSelectChange فقط لـ search-select والبقية handleChange
                              onChange={isReactSelect ? handleSelectChange : handleChange}
                              readOnly={isReadOnlyField}
                              options={field.options || []}
                              className="col-span-1"
                            />
                          );
                        })}

                        {sec.title === "مكان العمل والتعيين" && baseSalary !== null && (
                          <div className="col-span-1 flex flex-col">
                            <label className="text-sm font-semibold mb-1">الراتب الاسمي</label>
                            <div className="border border-gray-300 rounded p-2 text-sm bg-gray-100">
                              {baseSalary.toLocaleString("ar-IQ")} د.ع
                            </div>
                          </div>
                        )}

                        {sec.title === "الدورات والملاحظات" && (
                          <div className="col-span-full">
                            <button
                              type="button"
                              onClick={() => setShowCourseForm(true)}
                              className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700 transition"
                              disabled={!canEdit || !employee?.id}
                            >
                              ربط دورة تدريبية
                            </button>
                            {/* يمكن إضافة جدول عرض الدورات هنا */}
                          </div>
                        )}
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              ))}

              {/* زر الحفظ */}
              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button
                  type="submit"
                  className={`px-6 py-2 rounded font-semibold text-white transition ${canEdit ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
                  disabled={!canEdit}
                >
                  حفظ البيانات
                </button>
              </div>

            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* 🔑 التصحيح: Modal لعرض نموذج الدورة التدريبية مع Z-Index مرتفع */}
      <Transition appear show={showCourseForm} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowCourseForm(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* الخلفية المعتمة */}
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <CourseForm
                    employeeId={employee?.id}
                    onSave={handleAddCourse}
                    onCancel={() => setShowCourseForm(false)}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </form>
  );
}