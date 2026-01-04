import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import Select from "react-select";

/* ---------------------------
   LabeledInput
   --------------------------- */
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
  if (type === "select") {
    return (
      <div className={`flex flex-col ${className}`}>
        <label className="text-sm font-semibold mb-1">{label}</label>
        <select
          name={name}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={onChange}
          readOnly={readOnly}
          className={`border border-gray-300 rounded p-2 text-sm ${readOnly ? "bg-gray-100" : ""
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

  if (type === "search-select") {
    return (
      <div className={`flex flex-col ${className}`}>
        <label className="text-sm font-semibold mb-1">{label}</label>
        <Select
          name={name}
          value={options.find((opt) => opt.value === value) || null}
          onChange={(selectedOption) => {
            const event = {
              target: {
                name,
                value: selectedOption ? selectedOption.value : null,
              },
            };
            onChange(event);
          }}
          options={options}
          isDisabled={readOnly}
          className="text-sm"
          placeholder="اختر..."
          isClearable={true}
          isRtl={true}
          styles={{
            container: (provided) => ({
              ...provided,
              minWidth: "100%",
            }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
          menuPortalTarget={document.body}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-semibold mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        readOnly={readOnly}
        className={`border border-gray-300 rounded p-2 text-sm ${readOnly ? "bg-gray-100" : ""
          }`}
      />
    </div>
  );
};

/* ---------------------------
   parseFullName
   --------------------------- */
const parseFullName = (fullName) => {
  if (!fullName) return {};
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "",
    secondName: parts[1] || "",
    thirdName: parts[2] || "",
    fourthName: parts[3] || "",
    lastName: parts.slice(4).join(" ") || "",
  };
};

/* ---------------------------
   initialFormData
   --------------------------- */
const initialFormData = {
  firstName: "",
  secondName: "",
  thirdName: "",
  fourthName: "",
  lastName: "",
  mothersName: "",
  email: "",
  phonenumber: "",
  gender: null,
  birthDate: "",
  maritalStatus: null,
  husbandsName: null,
  educationLevelID: null,
  specialization: null,
  collegeName: null,
  certificates: null,
  appointmentOrderNumber: "",
  appointmentOrderDate: "",
  startWorkDate: "",
  employeeNumber: "",
  jobTitle: "",
  grade: null,
  step: null,
  positionID: null,
  branchID: null,
  departmentID: null,
  unitID: null,
  idIssuer: null,
  unifiedIDIssuer: null,
  idIssuerDate: "",
  familyNumber: null,
  rationCardNumber: null,
  residenceCardNumber: null,
  residenceCardDate: "",
  informationOffice: null,
  region: null,
  mahalla: null,
  alley: null,
  houseNumber: null,
  street: null,
  building: null,
  apartment: null,
};

/* ---------------------------
   setupFormData
   --------------------------- */
const setupFormData = (employeeData, references) => {
  if (!employeeData) return initialFormData;
  const nameParts = parseFullName(employeeData.fullName || "");

  const getID = (list, displayName) => {
    if (!list || !displayName) return null;
    const item = list.find((it) => it.label === displayName);
    return item ? item.value : null;
  };

  const fmtDate = (s) => (s ? String(s).split("T")[0] : "");

  const dataFromAPI = {
    ...initialFormData,
    ...nameParts,
    mothersName: employeeData.mothersName ?? "",
    email: employeeData.email ?? "",
    phonenumber: employeeData.phonenumber ?? "",
    gender: getID(references.gender, employeeData.genderName),
    birthDate: fmtDate(employeeData.birthDate),
    maritalStatus: getID(references.maritalStatus, employeeData.maritalStatusName),
    husbandsName: employeeData.husbandsName ?? null,
    educationLevelID: getID(references.educationLevels, employeeData.educationLevelName),
    specialization: employeeData.specialization ?? null,
    collegeName: employeeData.collegeName ?? null,
    certificates: employeeData.certificates ?? null,
    appointmentOrderNumber: employeeData.appointmentOrderNumber ?? "",
    appointmentOrderDate: fmtDate(employeeData.appointmentOrderDate),
    startWorkDate: fmtDate(employeeData.startWorkDate),
    employeeNumber: employeeData.employeeNumber ?? "",
    jobTitle: employeeData.jobTitle ?? "",
    grade: employeeData.grade ?? null,
    step: employeeData.step ?? null,
    positionID: getID(references.positions, employeeData.positionName),
    branchID: getID(references.branches, employeeData.branchName),
    departmentID: getID(references.departments, employeeData.departmentName),
    unitID: getID(references.units, employeeData.unitName),
    idIssuer: employeeData.idIssuer ?? null,
    unifiedIDIssuer: employeeData.unifiedIDIssuer ?? null,
    idIssuerDate: fmtDate(employeeData.idIssuerDate),
    familyNumber: employeeData.familyNumber ?? null,
    rationCardNumber: employeeData.rationCardNumber ?? null,
    residenceCardNumber: employeeData.residenceCardNumber ?? null,
    residenceCardDate: fmtDate(employeeData.residenceCardDate),
    informationOffice: employeeData.informationOffice ?? null,
    region: employeeData.region ?? null,
    mahalla: employeeData.mahalla ?? null,
    alley: employeeData.alley ?? null,
    houseNumber: employeeData.houseNumber ?? null,
    street: employeeData.street ?? null,
    building: employeeData.building ?? null,
    apartment: employeeData.apartment ?? null,
  };

  return dataFromAPI;
};

/* ---------------------------
   Component: NewEmployee
   --------------------------- */
export default function NewEmployee({ initialEmployeeData = null }) {
  const navigate = useNavigate();
  const isEditMode = !!initialEmployeeData;
  const employeeId = initialEmployeeData?.id;

  const [formData, setFormData] = useState(initialFormData);
  const [baseSalary, setBaseSalary] = useState(null);

  const [gradeSteps, setGradeSteps] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [gender, setGender] = useState([]);
  const [maritalStatus, setMaritalStatus] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const [positions, setPositions] = useState([]);

  const [dataLoaded, setDataLoaded] = useState(false);

  const BASE_URL = "http://192.168.11.230:1006/api";

  /* ---------------------------
     Fetch references
     --------------------------- */
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const endpoints = [
          { key: "gradeSteps", url: `${BASE_URL}/GradeAndStep?PageSize=1000` },
          { key: "branches", url: `${BASE_URL}/Branch?PageSize=1000` },
          { key: "gender", url: `${BASE_URL}/Enums/gender?PageSize=1000` },
          { key: "maritalStatus", url: `${BASE_URL}/Enums/maritalStatus?PageSize=1000` },
          { key: "educationLevels", url: `${BASE_URL}/EducationLevel?PageSize=1000` },
          { key: "positions", url: `${BASE_URL}/Position?PageSize=1000` },
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
              refs.branches = (r.data.items || []).map((b) => ({ value: b.branchID, label: b.name }));
              break;
            case "gender":
              refs.gender = (r.data || []).map((it) => ({ value: String(it.id), label: it.name }));
              break;
            case "maritalStatus":
              refs.maritalStatus = (r.data || []).map((it) => ({ value: String(it.id), label: it.name }));
              break;
            case "educationLevels":
              refs.educationLevels = (r.data.items || r.data || []).map((it) => ({ value: it.educationLevelID, label: it.educationLevelName }));
              break;
            case "positions":
              refs.positions = (r.data.items || r.data || []).map((it) => ({ value: it.positionID, label: it.positionName }));
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
        setPositions(refs.positions || []);
      } catch (err) {
        console.error("Error fetching references:", err);
        alert("فشل في جلب بعض البيانات المرجعية الأساسية. راجع Console.");
      } finally {
        setDataLoaded(true);
      }
    };

    fetchReferences();
  }, []);

  /* ---------------------------
     Branch -> Departments
     --------------------------- */
  useEffect(() => {
    const branchId = formData.branchID;
    if (!branchId) {
      setDepartments([]);
      setUnits([]);
      setFormData((prev) => ({ ...prev, departmentID: null, unitID: null }));
      return;
    }

    const fetchDepartmentsByBranch = async () => {
      try {
        const res = await fetch(`${BASE_URL}/Departments/by-branch/${branchId}`);
        if (!res.ok) throw new Error("Failed to load departments");
        const data = await res.json();
        const mapped = (data.items || data || []).map((d) => ({ value: d.departmentID, label: d.name }));
        setDepartments(mapped);
        setUnits([]);
        setFormData((prev) => ({ ...prev, departmentID: null, unitID: null }));
      } catch (err) {
        console.error("خطأ في جلب الأقسام للفرع:", err);
        setDepartments([]);
      }
    };

    fetchDepartmentsByBranch();
  }, [formData.branchID]);

  /* ---------------------------
     Department -> Units
     --------------------------- */
  useEffect(() => {
    const departmentId = formData.departmentID;
    if (!departmentId) {
      setUnits([]);
      setFormData((prev) => ({ ...prev, unitID: null }));
      return;
    }

    const fetchUnitsByDepartment = async () => {
      try {
        const res = await fetch(`${BASE_URL}/Unit/by-department/${departmentId}`);
        if (!res.ok) throw new Error("Failed to load units");
        const data = await res.json();
        const mapped = (data.items || data || []).map((u) => ({ value: u.unitID, label: u.name }));
        setUnits(mapped);
        if (!mapped.find((u) => u.value === formData.unitID)) {
          setFormData((prev) => ({ ...prev, unitID: null }));
        }
      } catch (err) {
        console.error("خطأ في جلب الوحدات للقسم:", err);
        setUnits([]);
        setFormData((prev) => ({ ...prev, unitID: null }));
      }
    };

    fetchUnitsByDepartment();
  }, [formData.departmentID, formData.unitID]);

  /* ---------------------------
     Setup form for edit
     --------------------------- */
  useEffect(() => {
    if (!dataLoaded || !isEditMode || !initialEmployeeData) return;

    const refs = {
      gender,
      maritalStatus,
      educationLevels,
      positions,
      branches,
      departments,
      units,
    };
    const populated = setupFormData(initialEmployeeData, refs);

    if (populated.departmentID) {
      const fetchUnitsByDepartment = async () => {
        try {
          const res = await fetch(`${BASE_URL}/Unit/by-department/${populated.departmentID}`);
          if (!res.ok) throw new Error("Failed to load units");
          const data = await res.json();
          const mapped = (data.items || data || []).map((u) => ({ value: u.unitID, label: u.name }));
          setUnits(mapped);
          if (!mapped.find((u) => u.value === populated.unitID)) {
            populated.unitID = null;
          }
          setFormData(populated);

          if (populated.grade && populated.step) {
            const matched = gradeSteps.find(
              (gs) => gs.grade === populated.grade && gs.step === populated.step
            );
            setBaseSalary(matched ? matched.baseSalary : null);
          }
        } catch (err) {
          console.error("خطأ في جلب الوحدات للقسم عند التعديل:", err);
          setUnits([]);
          setFormData(populated);
        }
      };

      fetchUnitsByDepartment();
    } else {
      setFormData(populated);
      if (populated.grade && populated.step) {
        const matched = gradeSteps.find(
          (gs) => gs.grade === populated.grade && gs.step === populated.step
        );
        setBaseSalary(matched ? matched.baseSalary : null);
      }
    }


  }, [
    dataLoaded,
    isEditMode,
    initialEmployeeData,
    gender,
    maritalStatus,
    educationLevels,
    positions,
    branches,
    departments,
    units,
    gradeSteps,
  ]);

  /* ---------------------------
     handleChange
     --------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    const numericFields = [
      "grade",
      "step",
      "branchID",
      "departmentID",
      "unitID",
      "gender",
      "maritalStatus",
      "educationLevelID",
      "positionID",
    ];

    if (numericFields.includes(name)) {
      finalValue = value === "" || value === null ? null : Number(value);
    }

    const newForm = { ...formData, [name]: finalValue };

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

    // 🟢 منطق مسح حقل اسم الزوج/الزوجة بناءً على الحالة الاجتماعية
    // ⭐ منطق التعامل مع الحالة الاجتماعية
    if (name === "maritalStatus") {
      // الحصول على الكائن المختار
      const selectedObj = maritalStatus.find((m) => m.value === finalValue);
      const selectedLabel = selectedObj?.label;

      const statusesToClear = [
        "مطلق",
        "مطلقة",
        "أعزب",
        "اعزب",
        "باكر",
        "أرمل",
        "ارمل",
        "ارملة",
      ];

      // إذا كانت حالة لا تحتاج اسم زوج/زوجة → مسح الحقل
      if (statusesToClear.includes(selectedLabel)) {
        newForm.husbandsName = null;
        console.log("🚨 Name cleared due to marital status:", selectedLabel);
      }
    }

    setFormData(newForm);
  };

  /* ---------------------------
     handleSubmit
     --------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً.");
      return;
    }

    const dateFields = [
      "birthDate",
      "appointmentOrderDate",
      "startWorkDate",
      "idIssuerDate",
      "residenceCardDate",
    ];

    const numericFields = [
      "gender",
      "maritalStatus",
      "educationLevelID",
      "grade",
      "step",
      "positionID",
      "branchID",
      "departmentID",
      "unitID",
    ];

    let payload = { ...formData };

    numericFields.forEach((f) => {
      const v = payload[f];
      payload[f] = v === null || v === undefined || v === "" ? null : Number(v);
    });

    dateFields.forEach((f) => {
      const v = payload[f];
      payload[f] = v && String(v).trim() !== "" ? String(v) : null;
    });

    if (isEditMode) payload.id = employeeId;

    const API_URL = isEditMode ? `${BASE_URL}/Employee/${employeeId}` : `${BASE_URL}/Employee`;
    const METHOD = isEditMode ? "PUT" : "POST";

    console.log("Final Payload:", payload);

    try {
      const res = await fetch(API_URL, {
        method: METHOD,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(`تم ${isEditMode ? "تعديل" : "إضافة"} الموظف بنجاح!`);
        navigate("/main"); // العودة للصفحة الرئيسية (الداش بورد)
      } else if (res.status === 400) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          const message = json.errors ? Object.values(json.errors).flat().join("\n") : json.title || text;
          alert(`خطأ 400:\n${message}`);
        } catch {
          alert(`خطأ 400:\n${text}`);
        }
      } else if (res.status === 401) {
        alert("401 - غير مصرح. قم بتسجيل الخروج ثم تسجيل الدخول مجددًا.");
      } else {
        const text = await res.text();
        alert(`فشل الطلب. كود: ${res.status}\n${text}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("خطأ في الاتصال. تحقق من الشبكة.");
    }
  };

  /* ---------------------------
     Grades & Steps
     --------------------------- */
  const uniqueGrades = [...new Set(gradeSteps.map((g) => g.grade))].map((grade) => ({
    value: grade,
    label: String(grade),
  }));

  const filteredSteps = gradeSteps
    .filter((g) => g.grade === formData.grade)
    .map((g) => ({ value: g.step, label: String(g.step) }));

  /* ---------------------------
     UI Sections
     --------------------------- */
  const sections = [
    {
      title: "البيانات الشخصية",
      responsibleParty: "شعبة أنظمة المعلومات والإحصاء",
      fields: [
        { label: "الاسم الأول", name: "firstName" },
        { label: "الاسم الثاني", name: "secondName" },
        { label: "الاسم الثالث", name: "thirdName" },
        { label: "الاسم الرابع", name: "fourthName" },
        { label: "اللقب", name: "lastName" },
        { label: "اسم الأم", name: "mothersName" },
        { label: "البريد الالكتروني", name: "email" },
        { label: "رقم الهاتف", name: "phonenumber" },
        { label: "الجنس", name: "gender", type: "select", options: gender },
        { label: "تاريخ الميلاد", name: "birthDate", type: "date" },
        { label: "الحالة الاجتماعية", name: "maritalStatus", type: "select", options: maritalStatus },
        ({
          label: "اسم الزوج/الزوجة",
          name: "husbandsName",
          show: () => {
            const selected = maritalStatus.find(m => m.value === formData.maritalStatus);
            return selected && ["متزوج", "متزوجة"].includes(selected.label);
          }
        })

      ],
    },
    {
      title: "التعليم والشهادات",
      responsibleParty: "شعبة أنظمة المعلومات والإحصاء",
      fields: [
        { label: "المستوى الدراسي ", name: "educationLevelID", type: "select", options: educationLevels },
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
        { label: "الرقم الوظيفي", name: "employeeNumber" },
        { label: "العنوان الوظيفي", name: "jobTitle" },
        { label: "الدرجة", name: "grade", type: "select", options: uniqueGrades },
        { label: "المرحلة", name: "step", type: "select", options: filteredSteps },
        { label: "المنصب", name: "positionID", type: "select", options: positions },
        { label: "الفرع", name: "branchID", type: "select", options: branches },
        { label: "القسم", name: "departmentID", type: "search-select", options: departments },
        { label: "الشعبة", name: "unitID", type: "search-select", options: units },
      ],
    },
    {
      title: "البيانات والهوية",
      responsibleParty: "شعبة أنظمة المعلومات والإحصاء",
      fields: [
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
  ];

  if (!dataLoaded && isEditMode) {
    return <div className="p-6 text-center text-lg">جاري تحميل البيانات... ⏳</div>;
  }

return (
  <form onSubmit={handleSubmit} className="p-6 space-y-4">
    <h1 className="text-xl font-bold mb-4">
      {isEditMode
        ? `تعديل بيانات الموظف: ${initialEmployeeData.fullName}`
        : "إضافة موظف جديد"}
    </h1>

    <Disclosure defaultOpen={true}>
      {() => (
        <div>
          <Disclosure.Panel className="p-4 bg-white border border-gray-200 rounded-b-lg space-y-4">
            {sections.map((sec, idx) => (
              <Disclosure key={idx} defaultOpen={idx === 0}>
                {({ open: subOpen }) => (
                  <div className="mb-4">
                    <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-blue-200 hover:bg-blue-200 rounded-t-lg rounded-lg focus:outline-none">
                      <span>{sec.title}</span>
                      <ChevronUpIcon
                        className={`${subOpen ? "rotate-180 transform" : ""} w-5 h-5 text-gray-500`}
                      />
                    </Disclosure.Button>

                    <Disclosure.Panel className="p-4 bg-white border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                      {/* ⭐ تعديل إظهار الحقول */}
                      {sec.fields
                        .filter((field) => {
                          // 🔵 منطق إظهار / إخفاء حقل الزوج/الزوجة
                          if (field.name === "husbandsName") {
                            const selected = maritalStatus.find(
                              (m) => String(m.value) === String(formData.maritalStatus)
                            );

                            const showStatuses = ["متزوج", "متزوجة"];

                            return (
                              selected &&
                              showStatuses.includes(
                                selected.label?.trim()
                              )
                            );
                          }

                          return true;
                        })
                        .map((field, fidx) => (
                          <LabeledInput
                            key={fidx}
                            label={field.label}
                            name={field.name}
                            type={field.type || "text"}
                            value={formData[field.name] ?? ""}
                            onChange={handleChange}
                            options={field.options || []}
                            className="col-span-1"
                          />
                        ))}

                      {/* 🟢 إظهار الراتب إن وجد */}
                      {sec.title === "مكان العمل والتعيين" && baseSalary !== null && (
                        <div className="col-span-1 flex flex-col">
                          <label className="text-sm font-semibold mb-1">
                            الراتب الاسمي
                          </label>
                          <div className="border border-gray-300 rounded p-2 text-sm bg-gray-100">
                            {baseSalary.toLocaleString("ar-IQ")} د.ع
                          </div>
                        </div>
                      )}
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            ))}
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>

    <div className="flex justify-end mt-6">
      <button
        type="submit"
        className="bg-green-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-green-700 transition font-semibold"
      >
        {isEditMode ? "حفظ التعديلات" : "حفظ بيانات الموظف"}
      </button>
    </div>
  </form>
);

}
