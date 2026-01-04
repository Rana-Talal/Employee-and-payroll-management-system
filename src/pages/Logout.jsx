import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // احذف كل بيانات المستخدم التي خزنتها
    localStorage.removeItem("token");
    localStorage.removeItem("userName");

    // تأخير بسيط ثم إعادة التوجيه إلى صفحة تسجيل الدخول
    const timer = setTimeout(() => {
      navigate("/login", { replace: true }); // تأكد من مسار صفحة تسجيل الدخول هنا
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-700 text-lg">جاري تسجيل الخروج...</p>
    </div>
  );
}

