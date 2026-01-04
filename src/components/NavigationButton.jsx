import { useNavigate } from "react-router-dom";

/**
 * زر تنقل قابل للنقر بزر الماوس الأيمن لفتح في تبويب جديد
 *
 * @param {Object} props
 * @param {string} props.to - المسار المراد الانتقال إليه
 * @param {ReactNode} props.children - محتوى الزر
 * @param {string} props.className - الأنماط الإضافية
 * @param {Function} props.onClick - دالة إضافية عند النقر (اختياري)
 * @returns {JSX.Element}
 *
 * @example
 * <NavigationButton to="/employee-summary/123" className="text-blue-600">
 *   عرض
 * </NavigationButton>
 */
export default function NavigationButton({ to, children, className = "", onClick, ...props }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
    }
    navigate(to);
  };

  const handleMiddleClick = (e) => {
    // النقر بعجلة الماوس (الزر الأوسط)
    if (e.button === 1) {
      e.preventDefault();
      window.open(to, '_blank');
    }
  };

  const handleRightClick = (e) => {
    // السماح بقائمة السياق الافتراضية للمتصفح
    // لا نحتاج لمنعها، المتصفح سيتعامل معها تلقائياً
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      onAuxClick={handleMiddleClick}
      onContextMenu={handleRightClick}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}
