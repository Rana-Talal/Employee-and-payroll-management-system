import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavigationButton from "../components/NavigationButton";

const BASE_URL = "/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeSalaries: 0,
    departments: 0,
    branches: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");

  // حالات جديدة للـ Slide-over Panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState(null); // 'branches' | 'departments'
  const [panelData, setPanelData] = useState([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchDepartments, setBranchDepartments] = useState([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

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

        // جلب الأقسام
        const deptRes = await fetch(`${BASE_URL}/Departments?PageSize=1000`, {
          headers: getAuthHeaders(),
        });
        const departments = await deptRes.json();
        const deptList = Array.isArray(departments) ? departments : departments.items || [];

        // جلب الفروع
        const branchRes = await fetch(`${BASE_URL}/Branch?PageSize=1000`, {
          headers: getAuthHeaders(),
        });
        const branches = await branchRes.json();
        const branchList = Array.isArray(branches) ? branches : branches.items || [];

        // حساب الإحصائيات
        setStats({
          totalEmployees: employeeList.length,
          activeSalaries: employeeList.filter(e => e.baseSalary > 0).length,
          departments: deptList.length,
          branches: branchList.length,
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

  // فتح لوحة الفروع
  const openBranchesPanel = async () => {
    setPanelType('branches');
    setIsPanelOpen(true);
    setPanelLoading(true);
    setSelectedBranch(null);
    setBranchDepartments([]);

    try {
      const response = await fetch(`${BASE_URL}/Branch?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      const branchList = Array.isArray(data) ? data : data.items || [];
      setPanelData(branchList);
    } catch (error) {
      console.error("خطأ في جلب الفروع:", error);
    } finally {
      setPanelLoading(false);
    }
  };

  // فتح لوحة الأقسام
  const openDepartmentsPanel = async () => {
    setPanelType('departments');
    setIsPanelOpen(true);
    setPanelLoading(true);
    setSelectedBranch(null);
    setBranchDepartments([]);

    try {
      const response = await fetch(`${BASE_URL}/Departments?PageSize=1000`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      const deptList = Array.isArray(data) ? data : data.items || [];
      setPanelData(deptList);
    } catch (error) {
      console.error("خطأ في جلب الأقسام:", error);
    } finally {
      setPanelLoading(false);
    }
  };

  // عرض أقسام فرع معين
  const showBranchDepartments = async (branch) => {
    setSelectedBranch(branch);
    setPanelLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/Departments/by-branch/${branch.branchID}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      const deptList = Array.isArray(data) ? data : data.items || [];
      setBranchDepartments(deptList);
    } catch (error) {
      console.error("خطأ في جلب أقسام الفرع:", error);
      setBranchDepartments([]);
    } finally {
      setPanelLoading(false);
    }
  };

  // الرجوع لقائمة الفروع
  const backToBranches = () => {
    setSelectedBranch(null);
    setBranchDepartments([]);
  };

  // إغلاق اللوحة
  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setPanelType(null);
      setPanelData([]);
      setSelectedBranch(null);
      setBranchDepartments([]);
    }, 300);
  };

  // بطاقة تفاعلية حديثة
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
        <div className={`text-4xl ${color} opacity-20 transition-transform ${clickable ? 'group-hover:scale-110' : ''}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Modal Component - في الوسط
  const SlideOverPanel = () => {
    if (!isPanelOpen) return null;

    return (
      <>
        {/* Panel - من اليمين بارتفاع كامل */}
        <div
          className={`fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-all duration-300 ease-in-out flex flex-col ${
            isPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          dir="rtl"
        >
          {/* Header - تصميم أنيق */}
          <div className="bg-gradient-to-l from-blue-600 to-blue-500 text-white p-5 flex items-center justify-between shadow-lg flex-shrink-0">
            <h2 className="text-2xl font-bold">
              {panelType === 'branches' ? '🏢 الفروع' : '📁 الأقسام'}
            </h2>
            <button
              onClick={closePanel}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Breadcrumb Navigation */}
          {panelType === 'branches' && selectedBranch && (
            <div className="bg-gray-50 px-6 py-3 border-b flex items-center gap-2 flex-shrink-0">
              <button
                onClick={backToBranches}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              >
                ← الرجوع
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700 font-medium">{selectedBranch.name}</span>
            </div>
          )}

          {/* Content - قابل للتمرير */}
          <div className="overflow-y-auto flex-1 p-6">
            {panelLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* عرض الفروع */}
                {panelType === 'branches' && !selectedBranch && (
                  <div className="space-y-3">
                    {panelData.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">لا توجد فروع</p>
                    ) : (
                      panelData.map((branch) => (
                        <div
                          key={branch.branchID}
                          onClick={() => showBranchDepartments(branch)}
                          className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 text-lg mb-2">{branch.name}</h3>
                              <div className="flex gap-4 text-sm">
                                <span className="text-gray-600">
                                  📁 {branch.departmentCount} قسم
                                </span>
                                <span className="text-gray-600">
                                  👥 {branch.employeeCount} موظف
                                </span>
                              </div>
                            </div>
                            <div className="text-blue-600 group-hover:translate-x-[-4px] transition-transform">
                              ←
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* عرض أقسام الفرع المحدد */}
                {panelType === 'branches' && selectedBranch && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h3 className="font-bold text-gray-800 mb-2">📊 إحصائيات الفرع</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-3 rounded">
                          <span className="text-gray-600">الأقسام: </span>
                          <span className="font-bold text-blue-600">{branchDepartments.length}</span>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <span className="text-gray-600">الموظفين: </span>
                          <span className="font-bold text-green-600">{selectedBranch.employeeCount}</span>
                        </div>
                      </div>
                    </div>

                    {branchDepartments.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">لا توجد أقسام في هذا الفرع</p>
                    ) : (
                      branchDepartments.map((dept) => (
                        <div
                          key={dept.departmentID}
                          className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                        >
                          <h4 className="font-bold text-gray-800 mb-2">{dept.name}</h4>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>🏢 {dept.unitCount} وحدة</span>
                            <span>👥 {dept.employeeCount} موظف</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* عرض جميع الأقسام */}
                {panelType === 'departments' && (
                  <div className="space-y-3">
                    {panelData.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">لا توجد أقسام</p>
                    ) : (
                      panelData.map((dept) => (
                        <div
                          key={dept.departmentID}
                          className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-lg border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all"
                        >
                          <h3 className="font-bold text-gray-800 text-lg mb-2">{dept.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {dept.branchName}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>🏢 {dept.unitCount} وحدة</span>
                            <span>👥 {dept.employeeCount} موظف</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar ثابت */}
      <aside className="w-80 bg-white border-l border-gray-200 shadow-lg flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">


          <nav className="space-y-2">
            {/* لوحة التحكم */}
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition flex items-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">🏠</span>
              <span>لوحة التحكم</span>
            </button>

            {/* إدارة المخصصات والاستقطاعات */}
            <button
              onClick={() => navigate("/entitlements-deductions")}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition flex items-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">💰</span>
              <span>إدارة المخصصات والاستقطاعات</span>
            </button>

            {/* تقارير التغييرات والموافقات */}
            <button
              onClick={() => navigate("/change-reports")}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium transition flex items-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">📊</span>
              <span>تقارير التغييرات والموافقات</span>
            </button>

            <div className="border-t border-gray-200 my-3"></div>

            {/* باقي الإجراءات */}
            <button
              onClick={() => navigate("/data-NewEmployee")}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition flex items-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">➕</span>
              <span>إضافة موظف جديد</span>
            </button>

            <button
              onClick={() => navigate("/hr-department")}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition flex items-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">👥</span>
              <span>إدارة الموظفين</span>
            </button>

            <button
              onClick={() => navigate("/salary-department")}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition flex items-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">💵</span>
              <span>إدارة الرواتب</span>
            </button>

            <button
              onClick={() => navigate("/add-branch-dept-unit")}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition flex items-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">🏢</span>
              <span>الفروع والأقسام</span>
            </button>

            <button
              onClick={() => navigate("/courses")}
              className="w-full text-right px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition flex items-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">📚</span>
              <span>إدارة الدورات</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة التحكم</h1>
            <p className="text-gray-600">نظرة عامة على النظام</p>
          </div>

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
              title="الفروع"
              value={stats.branches}
              icon="🏢"
              color="text-orange-600"
              clickable={true}
              onClick={openBranchesPanel}
            />
            <StatCard
              title="الأقسام"
              value={stats.departments}
              icon="📁"
              color="text-purple-600"
              clickable={true}
              onClick={openDepartmentsPanel}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">الموظفون المضافون مؤخراً</h2>
              <button
                onClick={() => navigate("/hr-department")}
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

      {/* Slide-over Panel */}
      <SlideOverPanel />
    </div>
  );
}
