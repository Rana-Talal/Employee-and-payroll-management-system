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
  Filter,
  Calendar,
  User,
  DollarSign,
  Trash2,
  CheckCheck,
  AlertCircle,
  Bell
} from "lucide-react";

const BASE_URL = "/api";

const STATUS_CONFIG = {
  1: {
    label: "قيد الانتظار",
    icon: Clock,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    border: "border-amber-300",
    dot: "bg-amber-500"
  },
  2: {
    label: "موافقة الحسابات",
    icon: DollarSign,
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
    border: "border-blue-300",
    dot: "bg-blue-500"
  },
  3: {
    label: "التدقيق",
    icon: AlertCircle,
    gradient: "from-purple-500 to-pink-500",
    bg: "bg-gradient-to-br from-purple-50 to-pink-50",
    border: "border-purple-300",
    dot: "bg-purple-500"
  },
  4: {
    label: "مكتمل",
    icon: CheckCircle,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    border: "border-emerald-300",
    dot: "bg-emerald-500"
  },
  5: {
    label: "مرفوض",
    icon: XCircle,
    gradient: "from-red-500 to-rose-500",
    bg: "bg-gradient-to-br from-red-50 to-rose-50",
    border: "border-red-300",
    dot: "bg-red-500"
  },
};

export default function ChangeReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accountingApproval: 0,
    auditApproval: 0,
    completed: 0,
    rejected: 0
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
      setReports(items);

      const statsData = {
        total: items.length,
        pending: items.filter(r => r.changeStatus === 1).length,
        accountingApproval: items.filter(r => r.changeStatus === 2).length,
        auditApproval: items.filter(r => r.changeStatus === 3).length,
        completed: items.filter(r => r.changeStatus === 4).length,
        rejected: items.filter(r => r.changeStatus === 5).length,
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

  const handleApproveAccounting = async (id) => {
    if (!window.confirm("هل أنت متأكد من موافقة الحسابات على هذا التغيير؟")) return;

    try {
      const res = await fetch(`${BASE_URL}/ChangeReports/ApproveAccounting/${id}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("فشل في الموافقة");

      showToast("تمت موافقة الحسابات بنجاح ✓", "success");
      fetchReports();
    } catch (error) {
      console.error("خطأ في الموافقة:", error);
      showToast("فشل في موافقة الحسابات", "error");
    }
  };

  const handleApproveAudit = async (id) => {
    if (!window.confirm("هل أنت متأكد من موافقة التدقيق على هذا التغيير؟")) return;

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
      fetchReports();
    } catch (error) {
      console.error("خطأ في الموافقة:", error);
      showToast("فشل في الموافقة", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التقرير؟")) return;

    try {
      const res = await fetch(`${BASE_URL}/ChangeReports/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("فشل في الحذف");

      showToast("تم حذف التقرير بنجاح ✓", "success");
      fetchReports();
    } catch (error) {
      console.error("خطأ في الحذف:", error);
      showToast("فشل في الحذف", "error");
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

    const matchesFilter = filterStatus === "all" || report.changeStatus === parseInt(filterStatus);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">جارٍ تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6" dir="rtl">
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

      {/* Header with gradient */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <h1 className="text-4xl font-black mb-2">
            تقارير التغييرات والموافقات
          </h1>
          {/* <p className="text-blue-100 text-lg">متابعة وإدارة جميع تغييرات المخصصات والاستقطاعات</p> */}
        </div>
      </div>

      {/* Statistics with modern design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-slate-500 to-slate-600 p-3 rounded-xl shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-slate-700">{stats.total}</p>
            </div>
          </div>
          <p className="text-sm font-bold text-slate-600">إجمالي التقارير</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl shadow-md">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
            </div>
          </div>
          <p className="text-sm font-bold text-amber-700">قيد الانتظار</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl shadow-md">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-blue-600">{stats.accountingApproval}</p>
            </div>
          </div>
          <p className="text-sm font-bold text-blue-700">الحسابات</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-md">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-purple-600">{stats.auditApproval}</p>
            </div>
          </div>
          <p className="text-sm font-bold text-purple-700">التدقيق</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-xl shadow-md">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-emerald-600">{stats.completed}</p>
            </div>
          </div>
          <p className="text-sm font-bold text-emerald-700">مكتمل</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-gradient-to-br from-red-500 to-rose-500 p-3 rounded-xl shadow-md">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-red-600">{stats.rejected}</p>
            </div>
          </div>
          <p className="text-sm font-bold text-red-700">مرفوض</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن موظف أو نوع تغيير..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all cursor-pointer"
            >
              <option value="all">جميع الحالات</option>
              <option value="1">قيد الانتظار</option>
              <option value="2">موافقة الحسابات</option>
              <option value="3">التدقيق</option>
              <option value="4">مكتمل</option>
              <option value="5">مرفوض</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Cards Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
          <FileText className="h-20 w-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">لا توجد تقارير</h3>
          <p className="text-gray-500">جرب تغيير معايير البحث أو الفلتر</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const statusConfig = STATUS_CONFIG[report.changeStatus] || STATUS_CONFIG[1];
            const StatusIcon = statusConfig.icon;
            const isEntitlement = report.entitlementTypeName;

            return (
              <div
                key={report.changeReportID}
                className={`relative bg-white rounded-2xl shadow-lg border-2 ${statusConfig.border} overflow-hidden`}
              >
                {/* Status bar on top */}
                <div className={`h-2 bg-gradient-to-r ${statusConfig.gradient}`}></div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${statusConfig.bg} border ${statusConfig.border}`}>
                        <StatusIcon className="h-6 w-6 text-gray-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <h3 className="text-lg font-bold text-gray-900">{report.employeeFullName}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bg} border ${statusConfig.border}`}>
                            <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`}></span>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(report.changeReportID)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Change Details */}
                  <div className={`${statusConfig.bg} border ${statusConfig.border} rounded-xl p-4 mb-4`}>
                    <div className="flex items-start gap-3">
                      {isEntitlement ? (
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-100 rounded-lg">
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {/* {isEntitlement ? "مخصص" : "خصم"} */}
                        </p>
                        <p className="text-lg font-bold text-gray-900 mb-1">
                          {isEntitlement ? report.entitlementTypeName : report.deductionTypeName}
                        </p>
                        {report.fieldChanged && (
                          <p className="text-xs text-red-700">{report.fieldChanged}</p>
                        )}
                      </div>
                      <div className="text-left">
                        {isEntitlement ? (
                          <>
                            {report.entitlementAmount && (
                              <p className="text-xl font-black text-green-700">{formatCurrency(report.entitlementAmount)}</p>
                            )}
                            {report.entitlementPercentage && (
                              <p className="text-sm font-bold text-green-600">{report.entitlementPercentage}%</p>
                            )}
                          </>
                        ) : (
                          <>
                            {report.deductionAmount && (
                              <p className="text-xl font-black text-red-700">{formatCurrency(report.deductionAmount)}</p>
                            )}
                            {report.deductionPercentage && (
                              <p className="text-sm font-bold text-red-600">{report.deductionPercentage}%</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Approval Timeline */}
                  {(report.requiresAccountingApproval || report.requiresAuditApproval) && (
                    <div className="mb-4 space-y-2">
                      <p className="text-xs font-bold text-gray-500 mb-2">مسار الموافقة:</p>

                      {report.requiresAccountingApproval && (
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${report.accountingApproved
                            ? 'bg-green-100 border-2 border-green-500'
                            : 'bg-yellow-100 border-2 border-yellow-500'
                            }`}>
                            {report.accountingApproved ? (
                              <CheckCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${report.accountingApproved ? 'text-green-700' : 'text-yellow-700'}`}>
                              الحسابات
                            </p>
                            {report.accountingApproved && report.accountingApprovedByUserName && (
                              <p className="text-xs text-gray-500">{report.accountingApprovedByUserName}</p>
                            )}
                          </div>
                          {report.accountingApproved && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      )}

                      {report.requiresAuditApproval && (
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${report.auditApproved
                            ? 'bg-green-100 border-2 border-green-500'
                            : 'bg-yellow-100 border-2 border-yellow-500'
                            }`}>
                            {report.auditApproved ? (
                              <CheckCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${report.auditApproved ? 'text-green-700' : 'text-yellow-700'}`}>
                              التدقيق
                            </p>
                            {report.auditApproved && report.auditApprovedByUserName && (
                              <p className="text-xs text-gray-500">{report.auditApprovedByUserName}</p>
                            )}
                          </div>
                          {report.auditApproved && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(report.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {report.requiresAccountingApproval && !report.accountingApproved && (
                        <button
                          onClick={() => handleApproveAccounting(report.changeReportID)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-md hover:shadow-lg"
                        >
                          موافقة الحسابات
                        </button>
                      )}
                      {report.requiresAuditApproval && report.accountingApproved && !report.auditApproved && (
                        <button
                          onClick={() => handleApproveAudit(report.changeReportID)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-bold shadow-md hover:shadow-lg"
                        >
                          موافقة التدقيق
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
