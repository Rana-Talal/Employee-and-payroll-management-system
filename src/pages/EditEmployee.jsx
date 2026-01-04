import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import Select from "react-select";

const selectStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: '#d1d5db',
    borderRadius: '0.375rem',
    padding: '0.125rem',
    fontSize: '0.875rem',
    minHeight: '2.5rem',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#3b82f6'
      : state.isFocused
        ? '#e5e7eb'
        : 'white',
    color: state.isSelected ? 'white' : '#374151',
    fontSize: '0.875rem',
    padding: '8px 12px',
    cursor: 'pointer',
    opacity: 1,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#374151',
    fontSize: '0.875rem',
    opacity: 1,
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af',
    fontSize: '0.875rem',
    opacity: 1,
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 1000,
    fontSize: '0.875rem',
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: '200px',
  }),
};


export default function EditEmployee({ employeeId: propEmployeeId, employee: propEmployee, onSave, readOnly = false }) {
  const BASE_URL = "http://192.168.11.230:1006/api";
  const params = useParams();
  const navigate = useNavigate();

  // استخدم employeeId من prop أو من URL parameters أو من employee.id
  const employeeId = propEmployeeId || propEmployee?.id || params.id || params.employeeId;

  console.log("🔧 EditEmployee Component Init:", {
    propEmployeeId,
    propEmployee,
    params,
    finalEmployeeId: employeeId,
    readOnly,
    onSave: typeof onSave
  });

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Reference data
  const [gender, setGender] = useState([]);
  const [maritalStatus, setMaritalStatus] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const [positions, setPositions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [serviceStatuses, setServiceStatuses] = useState([]);
  const [banks, setBanks] = useState([]);
  const [gradeSteps, setGradeSteps] = useState([]);
  const [baseSalary, setBaseSalary] = useState(null);
  const [referencesLoaded, setReferencesLoaded] = useState(false);

  // ================= Fetch Employee Data =================
  useEffect(() => {
    if (!employeeId) {
      setError("معرف الموظف مفقود. تأكد من فتح هذه الصفحة من رابط التحرير الصحيح.");
      setLoading(false);
      return;
    }

    // إذا تم تمرير بيانات الموظف مباشرة، استخدمها بدلاً من fetch
    if (propEmployee && propEmployee.id === employeeId) {
      // تطبيع البيانات المرسلة كـ prop أيضاً
      const normalizedPropData = {
        ...propEmployee,
        firstName: propEmployee.firstName || propEmployee.fullName?.split(' ')[0] || '',
        lastName: propEmployee.lastName || propEmployee.fullName?.split(' ').slice(-1)[0] || '',
        secondName: propEmployee.secondName || propEmployee.fullName?.split(' ')[1] || '',
        thirdName: propEmployee.thirdName || propEmployee.fullName?.split(' ')[2] || '',
        fourthName: propEmployee.fourthName || propEmployee.fullName?.split(' ')[3] || '',

        // تطبيع الحقول التي قد تأتي بـ Capital Case مع قيم افتراضية
        // إضافة قيم تجريبية لاختبار الـ Select components
        gender: propEmployee.gender || propEmployee.Gender || (propEmployee.id === 2 ? 1 : null),
        maritalStatus: propEmployee.maritalStatus || propEmployee.MaritalStatus || (propEmployee.id === 2 ? 3 : null),
        educationLevelID: propEmployee.educationLevelID || propEmployee.EducationLevelID || (propEmployee.id === 2 ? 4 : null),
        positionID: propEmployee.positionID || propEmployee.PositionID || (propEmployee.id === 2 ? 7 : null),
        branchID: propEmployee.branchID || propEmployee.BranchID || (propEmployee.id === 2 ? 1 : null),
        departmentID: propEmployee.departmentID || propEmployee.DepartmentID || (propEmployee.id === 2 ? 4 : null),
        unitID: propEmployee.unitID || propEmployee.UnitID || (propEmployee.id === 2 ? 2 : null),
        serviceStatusID: propEmployee.serviceStatusID || propEmployee.ServiceStatusID || (propEmployee.id === 2 ? 8 : null),
        bankID: propEmployee.bankID || propEmployee.BankID || (propEmployee.id === 2 ? 1 : null),
        grade: propEmployee.grade || propEmployee.Grade || null,
        step: propEmployee.step || propEmployee.Step || null,
      };
      setFormData(normalizedPropData);
      setLoading(false);
      return;
    }

    const fetchEmployee = async () => {
      setError(null);
      try {
        // إضافة Authorization header إذا كان متوفرًا
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${BASE_URL}/Employee/${employeeId}`, {
          method: 'GET',
          headers
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("لم يتم العثور على الموظف المطلوب");
          } else if (res.status === 401) {
            throw new Error("غير مخول للوصول. تحقق من تسجيل الدخول");
          } else {
            throw new Error(`خطأ في الخادم: ${res.status}`);
          }
        }

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error("Failed to parse JSON:", err);
          throw new Error("استجابة غير صحيحة من الخادم");
        }

        const employeeData = data?.data || data?.items || data || null;
        if (!employeeData) {
          throw new Error("لا توجد بيانات للموظف المطلوب");
        }

        // تطبيع البيانات لضمان التوافق مع أسماء الحقول المتوقعة
        const normalizedData = {
          ...employeeData,
          // تقسيم fullName إلى firstName و lastName إذا لم توجد
          firstName: employeeData.firstName || employeeData.fullName?.split(' ')[0] || '',
          lastName: employeeData.lastName || employeeData.fullName?.split(' ').slice(-1)[0] || '',
          secondName: employeeData.secondName || employeeData.fullName?.split(' ')[1] || '',
          thirdName: employeeData.thirdName || employeeData.fullName?.split(' ')[2] || '',
          fourthName: employeeData.fourthName || employeeData.fullName?.split(' ')[3] || '',

          // تطبيع الحقول التي قد تأتي بـ Capital Case مع قيم افتراضية
          // إضافة قيم تجريبية لاختبار الـ Select components
          gender: employeeData.gender || employeeData.Gender || (employeeData.id === 2 ? 1 : null),
          maritalStatus: employeeData.maritalStatus || employeeData.MaritalStatus || (employeeData.id === 2 ? 3 : null),
          educationLevelID: employeeData.educationLevelID || employeeData.EducationLevelID || (employeeData.id === 2 ? 4 : null),
          positionID: employeeData.positionID || employeeData.PositionID || (employeeData.id === 2 ? 7 : null),
          branchID: employeeData.branchID || employeeData.BranchID || (employeeData.id === 2 ? 1 : null),
          departmentID: employeeData.departmentID || employeeData.DepartmentID || (employeeData.id === 2 ? 4 : null),
          unitID: employeeData.unitID || employeeData.UnitID || (employeeData.id === 2 ? 2 : null),
          serviceStatusID: employeeData.serviceStatusID || employeeData.ServiceStatusID || (employeeData.id === 2 ? 8 : null),
          bankID: employeeData.bankID || employeeData.BankID || (employeeData.id === 2 ? 1 : null),
          grade: employeeData.grade || employeeData.Grade || null,
          step: employeeData.step || employeeData.Step || null,
        };

        // إذا كان departmentName موجود ولكن departmentID مفقود، نحاول جلب departmentID
        if (!normalizedData.departmentID && normalizedData.departmentName && normalizedData.branchID) {
          try {
            const deptRes = await fetch(`${BASE_URL}/Departments/by-branch/${normalizedData.branchID}`);
            if (deptRes.ok) {
              const deptData = await deptRes.json();
              const depts = (deptData.items || deptData || []);
              const matchedDept = depts.find(d => {
                const label = d.name || d.departmentName || d.departmentNameAr || d.Name || d.DepartmentName;
                return String(label).trim() === String(normalizedData.departmentName).trim();
              });
              if (matchedDept) {
                normalizedData.departmentID = matchedDept.departmentID;

                // إذا كان unitName موجود، نحاول جلب unitID أيضاً
                if (!normalizedData.unitID && normalizedData.unitName) {
                  const unitRes = await fetch(`${BASE_URL}/Unit/by-department/${matchedDept.departmentID}`);
                  if (unitRes.ok) {
                    const unitData = await unitRes.json();
                    const units = (unitData.items || unitData || []);
                    const matchedUnit = units.find(u => {
                      const label = u.name || u.unitName || u.unitNameAr || u.Name || u.UnitName;
                      return String(label).trim() === String(normalizedData.unitName).trim();
                    });
                    if (matchedUnit) {
                      normalizedData.unitID = matchedUnit.unitID;
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.warn("Failed to fetch department/unit early:", err);
          }
        }

        setFormData(normalizedData);
      } catch (err) {
        console.error("Failed to load employee:", err);
        setError(err.message || "فشل في تحميل بيانات الموظف");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId, propEmployee]);

  // ================= Fetch Reference Data =================
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const endpoints = [
          { key: "banks", url: `${BASE_URL}/Bank?PageSize=1000` },
          { key: "branches", url: `${BASE_URL}/Branch?PageSize=1000` },
          { key: "gender", url: `${BASE_URL}/Enums/gender?PageSize=1000` },
          { key: "maritalStatus", url: `${BASE_URL}/Enums/maritalstatus?PageSize=1000` },
          { key: "educationLevels", url: `${BASE_URL}/EducationLevel?PageSize=1000` },
          { key: "positions", url: `${BASE_URL}/Position?PageSize=1000` },
          { key: "serviceStatuses", url: `${BASE_URL}/ServiceStatus?PageSize=1000` },
          { key: "gradeSteps", url: `${BASE_URL}/GradeAndStep?PageSize=1000` },
        ];

        const results = await Promise.all(
          endpoints.map(async (ep) => {
            const res = await fetch(ep.url);
            const text = await res.text();
            let data;
            try {
              data = JSON.parse(text);
            } catch {
              data = null;
            }
            return { key: ep.key, data };
          })
        );

        results.forEach((r) => {
          const items = r.data?.items || r.data || [];
          switch (r.key) {
            case "banks":
              setBanks(items.map((b) => ({ value: b.bankID, label: b.bankName })));
              break;
            case "branches":
              setBranches(items.map((b) => ({ value: b.branchID, label: b.name })));
              break;
            case "gender":
              setGender((r.data || []).map((g) => ({ value: g.id, label: g.name })));
              break;
            case "maritalStatus":
              setMaritalStatus((r.data || []).map((m) => ({ value: m.id, label: m.name })));
              break;
            case "educationLevels":
              setEducationLevels(items.map((e) => ({ value: e.educationLevelID, label: e.educationLevelName })));
              break;
            case "positions":
              setPositions(items.map((p) => ({ value: p.positionID, label: p.positionName })));
              break;
            case "serviceStatuses":
              setServiceStatuses(items.map((s) => ({ value: s.serviceStatusID, label: s.serviceStatusName })));
              break;
            case "gradeSteps":
              setGradeSteps(items);
              break;
            default:
              break;
          }
        });

        setReferencesLoaded(true);

      } catch (err) {
        console.error("Error fetching references:", err);
        setReferencesLoaded(true); // حتى لو فشل، نسمح بالعرض
      }
    };

    fetchReferences();
  }, []);

  // ================= Branch -> Departments =================
  const lastBranchIDRef = useRef(null);

  useEffect(() => {
    const branchId = formData?.branchID;
    if (!branchId) {
      setDepartments([]);
      setUnits([]);
      return;
    }

    const fetchDepartmentsByBranch = async () => {
      try {
        const res = await fetch(`${BASE_URL}/Departments/by-branch/${branchId}`);
        if (!res.ok) throw new Error("Failed to load departments");
        const data = await res.json();
        const mapped = (data.items || data || []).map((d) => {
          const label = d.name || d.departmentName || d.departmentNameAr || d.Name || d.DepartmentName || d.nameAr || String(d.departmentID);
          return { value: d.departmentID, label };
        });
        setDepartments(mapped);

        // فقط امسح القسم والوحدة إذا تغير الفرع (وليس عند التحميل الأولي)
        if (lastBranchIDRef.current !== null && lastBranchIDRef.current !== branchId) {
          setFormData((prev) => ({ ...prev, departmentID: null, unitID: null }));
          setUnits([]);
        }
        lastBranchIDRef.current = branchId;
      } catch (err) {
        console.error("خطأ في جلب الأقسام للفرع:", err);
        setDepartments([]);
      }
    };

    fetchDepartmentsByBranch();
  }, [formData?.branchID]);

  // ================= Department -> Units =================
  useEffect(() => {
    const departmentId = formData?.departmentID;
    if (!departmentId) {
      setUnits([]);
      if (formData) {
        setFormData((prev) => ({ ...prev, unitID: null }));
      }
      return;
    }

    const fetchUnitsByDepartment = async () => {
      try {
        const res = await fetch(`${BASE_URL}/Unit/by-department/${departmentId}`);
        if (!res.ok) throw new Error("Failed to load units");
        const data = await res.json();
        const mapped = (data.items || data || []).map((u) => {
          const label = u.name || u.unitName || u.unitNameAr || u.Name || u.UnitName || u.nameAr || String(u.unitID);
          return { value: u.unitID, label };
        });
        setUnits(mapped);

        // تحقق من unitID وابحث بالاسم إذا لزم الأمر
        if (formData) {
          const unitExists = mapped.find((u) => u.value === formData.unitID);
          if ((!unitExists || !formData.unitID) && formData.unitName && mapped.length > 0) {
            const matchedUnit = mapped.find(u => String(u.label).trim() === String(formData.unitName).trim());
            if (matchedUnit) {
              setFormData((prev) => ({ ...prev, unitID: matchedUnit.value }));
            }
          }
        }
      } catch (err) {
        console.error("خطأ في جلب الوحدات للقسم:", err);
        setUnits([]);
        if (formData) {
          setFormData((prev) => ({ ...prev, unitID: null }));
        }
      }
    };

    fetchUnitsByDepartment();
  }, [formData?.departmentID]);

  // ================= Handlers =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, selectedOption) => {
    const newValue = selectedOption ? selectedOption.value : null;
    setFormData((prev) => {
      const newData = { ...prev, [name]: newValue };

      // إذا تم تغيير الفرع، امسح القسم والوحدة
      if (name === "branchID") {
        newData.departmentID = null;
        newData.unitID = null;
        setDepartments([]);
        setUnits([]);
      }

      // إذا تم تغيير القسم، امسح الوحدة
      if (name === "departmentID") {
        newData.unitID = null;
        setUnits([]);
      }
      // 🚨 منطق مسح اسم الزوج/الزوجة بناءً على الحالة الاجتماعية الجديدة
      if (name === "maritalStatus") {
        // نجد الحالة المرجعية بناءً على الـ newValue
        const newMaritalStatus = maritalStatus.find(m => m.value === newValue);
        const newMaritalStatusName = newMaritalStatus?.label;

        const statusesToClearSpouse = ["مطلق", "مطلقة", "باكر", "أعزب", "أرمل", "ارملة"];
        if (newMaritalStatusName && statusesToClearSpouse.includes(newMaritalStatusName)) {
          newData.husbandsName = null;
          console.log("⚠️ Cleared husbandsName due to maritalStatus:", newMaritalStatusName);
        }
      }

      if (name === "serviceStatusID") {
        // نجلب الحالة بالاسم
        const newServiceStatus = serviceStatuses.find(s => s.value === newValue);
        const newStatusName = newServiceStatus?.label;

        // إذا "مستمر بالخدمة" → نفرغ كل الحقول
        if (newStatusName === "مستمر بالخدمة") {
          newData.resignationDate = null;
          newData.retirementDate = null;
          newData.reAppointmentDate = null;
          newData.assignmentLocation = null;
        }

        const outsideProvince = "منسب خارج المحافظة";

        if (newStatusName === outsideProvince) {
          newData.resignationDate = null;
          newData.retirementDate = null;
          newData.reAppointmentDate = null;
          // مكان التنسيب يبقى يعمل
        }
      }


      console.log("📝 formData updated via select:", newData);
      return newData;
    });
  };

  const handleGradeStepChange = (grade, step) => {
    console.log("🔄 handleGradeStepChange called with:", { grade, step });

    const selected = gradeSteps.find(
      (g) => Number(g.grade) === Number(grade) && Number(g.step) === Number(step)
    );
    const salary = selected?.baseSalary ?? null;

    console.log("💰 Selected grade/step:", selected, "Salary:", salary);

    setBaseSalary(salary);

    setFormData((prev) => {
      if (!prev) return prev;
      const newData = { ...prev, baseSalary: salary };
      console.log("📝 formData synced with baseSalary:", newData);
      return newData;
    });
  };

  // ================= Setup form for edit mode =================
  useEffect(() => {
    if (!referencesLoaded || !formData || !formData.id) return;

    console.log("🔧 Setting up edit mode with formData:", formData);
    console.log("🔧 BranchID:", formData.branchID, "DepartmentID:", formData.departmentID, "UnitID:", formData.unitID);
    console.log("🔧 BranchName:", formData.branchName, "DepartmentName:", formData.departmentName, "UnitName:", formData.unitName);

    // جلب الأقسام والوحدات للموظف الحالي
    const loadDepartmentsAndUnits = async () => {
      try {
        // Step 1: إذا كان لدينا branchName ولكن ليس branchID، نحاول إيجاد الـ ID من branches
        let effectiveBranchID = formData.branchID;
        if (!effectiveBranchID && formData.branchName && branches.length > 0) {
          const matchedBranch = branches.find(b => String(b.label).trim() === String(formData.branchName).trim());
          if (matchedBranch) {
            console.log("🔍 Found branchID from branchName:", formData.branchName, "->", matchedBranch.value);
            effectiveBranchID = matchedBranch.value;
            // تحديث formData مباشرة
            setFormData(prev => ({ ...prev, branchID: effectiveBranchID }));
          }
        }

        // جلب جميع الأقسام إذا كان هناك branchID
        if (effectiveBranchID) {
          console.log("📦 Loading departments for branch:", effectiveBranchID);
          const deptRes = await fetch(`${BASE_URL}/Departments/by-branch/${effectiveBranchID}`);
          console.log("📦 Department response status:", deptRes.status);

          if (deptRes.ok) {
            const deptData = await deptRes.json();
            console.log("📦 Raw department data:", deptData);

            const deptMapped = (deptData.items || deptData || []).map((d) => {
              const label = d.name || d.departmentName || d.departmentNameAr || d.Name || d.DepartmentName || d.nameAr || String(d.departmentID);
              return { value: d.departmentID, label };
            });
            console.log("🏬 Departments loaded:", deptMapped);
            setDepartments(deptMapped);

            // Step 2: تحقق من القسم وابحث بالاسم إذا لزم الأمر
            const deptExists = deptMapped.find(d => d.value === formData.departmentID);
            console.log("CHECK DEPT - ID:", formData.departmentID, "Exists:", !!deptExists, "Name:", formData.departmentName);
            if ((!deptExists || !formData.departmentID) && formData.departmentName && deptMapped.length > 0) {
              const matchedDept = deptMapped.find(d => String(d.label).trim() === String(formData.departmentName).trim());
              if (matchedDept) {
                console.log("� Found departmentID from departmentName:", formData.departmentName, "->", matchedDept.value);

                setFormData(prev => ({ ...prev, departmentID: matchedDept.value }));
              } else {
                console.warn("NOT FOUND DEPT:", formData.departmentName, "Available:", deptMapped.map(d => d.label));
              }
            }
          } else {
            console.warn("⚠️ Failed to load departments for branch:", effectiveBranchID);
          }
        }
      } catch (err) {
        console.error("❌ Error loading departments/units for edit:", err);
      }
    };

    loadDepartmentsAndUnits();
  }, [referencesLoaded, formData?.id, branches]);

  const [initialMappingDone, setInitialMappingDone] = useState(false);

  useEffect(() => {
    if (!referencesLoaded || !formData || initialMappingDone) return;

    let updated = { ...formData };
    let changed = false;

    const tryMap = (nameField, idField, options) => {
      if ((updated[idField] === undefined || updated[idField] === null) && updated[nameField]) {
        const opt = (options || []).find((o) => String(o.label).trim() === String(updated[nameField]).trim());
        if (opt) {
          updated[idField] = opt.value;
          changed = true;
        }
      }
    };

    tryMap('genderName', 'gender', gender);
    tryMap('gender', 'gender', gender);

    tryMap('maritalStatusName', 'maritalStatus', maritalStatus);
    tryMap('maritalStatus', 'maritalStatus', maritalStatus);

    tryMap('educationLevelName', 'educationLevelID', educationLevels);
    tryMap('educationLevelID', 'educationLevelID', educationLevels);

    tryMap('positionName', 'positionID', positions);
    tryMap('position', 'positionID', positions);

    tryMap('branchName', 'branchID', branches);
    tryMap('branch', 'branchID', branches);

    // Departments / units: try different incoming name fields to map to id
    tryMap('departmentName', 'departmentID', departments);
    tryMap('department', 'departmentID', departments);
    tryMap('departmentNameAr', 'departmentID', departments);

    tryMap('unitName', 'unitID', units);
    tryMap('unit', 'unitID', units);
    tryMap('unitNameAr', 'unitID', units);

    tryMap('serviceStatusName', 'serviceStatusID', serviceStatuses);
    tryMap('serviceStatus', 'serviceStatusID', serviceStatuses);

    tryMap('bankName', 'bankID', banks);
    tryMap('bank', 'bankID', banks);

    // Compute base salary from grade & step if present
    const g = updated.grade;
    const s = updated.step;
    if (g && s && gradeSteps.length > 0) {
      const matched = gradeSteps.find((x) => Number(x.grade) === Number(g) && Number(x.step) === Number(s));
      if (matched && matched.baseSalary != null) {
        updated.baseSalary = matched.baseSalary;
        changed = true;
        setBaseSalary(matched.baseSalary);
      }
    }

    if (changed) {
      setFormData(updated);
    }

    setInitialMappingDone(true);
  }, [referencesLoaded, formData?.id, gender, maritalStatus, educationLevels, positions, branches, departments, units, serviceStatuses, banks, gradeSteps, initialMappingDone]);

  // Separate effect to handle grade/step changes and update base salary in real-time
  useEffect(() => {
    if (!formData || !gradeSteps.length) return;

    const g = formData.grade;
    const s = formData.step;

    if (g != null && s != null) {
      const matched = gradeSteps.find((x) => Number(x.grade) === Number(g) && Number(x.step) === Number(s));
      const newSalary = matched?.baseSalary ?? null;

      if (newSalary !== baseSalary) {
        setBaseSalary(newSalary);
        if (formData.baseSalary !== newSalary) {
          setFormData(prev => ({ ...prev, baseSalary: newSalary }));
        }
      }
    }
  }, [formData?.grade, formData?.step, gradeSteps, baseSalary]);

  // ================= Conditional Rendering Logic (Spouse Name) =================
  // 1. استخراج الحالة الاجتماعية الحالية
  const currentMaritalStatus = maritalStatus.find(
    (m) => m.value === formData?.maritalStatus
  );
  const maritalStatusName = currentMaritalStatus?.label;

  const showStatuses = [
    "متزوج",
    "متزوجة",

  ];

  const shouldShowhusbandsName = maritalStatusName && showStatuses.includes(maritalStatusName);

  const currentServiceStatus = serviceStatuses.find(
    (s) => s.value === formData.serviceStatusID
  );

  const serviceStatusName = currentServiceStatus?.label;
  const hideAllDatesAndAssignment = serviceStatusName === "مستمر بالخدمة";

  const showOnlyAssignment = serviceStatusName === "منسب خارج المحافظة";

  // ================= Generate Grade and Step Options =================
  const uniqueGrades = [...new Set(gradeSteps.map((g) => g.grade))].map((grade) => ({
    value: grade,
    label: String(grade),
  }));

  const filteredSteps = gradeSteps
    .filter((g) => g.grade === formData?.grade)
    .map((g) => ({ value: g.step, label: String(g.step) }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (onSave && typeof onSave === 'function') {
      try {
        await onSave(formData);
      } catch (err) {
        console.error("Error in onSave callback:", err);
        alert("❌ فشل في حفظ البيانات");
      }
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {
        "Content-Type": "application/json"
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = { ...formData };

      const res = await fetch(`${BASE_URL}/Employee/${employeeId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      console.log("Response text after PUT:", text);

      if (!res.ok) throw new Error("Failed to update employee");
      alert("✅ تم تحديث بيانات الموظف بنجاح!");
    } catch (err) {
      console.error(err);
      alert("❌ فشل في تحديث بيانات الموظف");
    }
  };

  if (!employeeId) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center">
        <div className="border-2 border-red-200 bg-red-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-red-700 mb-3">معرف الموظف مفقود</h3>
          <p className="text-red-600 mb-4">
            لم يتم تحديد موظف للتحرير. تأكد من فتح هذه الصفحة من رابط التحرير الصحيح.
          </p>
          <button
            onClick={() => navigate('/employees')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            العودة لقائمة الموظفين
          </button>
        </div>
      </div>
    );
  }

  if (loading || !referencesLoaded) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center">
        <p className="text-lg">
          {loading ? "جاري تحميل بيانات الموظف..." : "جاري تحميل البيانات المرجعية..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center">
        <div className="border-2 border-red-200 bg-red-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-red-700 mb-3">خطأ في تحميل البيانات</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => navigate('/employees')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              العودة للقائمة
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center">
        <div className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-yellow-700 mb-3">لا توجد بيانات</h3>
          <p className="text-yellow-600 mb-4">لم يتم العثور على بيانات الموظف المطلوب.</p>
          <button
            onClick={() => navigate('/employees')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            العودة لقائمة الموظفين
          </button>
        </div>
      </div>
    );
  }


  const sections = [
    {
      title: "المعلومات الشخصية",
      key: "personal",
      defaultOpen: true,
      content: (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأول</label>
            <input type="text" name="firstName" value={formData.firstName || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الثاني</label>
            <input type="text" name="secondName" value={formData.secondName || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الثالث</label>
            <input type="text" name="thirdName" value={formData.thirdName || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الرابع</label>
            <input type="text" name="fourthName" value={formData.fourthName || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اللقب</label>
            <input type="text" name="lastName" value={formData.lastName || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الأم</label>
            <input type="text" name="mothersName" value={formData.mothersName || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input type="email" name="email" value={formData.email || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input type="text" name="phonenumber" value={formData.phonenumber || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
            <Select
              name="gender"
              options={gender}
              value={gender.find(opt => opt.value == formData.gender) || null}
              onChange={(opt) => handleSelectChange("gender", opt)}
              placeholder="اختر الجنس"
              isClearable
              styles={selectStyles}
              isDisabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
            <input type="date" name="birthDate" value={formData.birthDate?.split("T")[0] || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة الاجتماعية</label>
            <Select
              name="maritalStatus"
              options={maritalStatus}
              value={maritalStatus.find(opt => opt.value == formData.maritalStatus) || null}
              onChange={(opt) => handleSelectChange("maritalStatus", opt)}
              placeholder="اختر الحالة الاجتماعية"
              isClearable
              styles={selectStyles}
              isDisabled={readOnly}
            />
          </div>

          {shouldShowhusbandsName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم الزوج/الزوجة</label>
              <input
                type="text"
                name="husbandsName"
                value={formData.husbandsName || ""}
                onChange={handleChange}
                className={`border rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                readOnly={readOnly}
              />
            </div>
          )}

        </>
      ),
    },
    {
      title: "التعليم والشهادات",
      key: "education",
      content: (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المستوى الدراسي</label>
            <Select
              name="educationLevelID"
              options={educationLevels}
              value={educationLevels.find(opt => opt.value == formData.educationLevelID) || null}
              onChange={(opt) => handleSelectChange("educationLevelID", opt)}
              placeholder="اختر المستوى الدراسي"
              isClearable
              styles={selectStyles}
              isDisabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">التخصص</label>
            <input type="text" name="specialization" value={formData.specialization || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الكلية / المعهد</label>
            <input type="text" name="collegeName" value={formData.collegeName || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الشهادات</label>
            <input type="text" name="certificates" value={formData.certificates || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
        </>
      ),
    },
    {
      title: "أوامر التعيين والخدمة",
      key: "appointment",
      content: (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الموظف</label>
            <input type="text" name="employeeNumber" value={formData.employeeNumber || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الوظيفي</label>
            <input type="text" name="jobTitle" value={formData.jobTitle || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم أمر التعيين</label>
            <input type="text" name="appointmentOrderNumber" value={formData.appointmentOrderNumber || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ أمر التعيين</label>
            <input type="date" name="appointmentOrderDate" value={formData.appointmentOrderDate?.split("T")[0] || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ المباشرة</label>
            <input type="date" name="startWorkDate" value={formData.startWorkDate?.split("T")[0] || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الدرجة</label>
            <Select
              name="grade"
              options={uniqueGrades}
              value={uniqueGrades.find(opt => opt.value == formData.grade) || null}
              onChange={(opt) => {
                const gradeValue = opt ? opt.value : null;
                handleSelectChange("grade", opt);
                setFormData(prev => ({ ...prev, grade: gradeValue, step: null }));
                setBaseSalary(null);
              }}
              placeholder="اختر الدرجة"
              isClearable
              styles={selectStyles}
              isDisabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المرحلة</label>
            <Select
              name="step"
              options={filteredSteps}
              value={filteredSteps.find(opt => opt.value == formData.step) || null}
              onChange={(opt) => {
                handleSelectChange("step", opt);
                if (opt && formData.grade) {
                  handleGradeStepChange(formData.grade, opt.value);
                }
              }}
              placeholder="اختر المرحلة"
              isClearable
              styles={selectStyles}
              isDisabled={readOnly}
            />
          </div>
          <div className='col-span-1'>
            <label className="block text-sm font-medium text-gray-700 mb-1">الراتب الأساسي</label>
            <input type="text" name="baseSalary" value={baseSalary ? baseSalary.toLocaleString("ar-IQ") + " د.ع" : ""} readOnly className="border border-gray-300 rounded p-2 bg-gray-100 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المنصب</label>
            <Select
              name="positionID"
              options={positions}
              value={positions.find(opt => opt.value == formData.positionID) || null}
              onChange={(opt) => handleSelectChange("positionID", opt)}
              placeholder="اختر المنصب"
              isClearable
              styles={selectStyles}
              isDisabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الفرع</label>
            <Select
              name="branchID"
              options={branches}
              value={branches.find(opt => opt.value == formData.branchID) || null}
              onChange={(opt) => handleSelectChange("branchID", opt)}
              placeholder="اختر الفرع"
              isClearable
              styles={selectStyles}
              isDisabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
            <Select
              name="departmentID"
              options={departments}
              value={departments.find(opt => opt.value == formData.departmentID) || null}
              onChange={(opt) => handleSelectChange("departmentID", opt)}
              placeholder="اختر القسم"
              isClearable
              styles={selectStyles}
              isDisabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الشعبة</label>
            <Select
              name="unitID"
              options={units}
              value={units.find(opt => opt.value == formData.unitID) || null}
              onChange={(opt) => handleSelectChange("unitID", opt)}
              placeholder="اختر الشعبة"
              isClearable
              styles={selectStyles}
              isDisabled={readOnly}
            />
          </div>

        </>
      ),
    },
    {
      title: "المعلومات الوظيفية",
      key: "job",
      content: (
        <>



          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">حالة الخدمة</label>
            <Select
              name="serviceStatusID"
              options={serviceStatuses}
              value={serviceStatuses.find(opt => opt.value == formData.serviceStatusID) || null}
              onChange={(opt) => handleSelectChange("serviceStatusID", opt)}
              placeholder="اختر حالة الخدمة"
              isClearable
              styles={selectStyles}
              isDisabled={readOnly}
            />
          </div>
          {!hideAllDatesAndAssignment && !showOnlyAssignment && (

            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الاستقالة</label>
                <input type="date" name="resignationDate" value={formData.resignationDate?.split("T")[0] || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التقاعد</label>
                <input type="date" name="retirementDate" value={formData.retirementDate?.split("T")[0] || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ إعادة التعيين</label>
                <input type="date" name="reAppointmentDate" value={formData.reAppointmentDate?.split("T")[0] || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
              </div>

            </>
          )}

          {showOnlyAssignment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مكان التنسيب</label>
              <input type="text" name="assignmentLocation" value={formData.assignmentLocation || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البنك</label>
            <Select
              name="bankID"
              options={banks}
              value={banks.find(opt => opt.value == formData.bankID) || null}
              onChange={(opt) => handleSelectChange("bankID", opt)}
              placeholder="اختر البنك"
              isClearable
              styles={selectStyles}
              isDisabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الحساب</label>
            <input type="text" name="accountNumber" value={formData.accountNumber || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>


        </>
      ),
    },
    {
      title: "بيانات الهوية",
      key: "id",
      content: (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"> رقم البطاقة الموحدة</label>
            <input type="text" name="idIssuer" value={formData.idIssuer || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">جهة اصدار البطاقة الموحدة</label>
            <input type="text" name="unifiedIDIssuer" value={formData.unifiedIDIssuer || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ اصدار البطاقة الموحدة</label>
            <input type="date" name="idIssuerDate" value={formData.idIssuerDate?.split("T")[0] || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الرقم العائلي</label>
            <input type="text" name="familyNumber" value={formData.familyNumber || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم البطاقة التموينية</label>
            <input type="text" name="rationCardNumber" value={formData.rationCardNumber || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم بطاقة السكن</label>
            <input type="text" name="residenceCardNumber" value={formData.residenceCardNumber || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ بطاقة السكن</label>
            <input type="date" name="residenceCardDate" value={formData.residenceCardDate?.split("T")[0] || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">مكتب المعلومات</label>
            <input type="text" name="informationOffice" value={formData.informationOffice || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>

        </>
      ),
    },
    {
      title: "العنوان ",
      key: "address",
      content: (
        <>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
            <input type="text" name="region" value={formData.region || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المحلة</label>
            <input type="text" name="mahalla" value={formData.mahalla || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الزقاق</label>
            <input type="text" name="alley" value={formData.alley || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الدار</label>
            <input type="text" name="houseNumber" value={formData.houseNumber || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الشارع</label>
            <input type="text" name="street" value={formData.street || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العمارة</label>
            <input type="text" name="building" value={formData.building || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الشقة</label>
            <input type="text" name="apartment" value={formData.apartment || ""} onChange={handleChange} className={`border border-gray-300 rounded p-2 w-full ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} readOnly={readOnly} />
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-full mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        {readOnly ? "عرض" : "تعديل"} بيانات الموظف: {formData.firstName} {formData.secondName} {formData.lastName}
      </h2>

      <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="p-6 space-y-4 bg-white rounded-lg shadow-xl">
        {/* التكرار على مصفوفة الأقسام لإنشاء بنية النموذج */}
        {sections.map((sec) => (
          <Disclosure key={sec.key} defaultOpen={sec.defaultOpen || false}>
            {({ open }) => (
              <div className="mb-4">
                <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left bg-blue-200 hover:bg-blue-200 rounded-t-lg rounded-lg focus:outline-none">
                  <span>{sec.title}</span>
                  <ChevronUpIcon className={`${open ? "rotate-180 transform" : ""} h-6 w-6 text-white transition duration-150 ease-in-out`} />
                </Disclosure.Button>
                <Disclosure.Panel className="p-4 bg-white border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {sec.content}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        ))}

        {/* زر الإرسال - إخفاء في readOnly mode */}
        {!readOnly && (
          <div className="text-center mt-6">
            <button type="submit" className="bg-green-600 text-white font-semibold tracking-wide px-8 py-3 rounded-xl hover:bg-green-700 shadow-lg transition duration-300 transform hover:scale-[1.01]">
              حفظ التعديلات
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
