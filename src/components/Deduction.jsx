import React, { useState, useEffect } from "react";
import { PlusCircleIcon, MinusCircleIcon, TrashIcon } from "lucide-react";
import { formatNumber } from "../utils/formatNumber";

export default function Deduction({ employee, deductions, setDeductions, entitlements = [] }) {
  const employeeID = employee?.id || employee?.employeeID || employee?.employeeNumber;
  const [types, setTypes] = useState([]);
  const [options, setOptions] = useState([]);
  const [form, setForm] = useState({
    deductionID: null,
    deductionTypeID: "",
    deductionOptionID: "",
    amount: "",
    percentage: "",
    letterNumber: "",
    letterDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const BASE_URL = "/api";

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch types
  const fetchTypes = async () => {
    try {
      const res = await fetch(`${BASE_URL}/DeductionType?PageSize=1000`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setTypes(data.items || []);
    } catch (e) {
      console.error("fetchTypes error:", e);
    }
  };

  // Fetch options
  const fetchOptions = async (typeID) => {
    try {
      const res = await fetch(`${BASE_URL}/DeductionOption?PageSize=1000`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const filtered = (data.items || []).filter(o => o.deductionTypeID == typeID && o.isActive);
      setOptions(filtered);
    } catch (e) {
      console.error("fetchOptions error:", e);
      setOptions([]);
    }
  };

  // Fetch employee deductions
  const fetchDeductions = async () => {
    if (!employeeID) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/Deductions?employeeID=${employeeID}&PageSize=1000`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setDeductions(data.items || []);
    } catch (e) {
      console.error("fetchDeductions error:", e);
      setDeductions([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!employeeID) return;
    fetchTypes();
    fetchDeductions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeID]);

  // Load options when type changes
  useEffect(() => {
    if (!form.deductionTypeID) {
      setOptions([]);
      return;
    }
    fetchOptions(form.deductionTypeID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.deductionTypeID]);

  const calculateSalaryBase = () => {
    const baseSalary = employee?.baseSalary || 0;

    // Check if selected type uses final salary
    const selectedType = types.find(t => t.deductionTypeID.toString() === form.deductionTypeID.toString());
    const usesFinalSalary = selectedType?.isFromFinalSalary || false;

    if (usesFinalSalary) {
      // Calculate final salary: baseSalary + total entitlements - total deductions
      const totalEntitlements = entitlements.reduce((sum, ent) => sum + (ent.amount || 0), 0);
      const totalDeductions = deductions.reduce((sum, ded) => sum + (ded.amount || 0), 0);
      return baseSalary + totalEntitlements - totalDeductions;
    }

    return baseSalary;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "deductionTypeID") {
      // When deduction type changes, reset all related fields
      setForm(prev => ({
        ...prev,
        deductionTypeID: value,
        deductionOptionID: "",
        amount: "",
        percentage: "",
      }));
    } else if (name === "deductionOptionID") {
      const option = options.find(o => o.deductionOptionID.toString() === value);
      if (option) {
        const salaryBase = calculateSalaryBase();
        if (option.isPercentage) {
          // If option has percentage, calculate amount automatically
          const calculatedAmount = salaryBase * (option.value / 100);
          setForm(prev => ({
            ...prev,
            [name]: value,
            percentage: option.value,
            amount: calculatedAmount.toFixed(0), // Round to nearest integer
          }));
        } else {
          // If option has fixed amount
          setForm(prev => ({
            ...prev,
            [name]: value,
            amount: option.value,
            percentage: "",
          }));
        }
      } else {
        setForm(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === "percentage") {
      // When percentage changes manually, recalculate amount
      const percentageValue = parseFloat(value) || 0;
      const salaryBase = calculateSalaryBase();
      const calculatedAmount = salaryBase * (percentageValue / 100);
      setForm(prev => ({
        ...prev,
        percentage: value,
        amount: calculatedAmount.toFixed(0),
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!form.deductionTypeID) return "اختر نوع الاستقطاع";

    // تحقق من عدم تكرار نفس نوع الاستقطاع للموظف
    const selectedTypeID = parseInt(form.deductionTypeID, 10);
    const isDuplicate = deductions.some(ded =>
      ded.deductionTypeID === selectedTypeID && !ded.isStopped
    );

    if (isDuplicate) {
      const typeName = types.find(t => t.deductionTypeID === selectedTypeID)?.name || "هذا الاستقطاع";
      return `${typeName} موجود بالفعل للموظف. لا يمكن إضافة نفس الاستقطاع مرتين.`;
    }

    // amount and percentage can both be null for certain deduction types like income tax
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validateForm();
    if (v) return alert(v);

    // إنشاء الاستقطاع - سيتم إرساله للموافقات تلقائياً من Backend
    const deductionBody = {
      employeeID: parseInt(employeeID, 10),
      deductions: [
        {
          deductionTypeID: parseInt(form.deductionTypeID, 10),
          deductionOptionID: form.deductionOptionID ? parseInt(form.deductionOptionID, 10) : null,
          amount: form.amount ? parseFloat(form.amount) : null,
          percentage: form.percentage ? parseFloat(form.percentage) : null,
          letterNumber: form.letterNumber || null,
          letterDate: form.letterDate || null,
          notes: form.notes || null,
        }
      ]
    };

    console.log("Submitting Deduction:", JSON.stringify(deductionBody, null, 2));

    try {
      // Check if token exists
      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("لم يتم العثور على Token. الرجاء تسجيل الدخول مرة أخرى");
      }

      const res = await fetch(`${BASE_URL}/Deductions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...authHeader,
        },
        body: JSON.stringify(deductionBody),
        mode: 'cors',
        credentials: 'omit',
      });

      if (res.ok) {
        alert("تم إنشاء طلب الاستقطاع بنجاح ✓\n\nالاستقطاع الآن قيد الانتظار ويتطلب:\n1. موافقة الحسابات\n2. موافقة التدقيق\n\nسيتم احتسابه في الراتب بعد الموافقات");
        resetForm();
        fetchDeductions();
      } else {
        let errorMessage = `فشل الحفظ: ${res.status}`;
        let detailedError = "";

        try {
          const text = await res.text();
          console.error("save failed:", res.status, text);
          detailedError = text;

          // Try to parse JSON error
          try {
            const errorJson = JSON.parse(text);
            if (errorJson.message) {
              detailedError = errorJson.message;
            } else if (errorJson.title) {
              detailedError = errorJson.title;
            } else if (errorJson.errors) {
              detailedError = JSON.stringify(errorJson.errors, null, 2);
            }
          } catch {
            // Not JSON, use raw text
          }
        } catch (e) {
          console.error("Error reading response:", e);
        }

        if (res.status === 401) {
          errorMessage = "انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى";
        } else if (res.status === 403) {
          errorMessage = "ليس لديك صلاحية لإجراء هذه العملية";
        } else if (res.status === 404) {
          errorMessage = "لم يتم العثور على المورد المطلوب";
        } else if (res.status === 500) {
          errorMessage = "خطأ في السيرفر (500)\n\nتفاصيل الخطأ:\n" + detailedError;
        } else if (detailedError) {
          errorMessage += "\n\nتفاصيل: " + detailedError;
        }

        console.error("Full error details:", errorMessage);
        alert(errorMessage);
      }
    } catch (e) {
      console.error("handleSubmit error:", e);
      let errorMsg = "خطأ في الاتصال بالسيرفر";

      if (e.message.includes("Failed to fetch")) {
        errorMsg = "فشل الاتصال بالسيرفر. تأكد من:\n" +
                   "1. اتصالك بالشبكة المحلية\n" +
                   "2. أن السيرفر يعمل على العنوان: " + BASE_URL + "\n" +
                   "3. أن جدار الحماية لا يمنع الاتصال";
      } else if (e.message.includes("Token")) {
        errorMsg = e.message;
      } else {
        errorMsg = "خطأ: " + e.message;
      }

      alert(errorMsg);
    }
  };

  const handleStop = async (ded) => {
    if (!window.confirm("هل أنت متأكد من إيقاف هذا الاستقطاع؟")) return;

    const body = {
      employeeID: parseInt(employeeID, 10),
      deductionTypeID: ded.deductionTypeID,
      letterNumber: prompt("رقم الكتاب (اختياري):") || null,
      letterDate: prompt("تاريخ الكتاب (YYYY-MM-DD):") || null,
      notes: prompt("ملاحظات (اختياري):") || null,
    };

    try {
      const res = await fetch(`${BASE_URL}/Deductions/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert("تم إيقاف الاستقطاع");
        fetchDeductions();
      } else {
        const t = await res.text();
        console.error("stop failed:", res.status, t);
        alert("فشل إيقاف الاستقطاع");
      }
    } catch (e) {
      console.error(e);
      alert("خطأ في إيقاف الاستقطاع");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`${BASE_URL}/Deductions/${id}`, { method: "DELETE", headers: getAuthHeader() });
      if (res.ok) {
        alert("تم الحذف");
        fetchDeductions();
      } else {
        const t = await res.text();
        console.error("delete failed:", res.status, t);
        alert("فشل الحذف");
      }
    } catch (e) {
      console.error(e);
      alert("خطأ بالحذف");
    }
  };

  const resetForm = () => {
    setForm({
      deductionID: null,
      deductionTypeID: "",
      deductionOptionID: "",
      amount: "",
      percentage: "",
      letterNumber: "",
      letterDate: "",
      notes: "",
    });
  };

  if (!employeeID) return <p className="text-red-600">لم يتم العثور على بيانات الموظف</p>;

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
          <MinusCircleIcon className="h-6 w-6 text-red-600" /> إضافة استقطاعات
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع الاستقطاع</label>
              <select
                name="deductionTypeID"
                value={form.deductionTypeID}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">اختر النوع</option>
                {types.map(t => (
                  <option key={t.deductionTypeID} value={t.deductionTypeID}>{t.deductionName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2"> حالة الخدمة</label>
              <select
                name="deductionOptionID"
                value={form.deductionOptionID}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">اختر حالة الخدمة</option>
                {options.map(o => (
                  <option key={o.deductionOptionID} value={o.deductionOptionID}>
                    {o.description || o.deductionTypeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ (د.ع)</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                placeholder="0"
                title="يتم حساب المبلغ تلقائياً من النسبة المئوية"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">النسبة المئوية (%)</label>
              <input
                type="number"
                name="percentage"
                value={form.percentage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الكتاب</label>
              <input
                type="text"
                name="letterNumber"
                value={form.letterNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="رقم الكتاب (اختياري)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الأمر الأداري أو التخصيص المالي</label>
              <input
                type="date"
                name="letterDate"
                value={form.letterDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="ملاحظات (اختياري)"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              إضافة استقطاع
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors font-medium"
            >
              إعادة تعيين
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-red-50 px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-red-900">قائمة الاستقطاعات</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">جاري التحميل...</div>
        ) : deductions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">لا توجد استقطاعات حالياً</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">النوع</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">النسبة %</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">رقم الكتاب</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">تاريخ الكتاب</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map(ded => {
                  // حساب النسبة المئوية من المبلغ والراتب الأساسي
                  const baseSalary = employee?.baseSalary || 0;
                  let displayPercentage = ded.percentage;

                  // إذا لم تكن النسبة موجودة ولكن المبلغ موجود، احسب النسبة
                  if (!displayPercentage && ded.amount && baseSalary > 0) {
                    displayPercentage = ((ded.amount / baseSalary) * 100).toFixed(2);
                  }

                  return (
                    <tr key={ded.deductionID} className={`border-b border-gray-100 hover:bg-red-50 transition-colors ${ded.isStopped ? 'bg-gray-100 opacity-60' : ''}`}>
                      <td className="px-6 py-3 text-sm text-gray-900">{ded.deductionTypeName}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{ded.amount ? `${formatNumber(ded.amount)} د.ع` : "—"}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{displayPercentage ? `${displayPercentage}%` : "—"}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{ded.letterNumber || "—"}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{ded.letterDate ? new Date(ded.letterDate).toLocaleDateString('ar-IQ') : "—"}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ded.isStopped ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {ded.isStopped ? 'متوقف' : 'نشط'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          {!ded.isStopped && (
                            <button onClick={() => handleStop(ded)} className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg" title="إيقاف">
                              <MinusCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(ded.deductionID)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="حذف">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}