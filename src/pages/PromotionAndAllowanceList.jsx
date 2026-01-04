// PromotionAndAllowanceList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Transition, Dialog } from "@headlessui/react";

// 🔹 مكوّن الطباعة (يعمل عبر window.open)
// 🔹 دالة الطباعة المحسّنة
const PrintReport = ({ employee, actionType }) => {
  const fullName = employee.fullName || "غير محدد";
  const department = employee.department || "غير محدد";
  const unit = employee.unit || "غير محدد";
  const today = new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  const printContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>تقرير الموافقة - ${actionType}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          width: 210mm;
          min-height: 297mm;
          margin: 0;
          padding: 25mm 20mm;
          box-sizing: border-box;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        .header h2 {
          font-size: 20px;
          font-weight: bold;
          margin: 0;
        }
        .content {
          line-height: 2;
          font-size: 16px;
          text-align: justify;
        }
        .signature {
          margin-top: 80px;
          text-align: left;
        }
        .info-line {
          margin: 8px 0;
        }
        @media print {
          body {
            padding: 15mm 20mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>م / احتساب العلاوة أو الترفيع</h2>
      </div>
      <div class="content">
        <p>تحية طيبة وبعد،</p>
        <p>
          استناداً إلى أحكام مجلس الوزراء القرار رقم (14) المنعقد بتاريخ (4/5/2008) وبناءً على ما أقره مجلس النواب طبقاً لأحكام المادة (61/أولاً) من الدستور،
          واستناداً إلى أحكام الفقرة (خامساً / أ) من المادة (138) من الدستور بإصدار قانون [(رقم (22) لسنة 2008)] قانون رواتب موظفي الدولة والقطاع العام،
        </p>
        <p>
          تقرر احتساب ${actionType === "ترقية" ? "ترفيع" : "علاوة"} السيد/ة (<strong>${fullName}</strong>) 
          ${actionType === "علاوة" 
            ? " لإكمال سنة خدمية فعلية في وظيفته وحسب الدرجة والمرحلة الوظيفية في سلم الرواتب." 
            : " بعد إكمال المدة القانونية المطلوبة للترفيع وفقاً للسلم الوظيفي."}
        </p>
        <div class="info-line"><strong>القسم:</strong> ${department}</div>
        <div class="info-line"><strong>الشعبة:</strong> ${unit}</div>
      </div>
      <div class="signature">
        <p>التاريخ: ${today}</p>
        <br />
        <p>
          <strong>المدير المسؤول</strong><br />
          الأستاذ / .....................
        </p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=800,height=900");
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  // لا نغلق النافذة فورًا حتى يكمل المستخدم الطباعة
};
// 🔹 مكوّن الإدخال المخصص (للعلاوة أو الترفيع فقط)
const ActionForm = ({ onAdd, onClose, gradeSteps, currentGrade, currentStep, currentSalary, actionType }) => {
  const [formData, setFormData] = useState({
    type: actionType,
    promotionOrderNumber: "",
    promotionOrderDate: "",
    year: new Date().getFullYear().toString(),
    entitlement: "",
    previousGrade: currentGrade?.toString() || "",
    previousStep: currentStep?.toString() || "",
    previousSalary: currentSalary?.toString() || "",
    newGrade: "",
    newStep: "",
    newSalary: "",
    entitlementDate: new Date().toISOString().split("T")[0],
    appreciationCount: "",
    allowanceOrderNumber: "",
    allowanceOrderDate: "",
    appreciationBookNumber: "",
    appreciationDate: "",
    reason: "",
    giver: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === "newGrade" || name === "newStep") {
      const grade = newFormData.newGrade;
      const step = newFormData.newStep;
      if (grade && step) {
        const selectedGradeStep = gradeSteps.find(
          (g) => g.grade === parseInt(grade) && g.step === parseInt(step)
        );
        newFormData.newSalary = selectedGradeStep ? selectedGradeStep.baseSalary.toString() : "";
      } else {
        newFormData.newSalary = "";
      }
    }

    setFormData(newFormData);
  };

  const handleAdd = () => {
    onAdd(formData);
  };

  const formFields = {
    ترقية: [
      { label: "رقم أمر الترقية", name: "promotionOrderNumber", type: "text" },
      { label: "تاريخ أمر الترقية", name: "promotionOrderDate", type: "date" },
      { label: "السنة", name: "year", type: "number" },
      { label: "الاستحقاق", name: "entitlement", type: "text" },
      { label: "الدرجة السابقة", name: "previousGrade", type: "text", readOnly: true },
      { label: "المرحلة السابقة", name: "previousStep", type: "text", readOnly: true },
      { label: "مقدار الراتب السابق", name: "previousSalary", type: "number", readOnly: true },
      { label: "الدرجة الجديدة", name: "newGrade", type: "select", options: [...new Set(gradeSteps.map((g) => g.grade))].map((g) => ({ value: g.toString(), label: g.toString() })) },
      { label: "المرحلة الجديدة", name: "newStep", type: "select", options: formData.newGrade ? [...new Set(gradeSteps.filter((g) => g.grade === parseInt(formData.newGrade)).map((g) => g.step))].map((s) => ({ value: s.toString(), label: s.toString() })) : [] },
      { label: "مقدار الراتب الجديد", name: "newSalary", type: "number", readOnly: false },
      { label: "تاريخ الاستحقاق", name: "entitlementDate", type: "date" },
    ],
    علاوة: [
      { label: "عدد الشكر والعقوبات (المحتسبة)", name: "appreciationCount", type: "number" },
      { label: "رقم الأمر الإداري للعلاوة", name: "allowanceOrderNumber", type: "text" },
      { label: "تاريخ الأمر الإداري للعلاوة", name: "allowanceOrderDate", type: "date" },
      { label: "رقم كتاب الشكر", name: "appreciationBookNumber", type: "text" },
      { label: "تاريخ الكتاب", name: "appreciationDate", type: "date" },
      { label: "السبب", name: "reason", type: "text" },
      { label: "جهة المنح", name: "giver", type: "text" },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
      <h3 className="text-xl font-bold mb-4 text-gray-800">إضافة {actionType}</h3>
      <div className="grid grid-cols-2 gap-4">
        {formFields[actionType]?.map((field, index) => (
          <div key={index} className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-700">{field.label}</label>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded p-2 text-sm"
                disabled={field.readOnly}
              >
                <option value="">اختر...</option>
                {field.options?.map((opt, idx) => (
                  <option key={idx} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                readOnly={field.readOnly}
                className={`border border-gray-300 rounded p-2 text-sm ${
                  field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6 space-x-2 rtl:space-x-reverse">
        <button
          type="button"
          onClick={handleAdd}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          حفظ
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
};

// 🔹 المكوّن الرئيسي
export default function PromotionAndAllowanceList({ allEmployees = [], gradeSteps = [] }) {
  const [allowanceList, setAllowanceList] = useState([]);
  const [promotionList, setPromotionList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentActionType, setCurrentActionType] = useState("علاوة");

  // التحقق من العقوبة النشطة
  const hasActivePenalty = (promotions) => {
    return Array.isArray(promotions) && promotions.some(p =>
      p.type === "عقوبة" &&
      (!p.cancelPenaltyOrderNumber || !p.cancelPenaltyDate)
    );
  };

  // المؤهلون للعلاوة
  const calculateAllowanceEligibility = useMemo(() => {
    return (emp) => {
      if (!emp.startWorkDate || hasActivePenalty(emp.promotions)) return false;
      const start = new Date(emp.startWorkDate);
      const now = new Date();
      const years = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
      return years >= 1;
    };
  }, []);

  // المؤهلون للترفيع
  const calculatePromotionEligibility = useMemo(() => {
    return (emp) => {
      if (!emp.startWorkDate || hasActivePenalty(emp.promotions)) return false;
      const start = new Date(emp.startWorkDate);
      const now = new Date();
      const years = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
      return years >= 4;
    };
  }, []);

  useEffect(() => {
    const allowance = allEmployees.filter(calculateAllowanceEligibility);
    const promotion = allEmployees.filter(calculatePromotionEligibility);
    setAllowanceList(allowance);
    setPromotionList(promotion);
  }, [allEmployees, calculateAllowanceEligibility, calculatePromotionEligibility]);

  // 🔹 فتح نموذج الإدخال
  const openForm = (employee, type) => {
    setSelectedEmployee(employee);
    setCurrentActionType(type);
    setShowModal(true);
  };

  // 🔹 حفظ الإجراء
  const handleAdd = (formData) => {
    console.log("تم حفظ الإجراء:", formData);
    // هنا يمكنك إرسال الطلب إلى API
    setShowModal(false);
  };

  // 🔹 طباعة التقرير
  const handlePrint = (employee, type) => {
    PrintReport({ employee, actionType: type });
  };

  return (
    <div className="space-y-8 p-4">
      {/* قسم العلاوة */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-3">الموظفون المستحقون للعلاوة</h3>
        {allowanceList.length === 0 ? (
          <p className="text-gray-500">لا يوجد مستحقين حاليًا.</p>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-right">الاسم الرباعي واللقب</th>
                <th className="py-2 px-3 text-right">اسم الأم</th>
                <th className="py-2 px-3 text-right">القسم</th>
                <th className="py-2 px-3 text-right">الشعبة</th>
                <th className="py-2 px-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {allowanceList.map((emp) => (
                <tr key={`allowance-${emp.id}`} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 text-right">{emp.fullName || "—"}</td>
                  <td className="py-2 px-3 text-right">{emp.mothersName || "—"}</td>
<td className="py-2 px-3 text-right">{emp.departmentID || "—"}</td>
<td className="py-2 px-3 text-right">{emp.unitID || "—"}</td>
                  <td className="py-2 px-3 text-center space-x-2">
                    <button
                      onClick={() => handlePrint(emp, "علاوة")}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      تقرير الموافقة
                    </button>
                    <button
                      onClick={() => openForm(emp, "علاوة")}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                    >
                      إضافة علاوة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* قسم الترفيع */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 mb-3">الموظفون المستحقون للترفيع</h3>
        {promotionList.length === 0 ? (
          <p className="text-gray-500">لا يوجد مستحقين حاليًا.</p>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-right">الاسم الرباعي واللقب</th>
                <th className="py-2 px-3 text-right">اسم الأم</th>
                <th className="py-2 px-3 text-right">القسم</th>
                <th className="py-2 px-3 text-right">الشعبة</th>
                <th className="py-2 px-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {promotionList.map((emp) => (
                <tr key={`promotion-${emp.id}`} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 text-right">{emp.fullName || "—"}</td>
                  <td className="py-2 px-3 text-right">{emp.mothersName || "—"}</td>
                  <td className="py-2 px-3 text-right">{emp.departmentID || "—"}</td>
                  <td className="py-2 px-3 text-right">{emp.unitID || "—"}</td>
                  <td className="py-2 px-3 text-center space-x-2">
                    <button
                      onClick={() => handlePrint(emp, "ترقية")}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      تقرير الموافقة
                    </button>
                    <button
                      onClick={() => openForm(emp, "ترقية")}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                    >
                      إضافة ترفيع
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Modal للإدخال */}
      <Transition appear show={showModal} as="div">
        <Dialog as="div" className="relative z-50" onClose={() => setShowModal(false)}>
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
                  <ActionForm
                    onAdd={handleAdd}
                    onClose={() => setShowModal(false)}
                    gradeSteps={gradeSteps}
                    currentGrade={selectedEmployee?.grade}
                    currentStep={selectedEmployee?.step}
                    currentSalary={selectedEmployee?.baseSalary}
                    actionType={currentActionType}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}