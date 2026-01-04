import { useNavigate } from "react-router-dom";

export default function MainDashboard() {
  const navigate = useNavigate();

  const departments = [
    {
      id: 1,
      name: "الموارد البشرية",
      icon: "👥",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-300",
      description: "إدارة الموظفين والمخصصات والاستقطاعات",
      path: "/hr-dashboard"
    },
    {
      id: 2,
      name: "الحسابات",
      icon: "💼",
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-300",
      description: "إدارة الرواتب والموافقات المالية",
      path: "/accounting-dashboard"
    },
    {
      id: 3,
      name: "التدقيق",
      icon: "🔍",
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-50 to-pink-50",
      borderColor: "border-purple-300",
      description: "مراجعة واعتماد التقارير",
      path: "/audit-dashboard"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-start justify-center pt-12 p-6" dir="rtl">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-gray-800 mb-3">
            نظام إدارة الموظفين
          </h1>
          {/* <p className="text-xl text-gray-600">اختر القسم الذي تريد الدخول إليه</p> */}
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => navigate(dept.path)}
              className={`relative overflow-hidden rounded-2xl shadow-xl border-2 ${dept.borderColor} bg-gradient-to-br ${dept.bgColor} p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 group`}
            >
              {/* Icon */}
              <div className="text-center mb-6">
                <div className="text-7xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {dept.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {dept.name}
                </h2>
              </div>

              {/* Description */}
              <p className="text-center text-gray-600 text-sm mb-6">
                {dept.description}
              </p>

              {/* Button */}
              <div className={`bg-gradient-to-r ${dept.color} text-white py-3 px-6 rounded-lg font-bold text-center group-hover:shadow-lg transition-shadow`}>
                الدخول إلى القسم
              </div>

              {/* Decorative gradient bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${dept.color}`}></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
