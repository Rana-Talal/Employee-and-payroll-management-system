/**
 * @fileoverview Type definitions for API models
 * تعريفات الأنواع لجميع نماذج البيانات في النظام
 */

// ============================================
// Enums - التعدادات
// ============================================

/**
 * @typedef {0|1} Gender
 * @description 0 = ذكر، 1 = أنثى
 */

/**
 * @typedef {0|1|2|3} MaritalStatus
 * @description 0 = أعزب، 1 = متزوج، 2 = مطلق، 3 = أرمل
 */

/**
 * @typedef {number} LetterType
 * @description نوع الكتاب الإداري
 */

/**
 * @typedef {number} Period
 * @description المدة
 */

/**
 * @typedef {number} ServiceType
 * @description نوع الخدمة
 */

/**
 * @typedef {number} ActionType
 * @description نوع الإجراء
 */

// ============================================
// DTOs - كائنات نقل البيانات
// ============================================

/**
 * @typedef {Object} AddAdministrativeOrderDTO
 * @property {number} employeeID - معرف الموظف
 * @property {LetterType} letterType - نوع الكتاب
 * @property {Period} period - المدة
 * @property {string} reason - السبب
 * @property {string} adminOrderDate - تاريخ الأمر الإداري (ISO 8601)
 * @property {string} adminOrderNumber - رقم الأمر الإداري
 * @property {string|null} [periodOrderDate] - تاريخ أمر المدة (ISO 8601)
 * @property {string|null} [periodOrderNumber] - رقم أمر المدة
 */

/**
 * @typedef {Object} UpdateAdministrativeOrderDTO
 * @property {LetterType|null} [letterType] - نوع الكتاب
 * @property {Period|null} [period] - المدة
 * @property {string|null} [reason] - السبب
 * @property {string|null} [adminOrderDate] - تاريخ الأمر الإداري
 * @property {string|null} [adminOrderNumber] - رقم الأمر الإداري
 * @property {string|null} [periodOrderDate] - تاريخ أمر المدة
 * @property {string|null} [periodOrderNumber] - رقم أمر المدة
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} BankDTO
 * @property {string} bankName - اسم البنك
 */

/**
 * @typedef {Object} UpdateBankDTO
 * @property {string|null} [bankName] - اسم البنك
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} AddBranchDTO
 * @property {string} name - اسم الفرع
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} UpdateBranchDTO
 * @property {string|null} [name] - اسم الفرع
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} CourseEmployeeDTO
 * @property {number} courseId - معرف الدورة
 * @property {number} employeeId - معرف الموظف
 * @property {string|null} [notes] - ملاحظات
 * @property {number|null} [degree] - الدرجة
 */

/**
 * @typedef {Object} UpdateCourseEmployeeDTO
 * @property {string|null} [notes] - ملاحظات
 * @property {number|null} [degree] - الدرجة
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} CourseRegisterDTO
 * @property {string} courseName - اسم الدورة
 * @property {string} dateStart - تاريخ البدء (ISO 8601)
 * @property {string} dateEnd - تاريخ الانتهاء (ISO 8601)
 * @property {string} content - المحتوى
 * @property {string} teacher - المدرس
 * @property {string} fileContent - محتوى الملف
 * @property {string} type - النوع
 * @property {string} level - المستوى
 */

/**
 * @typedef {Object} UpdateCourseDTO
 * @property {string|null} [courseName] - اسم الدورة
 * @property {string|null} [dateStart] - تاريخ البدء
 * @property {string|null} [dateEnd] - تاريخ الانتهاء
 * @property {string|null} [content] - المحتوى
 * @property {string|null} [teacher] - المدرس
 * @property {string|null} [fileContent] - محتوى الملف
 * @property {string|null} [type] - النوع
 * @property {string|null} [level] - المستوى
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} DeductionTypeDTO
 * @property {number} deductionTypeID - معرف نوع الاستقطاع
 * @property {string} description - الوصف
 * @property {number} value - القيمة
 * @property {boolean} isPercentage - هل نسبة مئوية
 */

/**
 * @typedef {Object} AssignEmployeeDeductionDTO
 * @property {number} employeeID - معرف الموظف
 * @property {Array<DeductionTypeDTO>} deductions - قائمة الاستقطاعات
 */

/**
 * @typedef {Object} UpdateEmployeeDeductionDTO
 * @property {number|null} [deductionTypeID] - معرف نوع الاستقطاع
 * @property {number|null} [amount] - المبلغ
 * @property {number|null} [percentage] - النسبة المئوية
 * @property {string|null} [letterNumber] - رقم الكتاب
 * @property {string|null} [letterDate] - تاريخ الكتاب
 * @property {string|null} [notes] - ملاحظات
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} AddDepartmentDTO
 * @property {string} name - اسم القسم
 * @property {number} branchID - معرف الفرع
 */

/**
 * @typedef {Object} UpdateDepartmentDTO
 * @property {string|null} [name] - اسم القسم
 * @property {number|null} [branchID] - معرف الفرع
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} AddDisciplinaryActionDTO
 * @property {number} employeeID - معرف الموظف
 * @property {ActionType} actionType - نوع الإجراء
 * @property {string} adminOrderDate - تاريخ الأمر الإداري
 * @property {string} adminOrderNumber - رقم الأمر الإداري
 * @property {string|null} [reason] - السبب
 * @property {string|null} [cancelOrderNumber] - رقم أمر الإلغاء
 * @property {string|null} [cancelOrderDate] - تاريخ أمر الإلغاء
 */

/**
 * @typedef {Object} AddEducationLevelDTO
 * @property {string} educationLevelName - اسم المستوى التعليمي
 */

/**
 * @typedef {Object} AddEmployeeDTO
 * @property {string} firstName - الاسم الأول
 * @property {string} secondName - الاسم الثاني
 * @property {string} thirdName - الاسم الثالث
 * @property {string} fourthName - الاسم الرابع
 * @property {string} lastName - اللقب
 * @property {string} mothersName - اسم الأم
 * @property {string|null} [email] - البريد الإلكتروني
 * @property {string} phonenumber - رقم الهاتف (10 أرقام على الأقل)
 * @property {Gender} gender - الجنس
 * @property {string} birthDate - تاريخ الميلاد (ISO 8601)
 * @property {MaritalStatus} maritalStatus - الحالة الاجتماعية
 * @property {string|null} [husbandsName] - اسم الزوج
 * @property {number} educationLevelID - معرف المستوى التعليمي
 * @property {string|null} [specialization] - التخصص
 * @property {string|null} [collegeName] - اسم الكلية
 * @property {string|null} [certificates] - الشهادات
 * @property {string} appointmentOrderNumber - رقم أمر التعيين
 * @property {string|null} [appointmentOrderDate] - تاريخ أمر التعيين
 * @property {string|null} [startWorkDate] - تاريخ المباشرة
 * @property {string|null} [employeeNumber] - رقم الموظف
 * @property {string|null} [jobTitle] - المسمى الوظيفي
 * @property {number|null} [grade] - الدرجة
 * @property {number|null} [step] - المرحلة
 * @property {number} positionID - معرف المنصب
 * @property {number} branchID - معرف الفرع
 * @property {number|null} [departmentID] - معرف القسم
 * @property {number|null} [unitID] - معرف الوحدة
 * @property {string|null} [idIssuer] - جهة إصدار البطاقة
 * @property {string|null} [unifiedIDIssuer] - جهة إصدار البطاقة الموحدة
 * @property {string|null} [idIssuerDate] - تاريخ إصدار البطاقة
 * @property {string|null} [familyNumber] - رقم العائلة
 * @property {string|null} [rationCardNumber] - رقم البطاقة التموينية
 * @property {string|null} [residenceCardNumber] - رقم بطاقة السكن
 * @property {string|null} [residenceCardDate] - تاريخ بطاقة السكن
 * @property {string|null} [informationOffice] - مكتب المعلومات
 * @property {string|null} [region] - المنطقة
 * @property {string|null} [mahalla] - المحلة
 * @property {string|null} [alley] - الزقاق
 * @property {string|null} [houseNumber] - رقم الدار
 * @property {string|null} [street] - الشارع
 * @property {string|null} [building] - البناية
 * @property {string|null} [apartment] - الشقة
 */

/**
 * @typedef {Object} UpdateEmployeeDTO
 * @property {string|null} [firstName] - الاسم الأول
 * @property {string|null} [secondName] - الاسم الثاني
 * @property {string|null} [thirdName] - الاسم الثالث
 * @property {string|null} [fourthName] - الاسم الرابع
 * @property {string|null} [lastName] - اللقب
 * @property {string|null} [mothersName] - اسم الأم
 * @property {string|null} [email] - البريد الإلكتروني
 * @property {string|null} [phonenumber] - رقم الهاتف
 * @property {Gender|null} [gender] - الجنس
 * @property {string|null} [birthDate] - تاريخ الميلاد
 * @property {MaritalStatus|null} [maritalStatus] - الحالة الاجتماعية
 * @property {string|null} [husbandsName] - اسم الزوج
 * @property {number|null} [educationLevelID] - معرف المستوى التعليمي
 * @property {string|null} [specialization] - التخصص
 * @property {string|null} [collegeName] - اسم الكلية
 * @property {string|null} [certificates] - الشهادات
 * @property {string|null} [appointmentOrderNumber] - رقم أمر التعيين
 * @property {string|null} [appointmentOrderDate] - تاريخ أمر التعيين
 * @property {string|null} [startWorkDate] - تاريخ المباشرة
 * @property {string|null} [resignationDate] - تاريخ الاستقالة
 * @property {string|null} [retirementDate] - تاريخ التقاعد
 * @property {string|null} [reAppointmentDate] - تاريخ إعادة التعيين
 * @property {string|null} [employeeNumber] - رقم الموظف
 * @property {string|null} [jobTitle] - المسمى الوظيفي
 * @property {number|null} [grade] - الدرجة
 * @property {number|null} [step] - المرحلة
 * @property {number|null} [positionID] - معرف المنصب
 * @property {number|null} [branchID] - معرف الفرع
 * @property {number|null} [departmentID] - معرف القسم
 * @property {number|null} [unitID] - معرف الوحدة
 * @property {number|null} [serviceStatusID] - معرف حالة الخدمة
 * @property {string|null} [assignmentLocation] - موقع التكليف
 * @property {number|null} [bankID] - معرف البنك
 * @property {string|null} [accountNumber] - رقم الحساب
 * @property {string|null} [idIssuer] - جهة إصدار البطاقة
 * @property {string|null} [unifiedIDIssuer] - جهة إصدار البطاقة الموحدة
 * @property {string|null} [idIssuerDate] - تاريخ إصدار البطاقة
 * @property {string|null} [familyNumber] - رقم العائلة
 * @property {string|null} [rationCardNumber] - رقم البطاقة التموينية
 * @property {string|null} [residenceCardNumber] - رقم بطاقة السكن
 * @property {string|null} [residenceCardDate] - تاريخ بطاقة السكن
 * @property {string|null} [informationOffice] - مكتب المعلومات
 * @property {string|null} [region] - المنطقة
 * @property {string|null} [mahalla] - المحلة
 * @property {string|null} [alley] - الزقاق
 * @property {string|null} [houseNumber] - رقم الدار
 * @property {string|null} [street] - الشارع
 * @property {string|null} [building] - البناية
 * @property {string|null} [apartment] - الشقة
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} AddEmployeeServiceDTO
 * @property {number} employeeId - معرف الموظف
 * @property {ServiceType} serviceType - نوع الخدمة
 * @property {string} administrativeOrderDate - تاريخ الأمر الإداري
 * @property {string} administrativeOrderNumber - رقم الأمر الإداري
 * @property {string} dateStart - تاريخ البدء
 * @property {string} dateEnd - تاريخ الانتهاء
 * @property {number} day - اليوم
 * @property {number} month - الشهر
 * @property {number} year - السنة
 */

/**
 * @typedef {Object} UpdateEmployeeServiceDTO
 * @property {ServiceType|null} [serviceType] - نوع الخدمة
 * @property {string|null} [administrativeOrderDate] - تاريخ الأمر الإداري
 * @property {string|null} [administrativeOrderNumber] - رقم الأمر الإداري
 * @property {string|null} [dateStart] - تاريخ البدء
 * @property {string|null} [dateEnd] - تاريخ الانتهاء
 * @property {number|null} [day] - اليوم
 * @property {number|null} [month] - الشهر
 * @property {number|null} [year] - السنة
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} EntitlementTypeDTO
 * @property {number} entitlementTypeID - معرف نوع المخصصات
 * @property {string} description - الوصف
 * @property {number} value - القيمة
 * @property {boolean} isPercentage - هل نسبة مئوية
 */

/**
 * @typedef {Object} AssignEmployeeEntitlementDTO
 * @property {number} employeeID - معرف الموظف
 * @property {Array<EntitlementTypeDTO>} entitlements - قائمة المخصصات
 */

/**
 * @typedef {Object} UpdateEmployeeEntitlementDTO
 * @property {number|null} [entitlementTypeID] - معرف نوع المخصصات
 * @property {number|null} [amount] - المبلغ
 * @property {number|null} [percentage] - النسبة المئوية
 * @property {string|null} [letterNumber] - رقم الكتاب
 * @property {string|null} [letterDate] - تاريخ الكتاب
 * @property {string|null} [notes] - ملاحظات
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} GenerateSalaryDTO
 * @property {number} employeeID - معرف الموظف
 * @property {number} month - الشهر (1-12)
 * @property {number} year - السنة
 * @property {string|null} [notes] - ملاحظات
 */

/**
 * @typedef {Object} AddGradeStepDTO
 * @property {number} grade - الدرجة
 * @property {number} step - المرحلة
 * @property {number} baseSalary - الراتب الأساسي
 */

/**
 * @typedef {Object} UpdateGradeStepDTO
 * @property {number|null} [gradeStepID] - معرف الدرجة والمرحلة
 * @property {number|null} [grade] - الدرجة
 * @property {number|null} [step] - المرحلة
 * @property {number|null} [baseSalary] - الراتب الأساسي
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} AddPositionDTO
 * @property {string} positionName - اسم المنصب
 */

/**
 * @typedef {Object} UpdatePositionDTO
 * @property {string|null} [positionName] - اسم المنصب
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} RegisterUserDTO
 * @property {string} userName - اسم المستخدم (حد أقصى 50 حرف)
 * @property {string} fullName - الاسم الكامل (حد أقصى 100 حرف)
 * @property {string} email - البريد الإلكتروني
 * @property {string} phoneNumber - رقم الهاتف (10 أرقام على الأقل)
 * @property {string} password - كلمة المرور (6-50 حرف)
 * @property {number} roleID - معرف الدور
 */

/**
 * @typedef {Object} UpdateUserDTO
 * @property {string|null} [userName] - اسم المستخدم
 * @property {string|null} [fullName] - الاسم الكامل
 * @property {string|null} [email] - البريد الإلكتروني
 * @property {string|null} [phoneNumber] - رقم الهاتف
 * @property {string|null} [password] - كلمة المرور
 * @property {number|null} [roleID] - معرف الدور
 * @property {boolean|null} [isActive] - حالة التفعيل
 */

/**
 * @typedef {Object} LoginDTO
 * @property {string} userName - اسم المستخدم
 * @property {string} password - كلمة المرور
 */

// ============================================
// Response Models - نماذج الاستجابة
// ============================================

/**
 * @typedef {Object} AppreciationLetterResponse
 * @property {number} id - المعرف
 * @property {number} employeeID - معرف الموظف
 * @property {string} employeeFullName - اسم الموظف الكامل
 * @property {string|null} letterTypeName - اسم نوع الكتاب
 * @property {string|null} periodName - اسم المدة
 * @property {string} reason - السبب
 * @property {string} adminOrderDate - تاريخ الأمر الإداري
 * @property {string} adminOrderNumber - رقم الأمر الإداري
 * @property {string} periodOrderDate - تاريخ أمر المدة
 * @property {string} periodOrderNumber - رقم أمر المدة
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string|null} updatedAt - تاريخ التحديث
 * @property {boolean|null} isActive - حالة التفعيل
 */

/**
 * @typedef {Object} EmployeeResponse
 * @property {number} id - معرف الموظف
 * @property {string} firstName - الاسم الأول
 * @property {string} secondName - الاسم الثاني
 * @property {string} thirdName - الاسم الثالث
 * @property {string} fourthName - الاسم الرابع
 * @property {string} lastName - اللقب
 * @property {string} fullName - الاسم الكامل
 * @property {string} mothersName - اسم الأم
 * @property {string|null} email - البريد الإلكتروني
 * @property {string} phonenumber - رقم الهاتف
 * @property {Gender} gender - الجنس
 * @property {string} birthDate - تاريخ الميلاد
 * @property {MaritalStatus} maritalStatus - الحالة الاجتماعية
 * @property {number} educationLevelID - معرف المستوى التعليمي
 * @property {string|null} educationLevelName - اسم المستوى التعليمي
 * @property {number} positionID - معرف المنصب
 * @property {string|null} positionName - اسم المنصب
 * @property {number} branchID - معرف الفرع
 * @property {string|null} branchName - اسم الفرع
 * @property {number|null} departmentID - معرف القسم
 * @property {string|null} departmentName - اسم القسم
 * @property {number|null} grade - الدرجة
 * @property {number|null} step - المرحلة
 * @property {number|null} baseSalary - الراتب الأساسي
 * @property {boolean|null} isActive - حالة التفعيل
 */

/**
 * @typedef {Object} BranchResponse
 * @property {number} id - المعرف
 * @property {string} name - الاسم
 * @property {boolean|null} isActive - حالة التفعيل
 */

/**
 * @typedef {Object} DepartmentResponse
 * @property {number} id - المعرف
 * @property {string} name - الاسم
 * @property {number} branchID - معرف الفرع
 * @property {string|null} branchName - اسم الفرع
 * @property {boolean|null} isActive - حالة التفعيل
 */

/**
 * @typedef {Object} CourseResponse
 * @property {number} id - معرف الدورة
 * @property {string} courseName - اسم الدورة
 * @property {string} dateStart - تاريخ البدء
 * @property {string} dateEnd - تاريخ الانتهاء
 * @property {string} content - المحتوى
 * @property {string} teacher - المدرس
 * @property {string} type - النوع
 * @property {string} level - المستوى
 * @property {boolean|null} isActive - حالة التفعيل
 */

/**
 * @typedef {Object} GradeStepResponse
 * @property {number} gradeStepID - المعرف
 * @property {number} grade - الدرجة
 * @property {number} step - المرحلة
 * @property {number} baseSalary - الراتب الأساسي
 * @property {boolean|null} isActive - حالة التفعيل
 */

/**
 * @typedef {Object} BankResponse
 * @property {number} id - المعرف
 * @property {string} bankName - اسم البنك
 * @property {boolean|null} isActive - حالة التفعيل
 */

/**
 * @typedef {Object} PositionResponse
 * @property {number} id - المعرف
 * @property {string} positionName - اسم المنصب
 * @property {boolean|null} isActive - حالة التفعيل
 */

/**
 * @typedef {Object} DeductionTypeResponse
 * @property {number} deductionTypeID - المعرف
 * @property {string} deductionName - اسم الاستقطاع
 * @property {boolean} isPercentage - هل نسبة مئوية
 * @property {boolean} isFromFinalSalary - هل من الراتب النهائي
 * @property {boolean|null} isActive - حالة التفعيل
 */

/**
 * @typedef {Object} EntitlementTypeResponse
 * @property {number} entitlementTypeID - المعرف
 * @property {string} entitlementName - اسم المخصصات
 * @property {boolean} isPercentage - هل نسبة مئوية
 * @property {boolean|null} isActive - حالة التفعيل
 */

/**
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {Array<T>} items - قائمة العناصر
 * @property {number} totalCount - العدد الكلي
 * @property {number} totalPages - عدد الصفحات
 * @property {number} pageNumber - رقم الصفحة الحالية
 * @property {number} pageSize - حجم الصفحة
 */

// Export type utilities
export default {};
