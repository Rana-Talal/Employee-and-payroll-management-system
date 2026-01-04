import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavigationButton from "../components/NavigationButton";
import MessageInbox from "../components/MessageInbox";
import MessageOutbox from "../components/MessageOutbox";

const BASE_URL = "/api";

export default function AccountingDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeSalaries: 0,
    pendingReports: 0,
    approvedReports: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");

  // حالات الرسائل
  const [showInbox, setShowInbox] = useState(false);
  const [showOutbox, setShowOutbox] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    // جلب عدد الرسائل غير المقروءة
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${BASE_URL}/ChangeReports?PageSize=1000`, {
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          const changeReports = Array.isArray(data) ? data : data.items || [];

          // حساب الرسائل غير المقروءة للحسابات
          // الحسابات تستقبل الطلبات التي تحتاج موافقتها ولم توافق عليها بعد
          const accountingMessages = changeReports.filter(report =>
            report.requiresAccountingApproval && report.accountingApproved === null
          );

          setUnreadCount(accountingMessages.length);
        } else {
          setUnreadCount(0);
        }
      } catch (error) {
        console.error("خطأ في جلب عدد الرسائل:", error);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // جلب الموظفين
        const employeeRes = await fetch(`${BASE_URL}/Employee?PageSize=1000`, {
          headers: getAuthHeaders(),
        });
        const employees = await employeeRes.json();
        const employeeList = Array.isArray(employees) ? employees : employees.items || [];

        // جلب تقارير التغييرات
        const reportsRes = await fetch(`${BASE_URL}/ChangeReports?PageSize=1000`, {
          headers: getAuthHeaders(),
        });
        const reports = await reportsRes.json();
        const reportsList = Array.isArray(reports) ? reports : reports.items || [];

        // حساب الإحصائيات
        setStats({
          totalEmployees: employeeList.length,
          activeSalaries: employeeList.filter(e => e.baseSalary > 0).length,
          pendingReports: reportsList.filter(r => r.changeStatus === 2 && !r.accountingApproved).length,
          approvedReports: reportsList.filter(r => r.accountingApproved).length,
        });

        // آخر 5 موظفين مضافين
        const recent = employeeList.slice(0, 5).map(emp => {
          const fullName = emp.fullName || [
            emp.firstName,
            emp.secondName,
            emp.thirdName,
            emp.fourthName,
            emp.lastName
          ].filter(Boolean).join(" ") || "غير معروف";

          return {
            id: emp.id,
            name: fullName,
            jobTitle: emp.jobTitle || "غير محدد",
            department: emp.departmentName || "غير محدد",
          };
        });

        setRecentEmployees(recent);
        setFilteredEmployees(recent);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        if (error.message?.includes("401")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    const filtered = recentEmployees.filter(emp => {
      const matchesName = searchName.trim() === "" ||
        emp.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesDepartment = searchDepartment.trim() === "" ||
        emp.department.toLowerCase().includes(searchDepartment.toLowerCase());
      return matchesName && matchesDepartment;
    });
    setFilteredEmployees(filtered);
  }, [searchName, searchDepartment, recentEmployees]);

  // بطاقة تفاعلية
  const StatCard = ({ title, value, icon, color, onClick, clickable = false }) => (
    <div
      onClick={clickable ? onClick : undefined}
      className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-all duration-300 ${
        clickable
          ? 'hover:shadow-xl hover:scale-105 cursor-pointer hover:border-blue-300 active:scale-95'
          : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{loading ? "..." : value}</p>
          {clickable && (
            <p className="text-xs text-gray-400 mt-2">انقر للعرض التفصيلي ←</p>
          )}
        </div>
        <div className={`text-4xl ${color} opacity-20`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-l border-gray-200 shadow-lg flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">💼</span>
              الحسابات
            </h2>
            <p className="text-sm text-gray-500 mt-1">إدارة الرواتب والموافقات</p>
          </div>

          <nav className="space-y-2">
            {/* لوحة التحكم */}
            <button
              onClick={() => navigate("/accounting-dashboard")}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition flex items-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">🏠</span>
              <span>لوحة التحكم</span>
            </button>

            <div className="border-t border-gray-200 my-3"></div>

            {/* الرسائل */}
            <div className="px-2 py-1">
              <p className="text-xs font-bold text-gray-500 mb-2">📬 الرسائل</p>
            </div>

            <button
              onClick={() => setShowInbox(true)}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg group-hover:scale-110 transition-transform">📥</span>
                <span>قيد المعالجة  </span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowOutbox(true)}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition flex items-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">📤</span>
              <span>مكتمل</span>
            </button>

            <div className="border-t border-gray-200 my-3"></div>

            {/* إدارة الرواتب */}
            <button
              onClick={() => navigate("/salary-department")}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition flex items-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">💵</span>
              <span>إدارة الرواتب</span>
            </button>

            {/* تقارير التغييرات والموافقات */}
            <button
              onClick={() => navigate("/accounting-change-reports")}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition flex items-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">📊</span>
              <span>تقارير التغييرات والموافقات</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي الموظفين"
              value={stats.totalEmployees}
              icon="👥"
              color="text-blue-600"
              clickable={false}
            />
            <StatCard
              title="الرواتب النشطة"
              value={stats.activeSalaries}
              icon="💰"
              color="text-green-600"
              clickable={false}
            />
            <StatCard
              title="التقارير المعلقة"
              value={stats.pendingReports}
              icon="⏳"
              color="text-orange-600"
              clickable={true}
              onClick={() => navigate("/accounting-change-reports")}
            />
            <StatCard
              title="التقارير المعتمدة"
              value={stats.approvedReports}
              icon="✅"
              color="text-emerald-600"
              clickable={false}
            />
          </div>



          {/* Recent Activity */}
          {stats.pendingReports > 0 && (
            <div className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-3xl">⚠️</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">تنبيه: تقارير تحتاج للموافقة</h3>
                  <p className="text-gray-700 mb-3">
                    لديك <span className="font-bold text-orange-600">{stats.pendingReports}</span> تقرير تغيير بانتظار موافقة الحسابات
                  </p>
                  <button
                    onClick={() => navigate("/accounting-change-reports")}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                  >
                    عرض التقارير المعلقة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* جدول الموظفين */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">الموظفون المضافون مؤخراً</h2>
              <button
                onClick={() => navigate("/salary-department")}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                عرض الكل
              </button>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="البحث عن الاسم..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="البحث عن القسم..."
                value={searchDepartment}
                onChange={(e) => setSearchDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchName || searchDepartment ? "لا توجد نتائج للبحث" : "لا توجد بيانات"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-right p-3 font-semibold text-gray-700">الاسم</th>
                      <th className="text-right p-3 font-semibold text-gray-700">المنصب</th>
                      <th className="text-right p-3 font-semibold text-gray-700">القسم</th>
                      <th className="text-right p-3 font-semibold text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50 transition">
                        <td className="p-3 font-medium text-gray-900">{emp.name}</td>
                        <td className="p-3 text-gray-600">{emp.jobTitle}</td>
                        <td className="p-3 text-gray-600">{emp.department}</td>
                        <td className="p-3">
                          <NavigationButton
                            to={`/employee-summary/${emp.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                          >
                            عرض
                          </NavigationButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Modals */}
      {showInbox && <MessageInbox department="Accounting" onClose={() => setShowInbox(false)} />}
      {showOutbox && <MessageOutbox department="Accounting" onClose={() => setShowOutbox(false)} />}
    </div>
  );
}
