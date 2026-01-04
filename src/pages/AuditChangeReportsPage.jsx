import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  Search,
  Calendar,
  User,
  X,
  AlertCircle,
  CheckCheck,
} from "lucide-react";

const BASE_URL = "/api";

export default function AuditChangeReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reportToReject, setReportToReject] = useState(null);
  const [readReports, setReadReports] = useState(new Set());
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/ChangeReports?PageSize=1000`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("فشل في جلب التقارير");

      const data = await res.json();
      const items = data.items || data || [];

      // فلترة التقارير: فقط التي تحتاج موافقة التدقيق (بعد موافقة الحسابات)
      const auditReports = items.filter(r =>
        r.requiresAuditApproval && r.accountingApproved && !r.auditApproved
      );

      setReports(auditReports);

      const statsData = {
        total: auditReports.length,
        pending: auditReports.filter(r => !r.auditApproved).length,
        approved: items.filter(r => r.auditApproved).length,
      };
      setStats(statsData);
    } catch (error) {
      console.error("خطأ في جلب التقارير:", error);
      alert("فشل في تحميل التقارير");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
    // تعليم التقرير كمقروء
    setReadReports(prev => new Set([...prev, report.changeReportID]));
  };

  const handleApproveAudit = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/ChangeReports/ApproveAudit/${id}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("فشل في الموافقة");

      showToast("تمت موافقة التدقيق بنجاح ✓", "success");
      setShowModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error("خطأ في الموافقة:", error);
      showToast("فشل في الموافقة", "error");
    }
  };

  const handleRejectClick = (report) => {
    setReportToReject(report);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      showToast("يرجى كتابة سبب الرفض", "error");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/ChangeReports/RejectAudit/${reportToReject.changeReportID}`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("فشل في الرفض");

      showToast("تم رفض التقرير وإرسال إشعار لقسم الحسابات", "success");
      setShowRejectModal(false);
      setShowModal(false);
      setReportToReject(null);
      setRejectionReason("");
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error("خطأ في الرفض:", error);
      showToast("فشل في رفض التقرير", "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date)) return "—";
    return date.toLocaleDateString("ar-IQ", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "—";
    return `${parseFloat(amount).toLocaleString("ar-IQ")} د.ع`;
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.employeeFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.entitlementTypeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.deductionTypeName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">جارٍ تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl border-2 flex items-center gap-3 animate-bounce ${toast.type === "success"
          ? "bg-green-50 border-green-500 text-green-800"
          : "bg-red-50 border-red-500 text-red-800"
          }`}>
          {toast.type === "success" ? (
            <CheckCircle className="h-6 w-6" />
          ) : (
            <XCircle className="h-6 w-6" />
          )}
          <span className="font-bold text-lg">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
          <h1 className="text-4xl font-black mb-2">
            📬 قيد المعالجة  - قسم التدقيق
          </h1>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-purple-700">{stats.total}</p>
            </div>
          </div>
          <p className="text-sm font-bold text-purple-600">التقارير المعلقة</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-md">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-orange-600">{stats.pending}</p>
            </div>
          </div>
          <p className="text-sm font-bold text-orange-700">بانتظار الموافقة</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-xl shadow-md">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-emerald-600">{stats.approved}</p>
            </div>
          </div>
          <p className="text-sm font-bold text-emerald-700">تم اعتمادها</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن موظف أو نوع تغيير..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          />
        </div>
      </div>

      {/* Gmail-style List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
          <FileText className="h-20 w-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">لا توجد تقارير معلقة</h3>
          <p className="text-gray-500">جميع التقارير تم اعتمادها أو لا توجد تقارير جديدة</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
            <div className="col-span-4">اسم الموظف</div>
            <div className="col-span-5">نوع التغيير (المخصص/الاستقطاع)</div>
            <div className="col-span-3 text-left">التاريخ</div>
          </div>

          {/* Gmail-style List Items */}
          <div className="divide-y divide-gray-100">
            {filteredReports.map((report) => {
              const isRead = readReports.has(report.changeReportID);
              const isEntitlement = report.entitlementTypeName;
              const typeName = isEntitlement ? report.entitlementTypeName : report.deductionTypeName;

              return (
                <div
                  key={report.changeReportID}
                  onClick={() => handleReportClick(report)}
                  className={`px-6 py-4 grid grid-cols-12 gap-4 cursor-pointer transition-all hover:shadow-md ${
                    isRead ? 'bg-gray-50' : 'bg-white font-bold'
                  }`}
                >
                  <div className={`col-span-4 flex items-center gap-2 ${!isRead ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                    <User className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span className="truncate">{report.employeeFullName}</span>
                  </div>
                  <div className={`col-span-5 flex items-center gap-2 ${!isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                    {isEntitlement ? (
                      <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className="truncate">{typeName}</span>
                    {report.entitlementAmount && (
                      <span className="text-green-700 text-xs">({formatCurrency(report.entitlementAmount)})</span>
                    )}
                    {report.deductionAmount && (
                      <span className="text-red-700 text-xs">({formatCurrency(report.deductionAmount)})</span>
                    )}
                  </div>
                  <div className={`col-span-3 flex items-center justify-end gap-2 text-sm ${!isRead ? 'font-bold text-gray-700' : 'text-gray-500'}`}>
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail Modal (Gmail-style) */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 z-50 flex items-start justify-center pt-8 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 mb-8" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                <h2 className="text-2xl font-bold">تفاصيل التقرير</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {/* Employee Info */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">معلومات الموظف</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">الاسم الكامل</p>
                    <p className="text-lg font-bold text-gray-900">{selectedReport.employeeFullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Change Details */}
              <div className={`${selectedReport.entitlementTypeName ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 rounded-xl p-6 mb-6`}>
                <div className="flex items-center gap-3 mb-4">
                  {selectedReport.entitlementTypeName ? (
                    <>
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <h3 className="text-xl font-bold text-green-900">مخصص جديد</h3>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-6 w-6 text-red-600" />
                      <h3 className="text-xl font-bold text-red-900">استقطاع جديد</h3>
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">النوع</p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedReport.entitlementTypeName || selectedReport.deductionTypeName}
                    </p>
                  </div>

                  {selectedReport.entitlementAmount && (
                    <div>
                      <p className="text-sm text-gray-600">المبلغ</p>
                      <p className="text-2xl font-black text-green-700">{formatCurrency(selectedReport.entitlementAmount)}</p>
                    </div>
                  )}

                  {selectedReport.entitlementPercentage && (
                    <div>
                      <p className="text-sm text-gray-600">النسبة المئوية</p>
                      <p className="text-2xl font-black text-green-700">{selectedReport.entitlementPercentage}%</p>
                    </div>
                  )}

                  {selectedReport.deductionAmount && (
                    <div>
                      <p className="text-sm text-gray-600">المبلغ</p>
                      <p className="text-2xl font-black text-red-700">{formatCurrency(selectedReport.deductionAmount)}</p>
                    </div>
                  )}

                  {selectedReport.deductionPercentage && (
                    <div>
                      <p className="text-sm text-gray-600">النسبة المئوية</p>
                      <p className="text-2xl font-black text-red-700">{selectedReport.deductionPercentage}%</p>
                    </div>
                  )}

                  {selectedReport.fieldChanged && (
                    <div>
                      <p className="text-sm text-gray-600">الحقل المتغير</p>
                      <p className="text-lg font-medium text-gray-800">{selectedReport.fieldChanged}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Timeline */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <CheckCheck className="h-5 w-5 text-blue-600" />
                  مسار الموافقة
                </p>

                <div className="space-y-3">
                  {/* موافقة الحسابات */}
                  <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-green-100 border-2 border-green-500">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-green-700">✓ الحسابات - تمت الموافقة</p>
                      {selectedReport.accountingApprovedByUserName && (
                        <p className="text-xs text-gray-500">بواسطة: {selectedReport.accountingApprovedByUserName}</p>
                      )}
                    </div>
                  </div>

                  {/* موافقة التدقيق */}
                  <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-yellow-100 border-2 border-yellow-500">
                      <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-yellow-700">⏳ التدقيق - بانتظار الموافقة</p>
                      <p className="text-xs text-gray-500">يتطلب اعتمادك النهائي</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleRejectClick(selectedReport);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <XCircle className="h-5 w-5" />
                  رفض
                </button>
                <button
                  onClick={() => handleApproveAudit(selectedReport.changeReportID)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  اعتماد التدقيق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && reportToReject && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {/* Reject Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6" />
                <h2 className="text-xl font-bold">رفض التقرير</h2>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Reject Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                سيتم إرسال إشعار لقسم الحسابات مع سبب الرفض
              </p>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  سبب الرفض <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="اكتب سبب رفض هذا التقرير..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                  rows="4"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <XCircle className="h-5 w-5" />
                  تأكيد الرفض
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
