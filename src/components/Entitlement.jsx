import React, { useState, useEffect, useCallback } from "react";
import { PlusCircleIcon, TrashIcon, MinusCircleIcon } from "lucide-react";
import { formatNumber } from "../utils/formatNumber";

export default function Entitlement({ employee, entitlements, setEntitlements }) {
  const employeeID = employee?.id || employee?.employeeID || employee?.employeeNumber;
  const [types, setTypes] = useState([]);
  const [options, setOptions] = useState([]);
  const [form, setForm] = useState({
    entitlementID: null,
    entitlementTypeID: "",
    entitlementOptionID: "",
    amount: "",
    percentage: "",
    letterNumber: "",
    letterDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const BASE_URL = "/api";


  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  
  const fetchTypes = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BASE_URL}/EntitlementType?PageSize=1000`, { headers });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setTypes(data.items || []);
    } catch (e) {
      console.error("fetchTypes error:", e);
    }
  }, []);

  const fetchOptions = useCallback(async (typeID) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BASE_URL}/EntitlementOption?PageSize=1000`, { headers });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const filtered = (data.items || []).filter(o => o.entitlementTypeID == typeID && o.isActive);
      setOptions(filtered);
    } catch (e) {
      console.error("fetchOptions error:", e);
      setOptions([]);
    }
  }, []);

  const fetchEntitlements = useCallback(async () => {
    if (!employeeID) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${BASE_URL}/Entitlements?employeeID=${employeeID}&PageSize=1000`, { headers });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setEntitlements(data.items || data || []);
    } catch (e) {
      console.error("fetchEntitlements error:", e);
      setEntitlements([]);
    } finally {
      setLoading(false);
    }
  }, [employeeID, setEntitlements]);

  useEffect(() => {
    if (!employeeID) return;
    fetchTypes();
    fetchEntitlements();
  }, [employeeID, fetchTypes, fetchEntitlements]);

  useEffect(() => {
    if (!form.entitlementTypeID) {
      setOptions([]);
      return;
    }
    fetchOptions(form.entitlementTypeID);
  }, [form.entitlementTypeID, fetchOptions]);

  const calculateSalaryBase = () => {
    const baseSalary = employee?.baseSalary || 0;

    // Check if selected type uses final salary
    const selectedType = types.find(t => t.entitlementTypeID.toString() === form.entitlementTypeID.toString());
    const usesFinalSalary = selectedType?.isFromFinalSalary || false;

    if (usesFinalSalary) {
      // Calculate final salary: baseSalary + total entitlements - total deductions
      const totalEntitlements = entitlements.reduce((sum, ent) => sum + (ent.amount || 0), 0);
      const totalDeductions = 0; // Entitlements don't have access to deductions
      return baseSalary + totalEntitlements - totalDeductions;
    }

    return baseSalary;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "entitlementTypeID") {
      // When entitlement type changes, reset all related fields
      setForm(prev => ({
        ...prev,
        entitlementTypeID: value,
        entitlementOptionID: "",
        amount: "",
        percentage: "",
      }));
    } else if (name === "entitlementOptionID") {
      const option = options.find(o => o.entitlementOptionID.toString() === value);
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
    if (!form.entitlementTypeID) return "اختر نوع المخصص";

    // تحقق من عدم تكرار نفس نوع المخصص للموظف
    const selectedTypeID = parseInt(form.entitlementTypeID, 10);
    const isDuplicate = entitlements.some(ent =>
      ent.entitlementTypeID === selectedTypeID && !ent.isStopped
    );

    if (isDuplicate) {
      const typeName = types.find(t => t.entitlementTypeID === selectedTypeID)?.name || "هذا المخصص";
      return `${typeName} موجود بالفعل للموظف. لا يمكن إضافة نفس المخصص مرتين.`;
    }

    // amount and percentage can both be null for certain entitlement types
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validateForm();
    if (v) return alert(v);

    // إنشاء المخصص - سيتم إرساله للموافقات تلقائياً من Backend
    const entitlementBody = {
      employeeID: parseInt(employeeID, 10),
      entitlements: [
        {
          entitlementTypeID: parseInt(form.entitlementTypeID, 10),
          entitlementOptionID: form.entitlementOptionID ? parseInt(form.entitlementOptionID, 10) : null,
          amount: form.amount ? parseFloat(form.amount) : null,
          percentage: form.percentage ? parseFloat(form.percentage) : null,
          letterNumber: form.letterNumber || null,
          letterDate: form.letterDate || null,
          notes: form.notes || null,
        }
      ]
    };

    console.log("Submitting Entitlement:", JSON.stringify(entitlementBody, null, 2));

    try {
      setSaving(true);
      setError(null);

      // Check if token exists
      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("لم يتم العثور على Token. الرجاء تسجيل الدخول مرة أخرى");
      }

      const res = await fetch(`${BASE_URL}/Entitlements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...authHeader,
        },
        body: JSON.stringify(entitlementBody),
        mode: 'cors',
        credentials: 'omit',
      });

      if (res.ok) {
        alert("تم إنشاء طلب المخصص بنجاح ✓\n\nالمخصص الآن قيد الانتظار ويتطلب:\n1. موافقة الحسابات\n2. موافقة التدقيق\n\nسيتم احتسابه في الراتب بعد الموافقات");
        resetForm();
        fetchEntitlements();
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
        setError(errorMessage);
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
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleStop = async (ent) => {
    if (!window.confirm("هل أنت متأكد من إيقاف هذا المخصص؟")) return;

    const body = {
      employeeID: parseInt(employeeID, 10),
      entitlementTypeID: ent.entitlementTypeID,
      letterNumber: prompt("رقم الكتاب (اختياري):") || null,
      letterDate: prompt("تاريخ الكتاب (YYYY-MM-DD):") || null,
      notes: prompt("ملاحظات (اختياري):") || null,
    };

    try {
      const res = await fetch(`${BASE_URL}/Entitlements/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert("تم إيقاف المخصص");
        fetchEntitlements();
      } else {
        const t = await res.text();
        console.error("stop failed:", res.status, t);
        alert("فشل إيقاف المخصص");
      }
    } catch (e) {
      console.error(e);
      alert("خطأ في إيقاف المخصص");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`${BASE_URL}/Entitlements/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (res.ok) {
        alert("تم الحذف");
        fetchEntitlements();
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
      entitlementID: null,
      entitlementTypeID: "",
      entitlementOptionID: "",
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <PlusCircleIcon className="h-6 w-6 text-blue-600" /> إضافة مخصصات 
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع المخصص</label>
              <select
                name="entitlementTypeID"
                value={form.entitlementTypeID}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">اختر النوع</option>
                {types.map(t => (
                  <option key={t.entitlementTypeID} value={t.entitlementTypeID}>
                    {t.entitlementName || t.name || t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2"> حالة الخدمة</label>
              <select
                name="entitlementOptionID"
                value={form.entitlementOptionID}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">اختر حالة الخدمة</option>
                {options.map(o => (
                  <option key={o.entitlementOptionID} value={o.entitlementOptionID}>
                    {o.description || o.name}
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
                placeholder="0"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
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
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">  تاريخ الأمر الأداري أو التخصيص المالي </label>
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
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {saving ? "جارٍ الحفظ..." : "إضافة مخصص"}
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

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-blue-900">قائمة المخصصات</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">جاري التحميل...</div>
        ) : entitlements.length === 0 ? (
          <div className="p-6 text-center text-gray-500">لا توجد مخصصات حالياً</div>
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
                {entitlements.map(ent => {
                  // حساب النسبة المئوية من المبلغ والراتب الأساسي
                  const baseSalary = employee?.baseSalary || 0;
                  let displayPercentage = ent.percentage;

                  // إذا لم تكن النسبة موجودة ولكن المبلغ موجود، احسب النسبة
                  if (!displayPercentage && ent.amount && baseSalary > 0) {
                    displayPercentage = ((ent.amount / baseSalary) * 100).toFixed(2);
                  }

                  return (
                    <tr key={ent.entitlementID} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${ent.isStopped ? 'bg-gray-100 opacity-60' : ''}`}>
                      <td className="px-6 py-3 text-sm text-gray-900">{ent.entitlementTypeName || ent.typeName}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{ent.amount ? `${formatNumber(ent.amount)} د.ع` : "—"}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{displayPercentage ? `${displayPercentage}%` : "—"}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{ent.letterNumber || "—"}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{ent.letterDate ? new Date(ent.letterDate).toLocaleDateString('ar-IQ') : "—"}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ent.isStopped ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {ent.isStopped ? 'متوقف' : 'نشط'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          {!ent.isStopped && (
                            <button onClick={() => handleStop(ent)} className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg" title="إيقاف">
                              <MinusCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(ent.entitlementID)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="حذف">
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