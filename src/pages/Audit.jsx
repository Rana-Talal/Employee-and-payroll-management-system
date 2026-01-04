// src/pages/Audit.jsx
import { useEffect, useState } from "react";

export default function Audit() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("employeeData");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error("خطأ في تحميل بيانات التدقيق");
      }
    }
  }, []);

  if (!data) {
    return (
      <div className="p-10 text-center text-red-600">
        <h2 className="text-2xl">لا توجد بيانات للتدقيق</h2>
        <p className="mt-2">يرجى ملء استمارة الموظف أولاً.</p>
      </div>
    );
  }

  const renderValue = (val) => val ?? "—";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center text-indigo-700">
        البيانات للتدقيق
      </h1>

      {/* 1. البيانات الأساسية */}
      <section className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <h2 className="text-xl font-bold mb-3">البيانات الأساسية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div><strong>الاسم الرباعي:</strong> {renderValue(data.fullName)}</div>
          <div><strong>الرقم الوظيفي:</strong> {renderValue(data.employeeId)}</div>
          <div><strong>العنوان الوظيفي:</strong> {renderValue(data.jobTitle)}</div>
          <div><strong>الدرجة / المرحلة:</strong> {renderValue(data.grade)} / {renderValue(data.step)}</div>
          <div><strong>الراتب الأساسي:</strong> {renderValue(data.baseSalary)} د.ع</div>
        </div>
      </section>

      {/* 2. الخدمات الإضافية */}
      <section className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <h2 className="text-xl font-bold mb-3">الخدمات الإضافية</h2>
        {data.services && data.services.length > 0 ? (
          data.services.map((svc, i) => (
            <div key={i} className="p-2 bg-white mb-2 rounded text-sm">
              <strong>{svc.serviceType}</strong>: {svc.year} سنة، {svc.month} شهر، {svc.day} يوم
            </div>
          ))
        ) : (
          <p>لا توجد خدمات</p>
        )}
      </section>

      {/* 3. الترقيات / العلاوات / العقوبات */}
      <section className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <h2 className="text-xl font-bold mb-3">الإجراءات الإدارية</h2>
        {data.promotions && data.promotions.length > 0 ? (
          data.promotions.map((p, i) => (
            <div key={i} className="p-2 bg-white mb-2 rounded text-sm">
              <strong>النوع:</strong> {p.type}
              {p.type === "ترقية" && (
                <div>الدرجة الجديدة: {p.newGrade}، المرحلة: {p.newStep}، الراتب: {p.newSalary}</div>
              )}
              {p.type === "علاوة" && <div>عدد الشكر: {p.appreciationCount}</div>}
              {p.type === "عقوبة" && <div>نوع العقوبة: {p.penaltyType}</div>}
            </div>
          ))
        ) : (
          <p>لا توجد إجراءات</p>
        )}
      </section>

      {/* 4. الاستحقاقات (من صفحة الراتب) */}
      <section className="border border-green-300 rounded-lg p-4 bg-green-50">
        <h2 className="text-xl font-bold text-green-700 mb-3">الاستحقاقات</h2>
        {data.calculatedEntitlements && data.calculatedEntitlements.length > 0 ? (
          data.calculatedEntitlements.map((e, i) => (
            <div key={i} className="flex justify-between p-2 bg-white rounded text-sm">
              <span>{e.name}</span>
              <span>{e.value.toLocaleString()} د.ع</span>
            </div>
          ))
        ) : (
          <p>لا توجد استحقاقات</p>
        )}
      </section>

      {/* 5. الاستقطاعات (من صفحة الراتب) */}
      <section className="border border-red-300 rounded-lg p-4 bg-red-50">
        <h2 className="text-xl font-bold text-red-700 mb-3">الاستقطاعات</h2>
        {data.calculatedDeductions && data.calculatedDeductions.length > 0 ? (
          data.calculatedDeductions.map((d, i) => (
            <div key={i} className="flex justify-between p-2 bg-white rounded text-sm">
              <span>{d.name}</span>
              <span>{d.value.toLocaleString()} د.ع</span>
            </div>
          ))
        ) : (
          <p>لا توجد استقطاعات</p>
        )}
      </section>
    </div>
  );
}