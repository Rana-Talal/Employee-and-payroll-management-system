// EmployeeReadonlyView.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

const safeValue = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === "object") return val.id ?? val.value ?? null;
  return val;
};

const fmtDate = (s) => (s ? String(s).split("T")[0] : "");

const findOptionLabel = (list, value) => {
  if (!list || value == null) return null;
  const strValue = String(value);
  const item = list.find(it => String(safeValue(it.value)) === strValue);
  return item ? item.label : null;
};

const ReadOnlyField = ({ label, value, className }) => (
  <div className={`flex flex-col ${className || ""}`}>
    <label className="text-sm font-semibold mb-1 text-gray-700">{label}</label>
    <div className="border border-gray-300 rounded p-2 text-sm bg-gray-50 min-h-[38px] flex items-center">
      {value ?? "—"}
    </div>
  </div>
);

// دالة لحساب الراتب الأساسي من الدرجة والمرحلة (خارج المكون لتجنب re-creation)
const calculateBaseSalary = (grade, step, gradeSteps) => {
  if (!grade || !step || !gradeSteps?.length) return null;
  const matched = gradeSteps.find(gs => 
    Number(gs.grade) === Number(grade) && Number(gs.step) === Number(step)
  );
  return matched ? matched.baseSalary : null;
};

export default function EmployeeReadonlyView({ employee = null }) {
  console.log('🏠 EmployeeView Component Init:', { 
    employee, 
    employeeId: employee?.id, 
    updatedAt: employee?.updatedAt,
    timestamp: new Date().toISOString()
  });

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true);
  const [employeeVersion, setEmployeeVersion] = useState(0);

  const [genderOptions, setGenderOptions] = useState([]);
  const [maritalStatusOptions, setMaritalStatusOptions] = useState([]);
  const [educationLevelOptions, setEducationLevelOptions] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);
  const [serviceStatusOptions, setServiceStatusOptions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [gradeSteps, setGradeSteps] = useState([]);

  const BASE_URL = "/api";
  const getArray = (d) => (d && d.items) || d || [];

  // جلب البيانات المرجعية
  useEffect(() => {
    console.log('📚 EmployeeView - References useEffect triggered:', {
      employeeId: employee?.id,
      employeeVersion,
      isInitialLoad: isInitialLoad.current,
      timestamp: new Date().toISOString()
    });
    
    let mounted = true;
    const fetchReferences = async () => {
      setLoading(true);
      try {
        const urls = [
          `${BASE_URL}/Enums/gender`,
          `${BASE_URL}/Enums/maritalstatus`,
          `${BASE_URL}/EducationLevel`,
          `${BASE_URL}/Bank`,
          `${BASE_URL}/Position?PageSize=1000`,
          `${BASE_URL}/ServiceStatus`,
          `${BASE_URL}/Branch`,
          `${BASE_URL}/GradeAndStep`,
        ];

        const responses = await Promise.all(urls.map(url => fetch(url)));
        const data = await Promise.all(
          responses.map(async res => {
            if (!res.ok) return [];
            const text = await res.text();
            return text ? JSON.parse(text) : [];
          })
        );

        if (!mounted) return;

        const [gender, marital, education, bank, position, serviceStatus, branchesData, gradeStepData] = data;

        setGenderOptions(getArray(gender).map(it => ({ value: String(it.id), label: String(it.name || it.id) })));
        setMaritalStatusOptions(getArray(marital).map(it => ({ value: String(it.id), label: String(it.name || it.id) })));
        setEducationLevelOptions(getArray(education).map(it => ({ value: String(it.educationLevelID ?? it.id), label: it.educationLevelName ?? it.name })));
        setBankOptions(getArray(bank).map(it => ({ value: String(it.bankID ?? it.id), label: it.bankName ?? it.name })));
        setPositionOptions(getArray(position).map(it => ({ value: String(it.positionID ?? it.id), label: it.positionName ?? it.name })));
        setServiceStatusOptions(getArray(serviceStatus).map(it => ({ value: String(it.serviceStatusID ?? it.id), label: it.serviceStatusName ?? it.name })));
        setBranches(getArray(branchesData).map(b => ({ value: String(b.branchID ?? b.id), label: b.name })));
        setGradeSteps(getArray(gradeStepData));

        if (!employee) setLoading(false);
      } catch {
        if (mounted) setLoading(false);
      }
    };

    fetchReferences();
    return () => { mounted = false; };
  }, [employee]);

  const fetchDepartmentsForBranch = async (branchId) => {
    if (!branchId) return [];
    try {
      const res = await fetch(`${BASE_URL}/Departments/by-branch/${Number(branchId)}`);
      if (!res.ok) return [];
      const data = await res.json();
      const items = (data && data.items) || data || [];
      return items.map(d => ({ value: String(d.departmentID ?? d.id), label: d.name }));
    } catch {
      return [];
    }
  };

  const fetchUnitsForDepartment = async (departmentId) => {
    if (!departmentId) return [];
    try {
      const res = await fetch(`${BASE_URL}/Unit/by-department/${Number(departmentId)}`);
      if (!res.ok) return [];
      const data = await res.json();
      const items = (data && data.items) || data || [];
      return items.map(u => ({ value: String(u.unitID ?? u.id), label: u.name }));
    } catch {
      return [];
    }
  };

  useEffect(() => {
    console.log('👤 EmployeeView - Employee data useEffect triggered:', {
      employeeId: employee?.id,
      hasEmployee: !!employee,
      genderOptionsLength: genderOptions.length,
      maritalStatusOptionsLength: maritalStatusOptions.length,
      branchesLength: branches.length,
      gradeStepsLength: gradeSteps.length,
      isInitialLoad: isInitialLoad.current,
      timestamp: new Date().toISOString()
    });

    if (!employee) {
      if (!isInitialLoad.current) setLoading(false);
      return;
    }

    if (
      genderOptions.length === 0 ||
      maritalStatusOptions.length === 0 ||
      branches.length === 0 ||
      gradeSteps.length === 0
    ) {
      return;
    }

    const load = async () => {
      const nameParts = (() => {
        if (!employee.fullName) return {};
        const parts = employee.fullName.trim().split(/\s+/).filter(p => p.length > 0);
        return {
          firstName: parts[0] || "",
          secondName: parts[1] || "",
          thirdName: parts[2] || "",
          fourthName: parts[3] || "",
          lastName: parts.slice(4).join(" ") || "",
        };
      })();

      const empBranchId = employee.branchID ?? employee.branchId ?? null;
      const empDeptId = employee.departmentID ?? employee.departmentId ?? null;
      const empUnitId = employee.unitID ?? employee.unitId ?? null;

      let branchID = empBranchId ? String(empBranchId) : null;
      if (!branchID && employee.branchName) {
        const match = branches.find(b => b.label === employee.branchName);
        branchID = match ? match.value : null;
      }

      let departmentID = empDeptId ? String(empDeptId) : null;
      let unitID = empUnitId ? String(empUnitId) : null;

      if (branchID) {
        const depts = await fetchDepartmentsForBranch(branchID);
        if (!departmentID && employee.departmentName) {
          const matched = depts.find(d => d.label === employee.departmentName);
          departmentID = matched ? matched.value : null;
        }
      }

      if (departmentID) {
        const units = await fetchUnitsForDepartment(departmentID);
        if (!unitID && employee.unitName) {
          const matchedU = units.find(u => u.label === employee.unitName);
          unitID = matchedU ? matchedU.value : null;
        }
      }

      const setupData = {
        id: safeValue(employee.id),
        firstName: employee.firstName || nameParts.firstName || "",
        secondName: employee.secondName || nameParts.secondName || "",
        thirdName: employee.thirdName || nameParts.thirdName || "",
        fourthName: employee.fourthName || nameParts.fourthName || "",
        lastName: employee.lastName || nameParts.lastName || "",
        mothersName: employee.mothersName || "",
        email: employee.email || "",
        phonenumber: employee.phonenumber || "",
        gender: findOptionLabel(genderOptions, employee.gender) || employee.genderName || employee.gender || "—",
        birthDate: fmtDate(employee.birthDate),
        maritalStatus: findOptionLabel(maritalStatusOptions, employee.maritalStatus) || employee.maritalStatusName || employee.maritalStatus || "—",
        husbandsName: employee.husbandsName || "",
        educationLevelID: findOptionLabel(educationLevelOptions, employee.educationLevelID) || employee.educationLevelName || employee.educationLevelID || "—",
        specialization: employee.specialization || "",
        collegeName: employee.collegeName || "",
        certificates: employee.certificates || "",
        appointmentOrderNumber: employee.appointmentOrderNumber || "",
        appointmentOrderDate: fmtDate(employee.appointmentOrderDate),
        startWorkDate: fmtDate(employee.startWorkDate),
        resignationDate: fmtDate(employee.resignationDate),
        retirementDate: fmtDate(employee.retirementDate),
        reAppointmentDate: fmtDate(employee.reAppointmentDate),
        employeeNumber: employee.employeeNumber || "",
        jobTitle: employee.jobTitle || "",
        grade: safeValue(employee.grade) ? String(safeValue(employee.grade)) : "",
        step: safeValue(employee.step) ? String(safeValue(employee.step)) : "",
        baseSalary: calculateBaseSalary(employee.grade, employee.step, gradeSteps) || employee.baseSalary || "—",
        positionID: findOptionLabel(positionOptions, employee.positionID) || employee.positionName || employee.positionID || "—",
        branchID: findOptionLabel(branches, branchID) || employee.branchName || employee.branchID || "—",
        departmentID: departmentID 
          ? (await fetchDepartmentsForBranch(branchID)).find(d => d.value === departmentID)?.label || employee.departmentName || "—" 
          : employee.departmentName || "—",
        unitID: unitID 
          ? (await fetchUnitsForDepartment(departmentID)).find(u => u.value === unitID)?.label || employee.unitName || "—" 
          : employee.unitName || "—",
        unitName: employee.unitName || "",
        serviceStatusID: findOptionLabel(serviceStatusOptions, employee.serviceStatusID) || employee.serviceStatusName || employee.serviceStatusID || "—",
        assignmentLocation: employee.assignmentLocation || "",
        bankID: findOptionLabel(bankOptions, employee.bankID) || employee.bankName || employee.bankID || "—",
        accountNumber: employee.accountNumber || "",
        idIssuer: employee.idIssuer || "",
        unifiedIDIssuer: employee.unifiedIDIssuer || "",
        idIssuerDate: fmtDate(employee.idIssuerDate),
        familyNumber: employee.familyNumber || "",
        rationCardNumber: employee.rationCardNumber || "",
        residenceCardNumber: employee.residenceCardNumber || "",
        residenceCardDate: fmtDate(employee.residenceCardDate),
        informationOffice: employee.informationOffice || "",
        region: employee.region || "",
        mahalla: employee.mahalla || "",
        alley: employee.alley || "",
        houseNumber: employee.houseNumber || "",
        street: employee.street || "",
        building: employee.building || "",
        apartment: employee.apartment || "",
        isActive: employee.isActive ?? true,
      };

      setFormData(setupData);
      setLoading(false);
      setTimeout(() => (isInitialLoad.current = false), 80);
    };

    load();
  }, [
    employee,
    genderOptions,
    maritalStatusOptions,
    educationLevelOptions,
    bankOptions,
    positionOptions,
    serviceStatusOptions,
    branches,
    gradeSteps, // إضافة gradeSteps للتأكد من حساب الراتب الصحيح
  ]);

  // useEffect منفصل لمراقبة تغييرات محددة في employee والتحديث الفوري
  useEffect(() => {
    if (!employee || !gradeSteps.length) return;
    
    // تحديث البيانات عند تغيير أي خاصية في employee
    console.log('🔄 Employee data changed, updating display...', {
      employeeId: employee.id,
      grade: employee.grade,
      step: employee.step,
      updatedAt: employee.updatedAt,
      timestamp: new Date().toISOString()
    });
    
    const updatedBaseSalary = calculateBaseSalary(employee.grade, employee.step, gradeSteps) || employee.baseSalary || "—";
    
    setFormData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        grade: safeValue(employee.grade) ? String(safeValue(employee.grade)) : "",
        step: safeValue(employee.step) ? String(safeValue(employee.step)) : "",
        baseSalary: updatedBaseSalary,
        // تحديث باقي الحقول التي قد تتغير
        firstName: employee.firstName || prev.firstName || "",
        secondName: employee.secondName || prev.secondName || "",
        thirdName: employee.thirdName || prev.thirdName || "",
        fourthName: employee.fourthName || prev.fourthName || "",
        lastName: employee.lastName || prev.lastName || "",
        mothersName: employee.mothersName || prev.mothersName || "",
        email: employee.email || prev.email || "",
        phonenumber: employee.phonenumber || prev.phonenumber || "",
        jobTitle: employee.jobTitle || prev.jobTitle || "",
      };
    });
  }, [employee, gradeSteps]);



  // استخدام useMemo لتتبع تغييرات employee بشكل دقيق
  const employeeHash = useMemo(() => {
    if (!employee) return null;
    
    const hash = JSON.stringify({
      id: employee.id,
      updatedAt: employee.updatedAt,
      grade: employee.grade,
      step: employee.step,
      baseSalary: employee.baseSalary,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phonenumber: employee.phonenumber,
      jobTitle: employee.jobTitle
    });
    
    console.log('🧮 EmployeeView - Hash calculated:', { 
      hash: hash.substring(0, 100) + '...',
      employeeId: employee.id,
      updatedAt: employee.updatedAt,
      grade: employee.grade,
      step: employee.step
    });
    
    return hash;
  }, [employee]);

  // useEffect لمراقبة تغييرات employeeHash
  useEffect(() => {
    if (!employeeHash || !employee) return;
    
    console.log('🔍 Employee hash changed, triggering update:', {
      employeeId: employee.id,
      timestamp: new Date().toISOString(),
      hash: employeeHash.substring(0, 50) + '...'
    });
    
    // إجبار إعادة التحميل عند تغيير hash
    const newVersion = employeeHash.length + Date.now();
    if (newVersion !== employeeVersion) {
      console.log('🚀 Forcing complete data reload...');
      setEmployeeVersion(newVersion);
      
      // إعادة تعيين التحميل الأولي
      isInitialLoad.current = true;
      setLoading(true);
    }
  }, [employeeHash, employeeVersion, employee]);

  const sections = [
    {
      title: "المعلومات الشخصية",
      fields: [
        { label: "الاسم الأول", name: "firstName" },
        { label: "الاسم الثاني", name: "secondName" },
        { label: "الاسم الثالث", name: "thirdName" },
        { label: "الاسم الرابع", name: "fourthName" },
        { label: "اللقب", name: "lastName" },
        { label: "اسم الأم", name: "mothersName" },
        { label: "البريد الإلكتروني", name: "email" },
        { label: "رقم الهاتف", name: "phonenumber" },
        { label: "الجنس", name: "gender" },
        { label: "تاريخ الميلاد", name: "birthDate" },
        { label: "الحالة الاجتماعية", name: "maritalStatus" },
        { label: "اسم الزوج/الزوجة", name: "husbandsName" },
      ],
    },
    {
      title: "التعليم والشهادات",
      fields: [
        { label: "المستوى التعليمي", name: "educationLevelID" },
        { label: "التخصص", name: "specialization" },
        { label: "اسم الكلية", name: "collegeName" },
        { label: "الشهادات", name: "certificates" },
      ],
    },
    {
      title: "معلومات التعيين",
      fields: [
        { label: "رقم أمر التعيين", name: "appointmentOrderNumber" },
        { label: "تاريخ أمر التعيين", name: "appointmentOrderDate" },
        { label: "تاريخ المباشرة", name: "startWorkDate" },
        { label: "تاريخ الاستقالة", name: "resignationDate" },
        { label: "تاريخ التقاعد", name: "retirementDate" },
        { label: "تاريخ إعادة التعيين", name: "reAppointmentDate" },
        { label: "الرقم الوظيفي", name: "employeeNumber" },
        { label: "المسمى الوظيفي", name: "jobTitle" },
        { label: "الدرجة", name: "grade" },
        { label: "المرحلة", name: "step" },
        { label: "الراتب الأساسي", name: "baseSalary" },
        { label: "المنصب", name: "positionID" },
        { label: "الفرع", name: "branchID" },
        { label: "القسم", name: "departmentID" },
        { label: "الشعبة", name: "unitID" },
        { label: "حالة الخدمة", name: "serviceStatusID" },
        { label: "مكان التكليف", name: "assignmentLocation" },
      ],
    },
    {
      title: "المعلومات المصرفية",
      fields: [
        { label: "البنك", name: "bankID" },
        { label: "رقم الحساب", name: "accountNumber" },
      ],
    },
    {
      title: "الهوية والوثائق",
      fields: [
        { label: "جهة إصدار الهوية", name: "idIssuer" },
        { label: "جهة إصدار الهوية الموحدة", name: "unifiedIDIssuer" },
        { label: "تاريخ إصدار الهوية", name: "idIssuerDate" },
        { label: "رقم الأسرة", name: "familyNumber" },
        { label: "رقم البطاقة التموينية", name: "rationCardNumber" },
        { label: "رقم بطاقة السكن", name: "residenceCardNumber" },
        { label: "تاريخ بطاقة السكن", name: "residenceCardDate" },
      ],
    },
    {
      title: "العنوان",
      fields: [
        { label: "مكتب المعلومات", name: "informationOffice" },
        { label: "المنطقة", name: "region" },
        { label: "المحلة", name: "mahalla" },
        { label: "الزقاق", name: "alley" },
        { label: "رقم الدار", name: "houseNumber" },
        { label: "الشارع", name: "street" },
        { label: "البناية", name: "building" },
        { label: "الشقة", name: "apartment" },
      ],
    },
  ];

  if (loading) return <div className="p-6 text-center">جارٍ تحميل البيانات... ⏳</div>;

  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg shadow-md" key={`employee-${employee?.id}-${employeeVersion}`}>
      <Disclosure defaultOpen>
        {({ open }) => (
          <div className="bg-white rounded-lg shadow">
            <Disclosure.Button className="flex w-full justify-between items-center px-4 py-3 bg-blue-100 hover:bg-blue-200 rounded-t-lg">
              <span className="text-lg font-bold text-gray-800">معلومات الموظف</span>
              <ChevronUpIcon className={`${open ? "transform rotate-180" : ""} w-5 h-5 text-blue-600 transition-transform`} />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 py-4">
              {sections.map((sec, secIndex) => (
                <Disclosure key={secIndex} defaultOpen={secIndex === 0}>
                  {({ open }) => (
                    <div className="mb-4">
                      <Disclosure.Button className="flex w-full justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">
                        <span className="text-md font-semibold text-gray-700">{sec.title}</span>
                        <ChevronUpIcon className={`${open ? "transform rotate-180" : ""} w-4 h-4 text-gray-600 transition-transform`} />
                      </Disclosure.Button>
                      <Disclosure.Panel className="pt-3 pb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {sec.fields.map((field, fieldIndex) => (
                            <ReadOnlyField
                              key={fieldIndex}
                              label={field.label}
                              value={formData[field.name]}
                            />
                          ))}
                        </div>
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              ))}
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  );
}