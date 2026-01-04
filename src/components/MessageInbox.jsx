import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const BASE_URL = "/api";

export default function MessageInbox({ department, onClose }) {
  console.log("📧 MessageInbox component initialized with department:", department);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [selectedMessages, setSelectedMessages] = useState([]); // للرسائل المحددة بالـ checkbox

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    console.log("🔄 MessageInbox mounted for department:", department);
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department]);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      // استخدام ChangeReports API
      const response = await fetch(`${BASE_URL}/ChangeReports?PageSize=1000`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const changeReports = Array.isArray(data) ? data : data.items || [];

        console.log("✅ ChangeReports API Response:", {
          totalReports: changeReports.length,
          department: department,
          data: changeReports
        });

        // تحويل ChangeReports إلى رسائل حسب القسم
        const formattedMessages = changeReports
          .filter(report => {
            console.log(`Checking report ${report.changeReportID} for ${department}:`, {
              accountingApproved: report.accountingApproved,
              auditApproved: report.auditApproved,
              requiresAccountingApproval: report.requiresAccountingApproval,
              requiresAuditApproval: report.requiresAuditApproval
            });

            // تصفية الرسائل حسب القسم
            if (department === "HR") {
              // الموارد البشرية تستقبل جميع الردود (موافقة أو رفض)
              const hasResponse = report.accountingApproved !== null || report.auditApproved !== null;
              console.log(`HR filter result:`, hasResponse);
              return hasResponse;
            } else if (department === "Accounting") {
              // الحسابات تستقبل الطلبات التي:
              // 1. تحتاج موافقة الحسابات
              // 2. لم توافق عليها الحسابات بعد (null أو false)
              const needsApproval = report.requiresAccountingApproval && report.accountingApproved !== true;
              console.log(`📊 Checking report ${report.changeReportID} for Accounting:`, {
                requiresAccountingApproval: report.requiresAccountingApproval,
                accountingApproved: report.accountingApproved,
                needsApproval: needsApproval,
                entitlementTypeName: report.entitlementTypeName,
                deductionTypeName: report.deductionTypeName
              });
              return needsApproval;
            } else if (department === "Audit") {
              // التدقيق يستقبل الطلبات التي وافقت عليها الحسابات ولم يوافق عليها التدقيق بعد
              const needsApproval = report.requiresAuditApproval &&
                                    report.accountingApproved === true &&
                                    report.auditApproved !== true;
              console.log(`Audit filter result:`, needsApproval);
              return needsApproval;
            }
            return false;
          })
          .map(report => {
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

            // تحديد الحالة بناءً على القسم والموافقات
            let status = "pending";
            if (department === "Accounting") {
              // في صندوق وارد الحسابات: دائماً pending (بانتظار الموافقة)
              status = "pending";
            } else if (department === "Audit") {
              // في صندوق وارد التدقيق: دائماً pending (بانتظار الموافقة)
              status = "pending";
            } else if (department === "HR") {
              // في صندوق وارد الموارد البشرية: نعرض الردود
              if (report.auditApproved === true) {
                status = "approved";
              } else if (report.accountingApproved === true && report.auditApproved !== true) {
                status = "pending"; // وافقت الحسابات وبانتظار التدقيق
              } else {
                status = "pending";
              }
            }

            return {
              id: report.changeReportID,
              from: department === "HR"
                ? (report.auditApproved !== null ? "التدقيق" : "الحسابات")
                : "الموارد البشرية",
              subject: `${report.entitlementTypeName || report.deductionTypeName} - ${report.employeeFullName}`,
              body: `${report.entitlementTypeName ? 'تخصيص' : 'استقطاع'}: ${report.entitlementTypeName || report.deductionTypeName}\n\nالموظف: ${report.employeeFullName}\n${amountDetails}\nتاريخ الإنشاء: ${report.createdAt ? new Date(report.createdAt).toLocaleDateString('ar-IQ') : 'غير محدد'}`,
              type: report.entitlementTypeName ? "entitlement" : "deduction",
              status: status,
              isRead: false,
              createdDate: report.createdAt,
              relatedId: report.changeReportID,
              changeReport: report, // حفظ البيانات الكاملة
            };
          });

        console.log(`✅ Filtered messages for ${department}:`, {
          count: formattedMessages.length,
          messages: formattedMessages
        });

        // عرض الرسائل من API فقط (بدون بيانات تجريبية)
        console.log(`✅ Setting ${formattedMessages.length} messages for ${department}`);
        setMessages(formattedMessages);
      } else {
        console.error("❌ API Response not OK:", response.status);
        setMessages([]);
      }
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    // يمكن تنفيذ هذا لاحقاً إذا لزم الأمر
    console.log("Mark as read:", messageId);
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const handleApprove = async (message) => {
    if (!message.changeReport) return;

    try {
      const endpoint = department === "Accounting"
        ? `${BASE_URL}/ChangeReports/ApproveAccounting/${message.changeReport.changeReportID}`
        : `${BASE_URL}/ChangeReports/ApproveAudit/${message.changeReport.changeReportID}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        alert("✅ تمت الموافقة بنجاح");
        fetchMessages(); // إعادة تحميل الرسائل
        setSelectedMessage(null);
      } else {
        alert("❌ فشلت الموافقة");
      }
    } catch (error) {
      console.error("خطأ في الموافقة:", error);
      alert("❌ حدث خطأ أثناء الموافقة");
    }
  };

  const handleReject = async (message) => {
    if (!message.changeReport) return;

    if (!window.confirm("هل أنت متأكد من رفض هذا الطلب؟")) {
      return;
    }

    try {
      // في الوقت الحالي، نستخدم DELETE لرفض الطلب
      const response = await fetch(`${BASE_URL}/ChangeReports/${message.changeReport.changeReportID}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        alert("✅ تم رفض الطلب");
        fetchMessages(); // إعادة تحميل الرسائل
        setSelectedMessage(null);
      } else {
        alert("❌ فشل الرفض");
      }
    } catch (error) {
      console.error("خطأ في الرفض:", error);
      alert("❌ حدث خطأ أثناء الرفض");
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case "entitlement": return "💰";
      case "deduction": return "📉";
      case "approval": return "✅";
      case "rejection": return "❌";
      default: return "📧";
    }
  };

  const getMessageColor = (type, status) => {
    if (status === "rejected") return "border-red-300 bg-red-50";
    if (status === "approved") return "border-green-300 bg-green-50";
    if (type === "entitlement") return "border-blue-300 bg-blue-50";
    if (type === "deduction") return "border-orange-300 bg-orange-50";
    return "border-gray-300 bg-white";
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
    if (filter === "unread") return !msg.isRead;
    if (filter === "read") return msg.isRead;
    return true;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

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
      // حذف من API
      for (const messageId of selectedMessages) {
        await fetch(`${BASE_URL}/ChangeReports/${messageId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
      }

      // حذف من القائمة
      setMessages(messages.filter(m => !selectedMessages.includes(m.id)));

      // إذا كانت الرسالة المحذوفة محددة للعرض، إلغاء التحديد
      if (selectedMessage && selectedMessages.includes(selectedMessage.id)) {
        setSelectedMessage(null);
      }

      // مسح التحديدات
      setSelectedMessages([]);

      alert(`✅ تم حذف ${selectedMessages.length} رسالة بنجاح`);
    } catch (error) {
      console.error("خطأ في حذف الرسائل:", error);
      alert("❌ حدث خطأ أثناء حذف الرسائل");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white" dir="rtl">
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-l from-blue-500 to-blue-600 text-white px-6 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📥</span>
            <div>
              <h2 className="text-xl font-bold">قيد المعالجة </h2>
              <p className="text-sm text-blue-100 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} رسالة غير مقروءة` : 'لا توجد رسائل جديدة'}
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
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            الكل ({messages.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "unread"
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            غير مقروءة ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "read"
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            مقروءة ({messages.length - unreadCount})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden bg-gray-50">
          {/* Messages List */}
          <div className="w-2/5 border-l border-gray-200 overflow-y-auto bg-white">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                        ? "bg-blue-50/70 border-r-blue-500"
                        : "border-r-transparent hover:bg-gray-50"
                    } ${selectedMessages.includes(message.id) ? "bg-blue-50/50" : ""}`}
                  >
                    {/* Checkbox مثل Gmail */}
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message.id)}
                      onChange={() => toggleMessageSelection(message.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                    />

                    {/* محتوى الرسالة */}
                    <button
                      onClick={() => handleMessageClick(message)}
                      className="flex-1 text-right min-w-0"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-2xl flex-shrink-0">{getMessageIcon(message.type)}</span>
                        <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold ${message.isRead ? "text-gray-600" : "text-gray-900"}`}>
                            {message.from}
                          </span>
                          {!message.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className={`text-sm mb-1.5 truncate ${message.isRead ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {message.body}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(message.createdDate)}
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
                <div className={`border-2 rounded-xl p-6 bg-white shadow-sm ${getMessageColor(selectedMessage.type, selectedMessage.status)}`}>
                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-5xl">{getMessageIcon(selectedMessage.type)}</span>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedMessage.subject}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>من: <strong>{selectedMessage.from}</strong></span>
                        <span>•</span>
                        <span>{new Date(selectedMessage.createdDate).toLocaleString("ar-IQ")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 mb-4">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.body}
                    </p>
                  </div>

                  {/* أزرار الموافقة/الرفض للحسابات والتدقيق */}
                  {selectedMessage.status === "pending" && department !== "HR" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedMessage)}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        ✅ موافقة
                      </button>
                      <button
                        onClick={() => handleReject(selectedMessage)}
                        className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
                      >
                        ❌ رفض
                      </button>
                    </div>
                  )}

                  {selectedMessage.status === "approved" && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-green-800 font-medium">
                      ✅ تمت الموافقة على هذا الطلب
                    </div>
                  )}

                  {selectedMessage.status === "rejected" && (
                    <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-red-800 font-medium">
                      ❌ تم رفض هذا الطلب
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

MessageInbox.propTypes = {
  department: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
