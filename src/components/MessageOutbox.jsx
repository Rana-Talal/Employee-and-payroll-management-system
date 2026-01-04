import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const BASE_URL = "/api";

export default function MessageOutbox({ department, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [selectedMessages, setSelectedMessages] = useState([]); // للرسائل المحددة بالـ checkbox

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchMessages = async () => {
      console.log("🔄 [Outbox] Fetching messages for department:", department);
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/ChangeReports?PageSize=1000`, {
          headers: getAuthHeaders(),
        });

        console.log("📡 [Outbox] API Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("📡 [Outbox] API Response data:", data);

          const changeReports = Array.isArray(data) ? data : data.items || [];
          console.log("📊 [Outbox] Total change reports from API:", changeReports.length);

          // صندوق الصادر: الرسائل التي أرسلها القسم (تم إنشاؤها من قبل القسم)
          const formattedMessages = changeReports
            .filter(report => {
              console.log(`🔍 [Outbox] Checking report ${report.changeReportID}:`, {
                requiresAccountingApproval: report.requiresAccountingApproval,
                requiresAuditApproval: report.requiresAuditApproval,
                accountingApproved: report.accountingApproved,
                auditApproved: report.auditApproved,
              });

              // الموارد البشرية: جميع التقارير التي أنشأتها (سواء تتطلب موافقة أم لا)
              if (department === "HR") {
                return true; // كل التقارير أُنشئت من الموارد البشرية
              }
              // الحسابات: التقارير التي وافقت عليها (accountingApproved !== null)
              else if (department === "Accounting") {
                return report.accountingApproved !== null;
              }
              // التدقيق: التقارير التي اعتمدتها (auditApproved !== null)
              else if (department === "Audit") {
                return report.auditApproved !== null;
              }
              return false;
            })
            .map(report => {
              let to, status, type;

              if (department === "HR") {
                // تحديد الحالة والمستلم بناءً على سير العمل
                if (report.accountingApproved === null && report.requiresAccountingApproval) {
                  to = "الحسابات";
                  status = "pending";
                } else if (report.accountingApproved === false) {
                  to = "الحسابات";
                  status = "rejected";
                } else if (report.auditApproved === null && report.requiresAuditApproval) {
                  to = "التدقيق";
                  status = "pending";
                } else if (report.auditApproved === false) {
                  to = "التدقيق";
                  status = "rejected";
                } else {
                  to = "التدقيق";
                  status = "approved";
                }
                type = report.entitlementTypeName ? "entitlement" : "deduction";
              } else if (department === "Accounting") {
                // الحسابات أرسلت الموافقة/الرفض
                to = report.requiresAuditApproval ? "التدقيق" : "الموارد البشرية";
                status = report.accountingApproved ? "approved" : "rejected";
                type = report.accountingApproved ? "approval" : "rejection";
              } else if (department === "Audit") {
                // التدقيق أرسل الاعتماد النهائي
                to = "الموارد البشرية";
                status = report.auditApproved ? "approved" : "rejected";
                type = report.auditApproved ? "approval" : "rejection";
              }

              // استخراج المبلغ والنسبة المئوية
              const amount = report.entitlementAmount || report.deductionAmount;
              const percentage = report.entitlementPercentage || report.deductionPercentage;

              // بناء تفاصيل المبلغ
              let amountDetails = '';
              if (amount) {
                amountDetails = `المبلغ: ${amount.toLocaleString('ar-IQ')} دينار`;
              }
              if (percentage) {
                amountDetails += amount ? `\nالنسبة المئوية: ${percentage}%` : `النسبة المئوية: ${percentage}%`;
              }

              const message = {
                id: report.changeReportID,
                to,
                subject: `${report.entitlementTypeName || report.deductionTypeName} - ${report.employeeFullName}`,
                body: `${report.entitlementTypeName ? 'تخصيص' : 'استقطاع'}: ${report.entitlementTypeName || report.deductionTypeName}\n\nالموظف: ${report.employeeFullName}\n${amountDetails}\nتاريخ الإنشاء: ${report.createdAt ? new Date(report.createdAt).toLocaleDateString('ar-IQ') : 'غير محدد'}`,
                type,
                status,
                sentDate: report.createdAt || new Date().toISOString(),
                relatedId: report.changeReportID,
                responses: [],
                changeReport: report,
              };

              return message;
            });

          console.log("✅ [Outbox] Formatted messages:", formattedMessages.length);
          console.log("📋 [Outbox] Messages:", formattedMessages);

          // عرض الرسائل من API فقط (بدون بيانات تجريبية)
          setMessages(formattedMessages);
        } else {
          console.log("❌ [Outbox] API request failed");
          setMessages([]);
        }
      } catch (error) {
        console.error("❌ [Outbox] Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [department]);

  const getMessageIcon = (type) => {
    switch (type) {
      case "entitlement": return "💰";
      case "deduction": return "📉";
      case "approval": return "✅";
      case "rejection": return "❌";
      default: return "📧";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">⏳ قيد الانتظار</span>;
      case "approved":
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">✅ مقبول</span>;
      case "rejected":
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">❌ مرفوض</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">📧 مرسل</span>;
    }
  };

  const getMessageColor = (status) => {
    switch (status) {
      case "pending": return "border-yellow-300 bg-yellow-50";
      case "approved": return "border-green-300 bg-green-50";
      case "rejected": return "border-red-300 bg-red-50";
      default: return "border-gray-300 bg-white";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";

    const date = new Date(dateString);
    const now = new Date();

    // حساب الفرق بالدقائق والساعات
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // للتشخيص فقط - يمكن حذفها لاحقاً
    console.log("تاريخ الرسالة:", dateString);
    console.log("الوقت الحالي:", now);
    console.log("تاريخ الرسالة (parsed):", date);
    console.log("الفرق بالدقائق:", diffInMinutes);

    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInDays === 1) return "أمس";
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;

    return date.toLocaleDateString("ar-IQ", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === "pending") return msg.status === "pending";
    if (filter === "approved") return msg.status === "approved";
    if (filter === "rejected") return msg.status === "rejected";
    return true;
  });

  const pendingCount = messages.filter(m => m.status === "pending").length;
  const approvedCount = messages.filter(m => m.status === "approved").length;
  const rejectedCount = messages.filter(m => m.status === "rejected").length;

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map(m => m.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMessages.length === 0) {
      alert("⚠️ الرجاء تحديد رسالة واحدة على الأقل للحذف");
      return;
    }

    const confirmMessage = selectedMessages.length === 1
      ? "هل أنت متأكد من حذف هذه الرسالة؟"
      : `هل أنت متأكد من حذف ${selectedMessages.length} رسالة؟`;

    if (!window.confirm(`${confirmMessage}\n\nتنبيه: لن تتمكن من استرجاعها بعد الحذف!`)) {
      return;
    }

    try {
      console.log("🗑️ [Outbox] Deleting messages:", selectedMessages);

      let successCount = 0;
      let failCount = 0;

      // حذف من API
      for (const messageId of selectedMessages) {
        const response = await fetch(`${BASE_URL}/ChangeReports/${messageId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
          console.warn(`⚠️ [Outbox] Failed to delete message ${messageId} from API`);
        }
      }

      // حذف من القائمة المحلية
      setMessages(messages.filter(m => !selectedMessages.includes(m.id)));

      // إذا كانت الرسالة المحذوفة محددة للعرض، إلغاء التحديد
      if (selectedMessage && selectedMessages.includes(selectedMessage.id)) {
        setSelectedMessage(null);
      }

      // مسح التحديدات
      setSelectedMessages([]);

      if (failCount > 0) {
        alert(`⚠️ تم حذف ${successCount} رسالة، فشل حذف ${failCount} رسالة`);
      } else {
        console.log(`✅ [Outbox] Successfully deleted ${successCount} messages`);
        alert(`✅ تم حذف ${successCount} رسالة بنجاح`);
      }
    } catch (error) {
      console.error("❌ [Outbox] Error deleting messages:", error);
      alert("❌ حدث خطأ أثناء حذف الرسائل");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white" dir="rtl">
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-l from-green-500 to-green-600 text-white px-6 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📤</span>
            <div>
              <h2 className="text-xl font-bold">مكتمل</h2>
              <p className="text-sm text-green-100 mt-0.5">
                {pendingCount > 0 ? `${pendingCount} طلب قيد الانتظار` : `${messages.length} رسالة مرسلة`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2.5 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action Bar - مثل Gmail */}
        <div className="px-6 py-3.5 border-b bg-gray-50/80">
          <div className="flex items-center gap-3">
            {/* Checkbox لتحديد الكل */}
            <input
              type="checkbox"
              checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
              title="تحديد الكل"
            />

            {/* أزرار الإجراءات */}
            {selectedMessages.length > 0 ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleDeleteSelected}
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
                  title="حذف"
                >
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {selectedMessages.length} محدد
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">لا توجد رسائل محددة</span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3.5 border-b bg-white flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "all"
                ? "bg-green-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            الكل ({messages.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "pending"
                ? "bg-green-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            قيد الانتظار ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "approved"
                ? "bg-green-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            مقبولة ({approvedCount})
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "rejected"
                ? "bg-green-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            مرفوضة ({rejectedCount})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden bg-gray-50">
          {/* Messages List */}
          <div className="w-2/5 border-l border-gray-200 overflow-y-auto bg-white">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-6xl mb-4">📭</span>
                <p>لا توجد رسائل</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 px-4 py-3.5 transition-all duration-150 cursor-pointer border-r-4 ${
                      selectedMessage?.id === message.id
                        ? "bg-green-50/70 border-r-green-500"
                        : "border-r-transparent hover:bg-gray-50"
                    } ${selectedMessages.includes(message.id) ? "bg-green-50/50" : ""}`}
                  >
                    {/* Checkbox مثل Gmail */}
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message.id)}
                      onChange={() => toggleMessageSelection(message.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer flex-shrink-0"
                    />

                    {/* محتوى الرسالة */}
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="flex-1 text-right min-w-0"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-2xl flex-shrink-0">{getMessageIcon(message.type)}</span>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900 truncate">
                              إلى: {message.to}
                            </span>
                            {getStatusBadge(message.status)}
                          </div>
                          <p className="text-sm mb-1.5 truncate font-medium text-gray-900">
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {message.body}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(message.sentDate)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Detail */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100/50">
            {selectedMessage ? (
              <div className="p-6">
                <div className={`border-2 rounded-xl p-6 bg-white shadow-sm ${getMessageColor(selectedMessage.status)}`}>
                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-5xl">{getMessageIcon(selectedMessage.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {selectedMessage.subject}
                        </h3>
                        {getStatusBadge(selectedMessage.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>إلى: <strong>{selectedMessage.to}</strong></span>
                        <span>•</span>
                        <span>{new Date(selectedMessage.sentDate).toLocaleString("ar-IQ")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 mb-4">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.body}
                    </p>
                  </div>

                  {/* Responses Timeline */}
                  {selectedMessage.responses && selectedMessage.responses.length > 0 && (
                    <div className="bg-white rounded-lg p-6">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>📝</span>
                        سجل الردود
                      </h4>
                      <div className="space-y-3">
                        {selectedMessage.responses.map((response, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-r-4 ${
                              response.action === "approved"
                                ? "bg-green-50 border-green-500"
                                : "bg-red-50 border-red-500"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-gray-800">
                                {response.from}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(response.date).toLocaleString("ar-IQ")}
                              </span>
                            </div>
                            <p className="text-gray-700">{response.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMessage.status === "pending" && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-yellow-800 font-medium mt-4">
                      ⏳ هذا الطلب قيد المراجعة من قبل {selectedMessage.to}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-6xl mb-4">📧</span>
                <p>اختر رسالة لعرضها</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

MessageOutbox.propTypes = {
  department: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
