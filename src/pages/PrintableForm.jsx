import React from 'react';


// هذا هو المكون الذي سيتم عرضه فقط عند الضغط على زر الطباعة
const PrintableForm = ({ formData, totals }) => {
    return (
        // 'print-view' class is for CSS styling to control what gets printed
        <div className="p-8 font-sans print-view" dir="rtl">

            {/* Header section for the print-out, includes logo and date */}
            <div className="flex items-center justify-between border-b-2 border-gray-400 pb-4 mb-8 print-header">
                <div className="flex items-center">
                    {/* يمكنك إضافة شعار هنا إذا كان لديك ملف صورة */}
                    {/* <img src="/path/to/your/logo.png" alt="شعار المحافظة" className="h-20 w-20 ml-4" /> */}
                    <h1 className="text-3xl font-bold text-gray-800">محافظة بغداد</h1>
                </div>
                <p className="text-lg text-gray-600">تاريخ الطباعة: {new Date().toLocaleDateString('ar-IQ')}</p>
            </div>

            {/* Employee data section */}
            <div className="mb-8 print-section">
                <h2 className="text-2xl font-extrabold mb-4">بيانات الموظف</h2>
                <table className="w-full text-lg border-collapse">
                    <tbody>
                        <tr className="border-b border-gray-300">
                            <td className="p-2 w-1/4 bg-gray-100 font-bold">الاسم الثلاثي:</td>
                            <td className="p-2 w-3/4">{formData.fullName}</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                            <td className="p-2 bg-gray-100 font-bold">الراتب الاسمي:</td>
                            <td className="p-2">{Number(formData.baseSalary).toLocaleString()} د.ع</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                            <td className="p-2 bg-gray-100 font-bold">رقم الحساب:</td>
                            <td className="p-2">{formData.accountNumber}</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                            <td className="p-2 bg-gray-100 font-bold">الدرجة:</td>
                            <td className="p-2">{formData.degree}</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                            <td className="p-2 bg-gray-100 font-bold">العنوان الوظيفي:</td>
                            <td className="p-2">{formData.jobTitle}</td>
                        </tr>
                        {/* يمكنك إضافة المزيد من الحقول هنا إذا كنت بحاجة إليها */}
                    </tbody>
                </table>
            </div>

            {/* Salary summary section */}
            <div className="print-section">
                <h2 className="text-2xl font-extrabold mb-4">ملخص الراتب</h2>
                <table className="w-full text-lg border-collapse">
                    <tbody>
                        <tr className="border-b border-green-300 bg-green-50">
                            <td className="p-2 w-1/2 font-bold text-green-800">مجموع الاستحقاق:</td>
                            <td className="p-2 w-1/2 font-bold text-green-800 text-right">
                                {Number(totals.totalEntitlements).toLocaleString()} د.ع
                            </td>
                        </tr>
                        <tr className="border-b border-red-300 bg-red-50">
                            <td className="p-2 font-bold text-red-800">مجموع الاستقطاع:</td>
                            <td className="p-2 font-bold text-red-800 text-right">
                                {Number(totals.totalDeductions).toLocaleString()} د.ع
                            </td>
                        </tr>
                        <tr className="border-b-4 border-yellow-400 bg-yellow-50">
                            <td className="p-2 font-bold text-yellow-900">الصافي:</td>
                            <td className="p-2 font-bold text-yellow-900 text-right">
                                {Number(totals.netSalary).toLocaleString()} د.ع
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* This global style block is essential. It hides everything except the printable component. */}
            <style>
                {`
          @media print {
            /* إخفاء كل شيء ما عدا المكون الذي يحمل الكلاس 'print-view' */
            body > *:not(.print-view) {
              display: none !important;
            }
            .print-view {
              direction: rtl;
              unicode-bidi: embed;
              display: block !important;
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
            }
            /* تنسيقات إضافية لضمان عدم وجود فواصل غير مرغوبة */
            .print-section {
              page-break-inside: avoid;
            }
          }
        `}
            </style>
        </div>
    );
};

export default PrintableForm;