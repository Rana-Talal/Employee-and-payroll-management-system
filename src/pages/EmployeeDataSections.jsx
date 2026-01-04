import React, { useState } from "react";
import { Tab } from "@headlessui/react";
import {
    UserIcon,
    BriefcaseIcon,
    IdentificationIcon,
    AcademicCapIcon,
    HomeIcon,
    CurrencyDollarIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChevronRightIcon,
    SparklesIcon,
    ChartBarIcon, // أيقونة جديدة للتصميم الخامس
} from "@heroicons/react/24/solid";
import { UserCircleIcon } from "@heroicons/react/24/outline";

// دالة مساعدة لتنسيق العملة
const formatCurrency = (amount) => {
    return amount.toLocaleString("ar-IQ") + " د.ع";
};

// دالة مساعدة لعرض القيمة أو "-"
const DisplayValue = ({ value }) => <p className="text-gray-900 font-medium">{value || "—"}</p>;

// =============== التصميم الأول: البطاقات المتطورة ===============
export const DesignOne = ({ employeeData, baseSalary }) => {
    const [activeSection, setActiveSection] = useState("personal");

    const sections = [
        { id: "personal", title: "البيانات الشخصية", icon: UserIcon, data: employeeData.personal },
        { id: "education", title: "التعليم والشهادات", icon: AcademicCapIcon, data: employeeData.education },
        { id: "job", title: "بيانات الوظيفة", icon: BriefcaseIcon, data: employeeData.job },
        { id: "identity", title: "بيانات الهوية", icon: IdentificationIcon, data: employeeData.identity },
        { id: "address", title: "العنوان", icon: HomeIcon, data: employeeData.address }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* الهيدر الرئيسي */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <UserCircleIcon className="w-14 h-14 text-white" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-3xl font-bold mb-1">{employeeData.personal["الاسم الكامل"]}</h2>
                            <p className="text-blue-100 text-lg">{employeeData.job["العنوان الوظيفي"]} • {employeeData.job["الرقم الوظيفي"]}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-blue-100 text-sm mb-1">الراتب الأساسي</p>
                        <p className="text-4xl font-bold text-white">{formatCurrency(baseSalary)}</p>
                    </div>
                </div>
            </div>

            {/* أزرار التنقل */}
            <div className="flex overflow-x-auto bg-gray-50 border-b border-gray-200">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-2 px-6 py-4 border-b-3 transition-all whitespace-nowrap ${
                                activeSection === section.id
                                    ? "bg-white border-b-4 border-blue-600 text-blue-600 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent"
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{section.title}</span>
                        </button>
                    );
                })}
            </div>

            {/* المحتوى */}
            <div className="p-8">
                {sections.map((section) => {
                    if (section.id !== activeSection) return null;
                    return (
                        <div key={section.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(section.data).map(([key, value]) => (
                                <div key={key} className="group">
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{key}</p>
                                        <DisplayValue value={value} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// =============== التصميم الثاني: التبويبات الأنيقة ===============
export const DesignTwo = ({ employeeData, baseSalary }) => {
    const tabs = [
        { title: "الشخصية", icon: UserIcon, data: employeeData.personal },
        { title: "التعليم", icon: AcademicCapIcon, data: employeeData.education },
        { title: "الوظيفة", icon: BriefcaseIcon, data: employeeData.job },
        { title: "الهوية", icon: IdentificationIcon, data: employeeData.identity },
        { title: "العنوان", icon: HomeIcon, data: employeeData.address }
    ];

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            {/* البطاقة العلوية */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
                <div className="relative p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-28 h-28 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                            <UserCircleIcon className="w-20 h-20 text-white" />
                        </div>
                        <div className="flex-1 text-center md:text-right">
                            <h2 className="text-3xl font-bold text-white mb-2">{employeeData.personal["الاسم الكامل"]}</h2>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                                    <BriefcaseIcon className="w-4 h-4 inline-block ml-1" />
                                    {employeeData.job["العنوان الوظيفي"]}
                                </span>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                                    <IdentificationIcon className="w-4 h-4 inline-block ml-1" />
                                    {employeeData.job["الرقم الوظيفي"]}
                                </span>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                                    <CurrencyDollarIcon className="w-4 h-4 inline-block ml-1" />
                                    {formatCurrency(baseSalary)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* التبويبات */}
            <Tab.Group>
                <Tab.List className="flex overflow-x-auto bg-gray-100 p-1 rounded-xl mx-6 -mt-6 relative shadow-lg">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <Tab
                                key={tab.title}
                                className={({ selected }) =>
                                    `flex-1 flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        selected
                                            ? "bg-white text-blue-600 shadow-md"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5" />
                                <span className="hidden sm:inline">{tab.title}</span>
                            </Tab>
                        );
                    })}
                </Tab.List>

                <Tab.Panels className="p-8">
                    {tabs.map((tab) => (
                        <Tab.Panel key={tab.title} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(tab.data).map(([key, value]) => (
                                <div key={key} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 mb-1">{key}</p>
                                        <DisplayValue value={value} />
                                    </div>
                                </div>
                            ))}
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

// =============== التصميم الثالث: البطاقة الموحدة الحديثة ===============
export const DesignThree = ({ employeeData, baseSalary }) => {
    const [expandedSections, setExpandedSections] = useState(["personal"]);

    const sections = [
        { id: "personal", title: "البيانات الشخصية", icon: UserIcon, gradient: "from-blue-500 to-blue-600", data: employeeData.personal },
        { id: "education", title: "التعليم والشهادات", icon: AcademicCapIcon, gradient: "from-purple-500 to-purple-600", data: employeeData.education },
        { id: "job", title: "بيانات الوظيفة", icon: BriefcaseIcon, gradient: "from-green-500 to-green-600", data: employeeData.job },
        { id: "identity", title: "بيانات الهوية", icon: IdentificationIcon, gradient: "from-orange-500 to-orange-600", data: employeeData.identity },
        { id: "address", title: "العنوان", icon: HomeIcon, gradient: "from-pink-500 to-pink-600", data: employeeData.address }
    ];

    const toggleSection = (id) => {
        setExpandedSections(prev => 
            prev.includes(id) 
                ? prev.filter(s => s !== id)
                : [...prev, id]
        );
    };

    return (
        <div className="space-y-4 bg-gray-50 p-6 rounded-2xl">
            {/* البطاقة الرئيسية (الهيدر) */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-1">
                    <div className="bg-white p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                    <UserCircleIcon className="w-12 h-12 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{employeeData.personal["الاسم الكامل"]}</h2>
                                    <p className="text-gray-600">{employeeData.job["العنوان الوظيفي"]}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">الرقم الوظيفي</p>
                                    <p className="text-gray-900 font-bold">{employeeData.job["الرقم الوظيفي"]}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">القسم</p>
                                    <p className="text-gray-900 font-bold">{employeeData.job["القسم"]}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">الراتب الأساسي</p>
                                    <p className="text-green-600 font-bold">{formatCurrency(baseSalary)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* الأقسام القابلة للطي (Accordion) */}
            {sections.map((section) => {
                const Icon = section.icon;
                const isExpanded = expandedSections.includes(section.id);
                
                return (
                    <div key={section.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
                        <button
                            onClick={() => toggleSection(section.id)}
                            className={`w-full flex items-center justify-between p-5 bg-gradient-to-r ${section.gradient} text-white hover:opacity-90 transition-opacity`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-6 h-6" />
                                <span className="font-bold text-lg">{section.title}</span>
                            </div>
                            <ChevronRightIcon className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        </button>
                        
                        {isExpanded && (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(section.data).map(([key, value]) => (
                                    <div key={key} className="relative border-r-4 border-gray-200 pr-2">
                                        {/* شريط ملون جانبي لتمييز البيانات */}
                                        <div className={`absolute -right-0 top-0 h-full w-1 bg-gradient-to-b ${section.gradient} rounded-full`}></div>
                                        <div className="pl-2">
                                            <p className="text-gray-500 text-sm mb-1">{key}</p>
                                            <DisplayValue value={value} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// =============== التصميم الرابع: الشريط الجانبي الحديث ===============
export const DesignFour = ({ employeeData, baseSalary }) => {
    const [activeSection, setActiveSection] = useState("overview");

    const quickInfo = [
        { icon: UserIcon, label: "الاسم", value: employeeData.personal["الاسم الكامل"] },
        { icon: BriefcaseIcon, label: "الوظيفة", value: employeeData.job["العنوان الوظيفي"] },
        { icon: IdentificationIcon, label: "الرقم الوظيفي", value: employeeData.job["الرقم الوظيفي"] },
        { icon: CurrencyDollarIcon, label: "الراتب الأساسي", value: formatCurrency(baseSalary) },
        { icon: PhoneIcon, label: "الهاتف", value: employeeData.personal["رقم الهاتف"] },
        { icon: EnvelopeIcon, label: "البريد الإلكتروني", value: employeeData.personal["البريد الإلكتروني"] }
    ];

    const sections = [
        { id: "overview", title: "نظرة عامة", icon: SparklesIcon },
        { id: "personal", title: "البيانات الشخصية", icon: UserIcon, data: employeeData.personal },
        { id: "education", title: "التعليم والشهادات", icon: AcademicCapIcon, data: employeeData.education },
        { id: "job", title: "بيانات الوظيفة", icon: BriefcaseIcon, data: employeeData.job },
        { id: "identity", title: "بيانات الهوية", icon: IdentificationIcon, data: employeeData.identity },
        { id: "address", title: "العنوان", icon: HomeIcon, data: employeeData.address }
    ];
    
    const findSectionData = (id) => sections.find(s => s.id === id);

    return (
        <div className="flex flex-col lg:flex-row gap-6 bg-gray-50 p-6 rounded-2xl min-h-[600px]">
            {/* الشريط الجانبي */}
            <div className="lg:w-72 w-full bg-white rounded-xl shadow-lg p-4 flex-shrink-0">
                <div className="mb-6 text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-gray-100">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <UserCircleIcon className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{employeeData.personal["الاسم الكامل"]}</h3>
                    <p className="text-sm text-gray-600">{employeeData.job["العنوان الوظيفي"]}</p>
                </div>

                <nav className="space-y-2">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right ${
                                    activeSection === section.id
                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium flex-1">{section.title}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* المحتوى الرئيسي */}
            <div className="flex-1 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                {activeSection === "overview" ? (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
                            <SparklesIcon className="w-7 h-7 text-yellow-500" />
                            نظرة عامة
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {quickInfo.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-100">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">{item.label}</p>
                                            <p className="font-semibold text-gray-900">{item.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    (() => {
                        const currentSection = findSectionData(activeSection);
                        if (!currentSection || !currentSection.data) return <p>لا توجد بيانات لهذا القسم.</p>;
                        
                        return (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
                                    {React.createElement(currentSection.icon, { className: "w-7 h-7 text-blue-600" })}
                                    {currentSection.title}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(currentSection.data).map(([key, value]) => (
                                        <div key={key} className="border-r-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg shadow-sm">
                                            <p className="text-sm text-gray-600 mb-1">{key}</p>
                                            <DisplayValue value={value} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
};


// =============== التصميم الخامس: القائمة المبسطة (جديد) ===============
export const DesignFive = ({ employeeData, baseSalary }) => {
    const sections = [
        { id: "personal", title: "البيانات الشخصية", icon: UserIcon, data: employeeData.personal, color: "text-blue-600", bg: "bg-blue-50" },
        { id: "education", title: "التعليم والشهادات", icon: AcademicCapIcon, data: employeeData.education, color: "text-purple-600", bg: "bg-purple-50" },
        { id: "job", title: "بيانات الوظيفة", icon: BriefcaseIcon, data: employeeData.job, color: "text-green-600", bg: "bg-green-50" },
        { id: "identity", title: "بيانات الهوية", icon: IdentificationIcon, data: employeeData.identity, color: "text-orange-600", bg: "bg-orange-50" },
        { id: "address", title: "العنوان", icon: HomeIcon, data: employeeData.address, color: "text-pink-600", bg: "bg-pink-50" }
    ];

    const [activeSectionId, setActiveSectionId] = useState("personal");
    const activeSection = sections.find(s => s.id === activeSectionId);
    const IconActive = activeSection ? activeSection.icon : UserIcon;

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 p-1">
            {/* الهيدر */}
            <div className="bg-gray-800 text-white p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold">{employeeData.personal["الاسم الكامل"]}</h1>
                    <p className="text-gray-400 mt-1">{employeeData.job["العنوان الوظيفي"]}</p>
                </div>
                <div className="text-right bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-300">الراتب الأساسي</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(baseSalary)}</p>
                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row">
                {/* القائمة الجانبية (التنقل) */}
                <div className="lg:w-1/4 w-full bg-gray-50 p-4 space-y-2 border-r border-gray-200">
                    <h3 className='text-sm font-bold text-gray-700 uppercase mb-3'>الأقسام</h3>
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSectionId(section.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-right ${
                                    section.id === activeSectionId
                                        ? `${section.bg} ${section.color} font-bold shadow-inner border-r-4 border-current`
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{section.title}</span>
                            </button>
                        );
                    })}
                </div>

                {/* المحتوى */}
                <div className="lg:w-3/4 w-full p-6">
                    {activeSection ? (
                        <>
                            <h2 className={`text-xl font-bold mb-4 flex items-center gap-3 ${activeSection.color}`}>
                                <IconActive className="w-6 h-6" />
                                {activeSection.title}
                            </h2>
                            <div className="space-y-3">
                                {Object.entries(activeSection.data).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <p className="text-gray-600">{key}</p>
                                        <DisplayValue value={value} />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-center py-10 text-gray-500">يرجى اختيار قسم لعرض التفاصيل.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// مكون رئيسي لاختيار التصميم
export default function EmployeeDataSections({ employeeData, baseSalary, designNumber = 1 }) {
    const designs = {
        1: DesignOne,
        2: DesignTwo,
        3: DesignThree,
        4: DesignFour,
        5: DesignFive // إضافة التصميم الخامس
    };

    const SelectedDesign = designs[designNumber] || DesignOne;

    return <SelectedDesign employeeData={employeeData} baseSalary={baseSalary} />;
}