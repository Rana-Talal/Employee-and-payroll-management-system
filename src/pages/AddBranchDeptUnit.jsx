import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddBranchDeptUnit = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [departmentsForDisplay, setDepartmentsForDisplay] = useState([]);
  const [unitsForDisplay, setUnitsForDisplay] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

  const [newBranchName, setNewBranchName] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newUnitName, setNewUnitName] = useState("");

  // Edit states
  const [editMode, setEditMode] = useState({ type: null, id: null, name: "" });
  const [showEditModal, setShowEditModal] = useState(false);

  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const baseUrl = "http://192.168.11.230:1006/api";

  // Auto-hide messages
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // === Fetch branches ===
  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true);
      try {
        const res = await fetch(`${baseUrl}/Branch`);
        const data = await res.json();
        if (!Array.isArray(data.items)) throw new Error("Invalid branches format");
        setBranches(data.items);
      } catch (err) {
        setError("فشل تحميل الفروع: " + err.message);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  // === Fetch departments by branch ===
  useEffect(() => {
    if (!selectedBranchId) {
      setDepartmentsForDisplay([]);
      return;
    }
    const fetchDepartments = async () => {
      setLoadingDepts(true);
      try {
        const res = await fetch(`${baseUrl}/Departments/by-branch/${selectedBranchId}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid departments format");
        setDepartmentsForDisplay(data);
      } catch (err) {
        setError("فشل تحميل الأقسام: " + err.message);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepartments();
  }, [selectedBranchId]);

  // === Fetch units by department ===
  useEffect(() => {
    if (!selectedDepartmentId) {
      setUnitsForDisplay([]);
      return;
    }
    const fetchUnits = async () => {
      setLoadingUnits(true);
      try {
        const res = await fetch(`${baseUrl}/Unit/by-department/${selectedDepartmentId}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid units format");
        setUnitsForDisplay(data);
      } catch (err) {
        setError("فشل تحميل الشُعب: " + err.message);
      } finally {
        setLoadingUnits(false);
      }
    };
    fetchUnits();
  }, [selectedDepartmentId]);

  // === Add Handlers ===
  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return setError("اسم الفرع مطلوب");
    setLoadingAction(true);
    try {
      await fetch(`${baseUrl}/Branch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBranchName }),
      });
      const res = await fetch(`${baseUrl}/Branch`);
      const data = await res.json();
      setBranches(data.items);
      setNewBranchName("");
      setSuccessMessage("تم إضافة الفرع بنجاح!");
    } catch (err) {
      setError("فشل إضافة الفرع: " + err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!selectedBranchId) return setError("اختر فرعًا أولًا");
    if (!newDepartmentName.trim()) return setError("اسم القسم مطلوب");
    setLoadingAction(true);
    try {
      await fetch(`${baseUrl}/Departments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDepartmentName,
          branchID: selectedBranchId,
        }),
      });
      const res = await fetch(`${baseUrl}/Departments/by-branch/${selectedBranchId}`);
      const data = await res.json();
      setDepartmentsForDisplay(data);
      setNewDepartmentName("");
      setSuccessMessage("تم إضافة القسم بنجاح!");
    } catch (err) {
      setError("فشل إضافة القسم: " + err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!selectedDepartmentId) return setError("اختر قسمًا أولًا");
    if (!newUnitName.trim()) return setError("اسم الشعبة مطلوب");
    setLoadingAction(true);
    try {
      await fetch(`${baseUrl}/Unit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUnitName,
          departmentID: selectedDepartmentId,
        }),
      });
      const res = await fetch(`${baseUrl}/Unit/by-department/${selectedDepartmentId}`);
      const data = await res.json();
      setUnitsForDisplay(data);
      setNewUnitName("");
      setSuccessMessage("تم إضافة الشعبة بنجاح!");
    } catch (err) {
      setError("فشل إضافة الشعبة: " + err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  // === Edit Handlers ===
  const openEditModal = (type, id, currentName) => {
    setEditMode({ type, id, name: currentName });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditMode({ type: null, id: null, name: "" });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editMode.name.trim()) return setError("الاسم مطلوب");
    setLoadingAction(true);

    try {
      let endpoint = "";
      let body = {};

      if (editMode.type === "branch") {
        endpoint = `${baseUrl}/Branch/${editMode.id}`;
        body = { name: editMode.name };
      } else if (editMode.type === "department") {
        endpoint = `${baseUrl}/Departments/${editMode.id}`;
        body = { name: editMode.name, branchID: selectedBranchId };
      } else if (editMode.type === "unit") {
        endpoint = `${baseUrl}/Unit/${editMode.id}`;
        body = { name: editMode.name, departmentID: selectedDepartmentId };
      }

      await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Refresh data
      if (editMode.type === "branch") {
        const res = await fetch(`${baseUrl}/Branch`);
        const data = await res.json();
        setBranches(data.items);
        setSuccessMessage("تم تعديل الفرع بنجاح!");
      } else if (editMode.type === "department") {
        const res = await fetch(`${baseUrl}/Departments/by-branch/${selectedBranchId}`);
        const data = await res.json();
        setDepartmentsForDisplay(data);
        setSuccessMessage("تم تعديل القسم بنجاح!");
      } else if (editMode.type === "unit") {
        const res = await fetch(`${baseUrl}/Unit/by-department/${selectedDepartmentId}`);
        const data = await res.json();
        setUnitsForDisplay(data);
        setSuccessMessage("تم تعديل الشعبة بنجاح!");
      }

      closeEditModal();
    } catch (err) {
      setError("فشل التعديل: " + err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  // === Delete Handlers ===
  const handleDeleteBranch = async (branchId, branchName) => {
    if (!window.confirm(`هل أنت متأكد من حذف الفرع "${branchName}"؟`)) return;
    try {
      await fetch(`${baseUrl}/Branch/${branchId}`, { method: "DELETE" });
      const res = await fetch(`${baseUrl}/Branch`);
      const data = await res.json();
      setBranches(data.items);
      setSuccessMessage("تم حذف الفرع بنجاح!");
      if (selectedBranchId === branchId) {
        setSelectedBranchId(null);
      }
    } catch (err) {
      setError("فشل حذف الفرع: " + err.message);
    }
  };

  const handleDeleteDepartment = async (deptId, deptName) => {
    if (!window.confirm(`هل أنت متأكد من حذف القسم "${deptName}"؟`)) return;
    try {
      await fetch(`${baseUrl}/Departments/${deptId}`, { method: "DELETE" });
      const res = await fetch(`${baseUrl}/Departments/by-branch/${selectedBranchId}`);
      const data = await res.json();
      setDepartmentsForDisplay(data);
      setSuccessMessage("تم حذف القسم بنجاح!");
      if (selectedDepartmentId === deptId) {
        setSelectedDepartmentId(null);
      }
    } catch (err) {
      setError("فشل حذف القسم: " + err.message);
    }
  };

  const handleDeleteUnit = async (unitId, unitName) => {
    if (!window.confirm(`هل أنت متأكد من حذف الشعبة "${unitName}"؟`)) return;
    try {
      await fetch(`${baseUrl}/Unit/${unitId}`, { method: "DELETE" });
      const res = await fetch(`${baseUrl}/Unit/by-department/${selectedDepartmentId}`);
      const data = await res.json();
      setUnitsForDisplay(data);
      setSuccessMessage("تم حذف الشعبة بنجاح!");
    } catch (err) {
      setError("فشل حذف الشعبة: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            إدارة الفروع والأقسام والشُعب
          </h1>
          {/* <p className="text-center text-gray-600">
            إضافة وتعديل وحذف الهيكل التنظيمي للنظام
          </p> */}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border-r-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 shadow animate-pulse">
            <div className="flex items-center">
              <span className="text-xl ml-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border-r-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-4 shadow animate-pulse">
            <div className="flex items-center">
              <span className="text-xl ml-2">✅</span>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الفروع */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <span className="text-3xl ml-2">🏢</span>
              <h2 className="text-xl font-bold text-gray-800">الفروع</h2>
            </div>

            {/* Add Branch Form */}
            <form onSubmit={handleAddBranch} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="اسم فرع جديد"
                  className="flex-grow px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                >
                  {loadingAction ? "⏳" : "➕"}
                </button>
              </div>
            </form>

            {/* Branches List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loadingBranches ? (
                <p className="text-center text-gray-500">يتم التحميل...</p>
              ) : branches.length > 0 ? (
                branches.map((branch) => (
                  <div
                    key={branch.branchID}
                    className={`p-3 rounded-lg border-2 transition cursor-pointer ${
                      selectedBranchId === branch.branchID
                        ? "bg-blue-50 border-blue-500"
                        : "bg-gray-50 border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setSelectedBranchId(branch.branchID)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {branch.name}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal("branch", branch.branchID, branch.name);
                          }}
                          className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 transition"
                          title="تعديل"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBranch(branch.branchID, branch.name);
                          }}
                          className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition"
                          title="حذف"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">لا توجد فروع</p>
              )}
            </div>
          </div>

          {/* الأقسام */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <span className="text-3xl ml-2">📂</span>
              <h2 className="text-xl font-bold text-gray-800">الأقسام</h2>
            </div>

            {!selectedBranchId ? (
              <div className="text-center py-8">
                <span className="text-5xl">👈</span>
                <p className="text-gray-500 mt-2">اختر فرعًا أولاً</p>
              </div>
            ) : (
              <>
                {/* Add Department Form */}
                <form onSubmit={handleAddDepartment} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      placeholder="اسم قسم جديد"
                      className="flex-grow px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={loadingAction}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                    >
                      {loadingAction ? "⏳" : "➕"}
                    </button>
                  </div>
                </form>

                {/* Departments List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {loadingDepts ? (
                    <p className="text-center text-gray-500">يتم التحميل...</p>
                  ) : departmentsForDisplay.length > 0 ? (
                    departmentsForDisplay.map((dept) => (
                      <div
                        key={dept.departmentID}
                        className={`p-3 rounded-lg border-2 transition cursor-pointer ${
                          selectedDepartmentId === dept.departmentID
                            ? "bg-purple-50 border-purple-500"
                            : "bg-gray-50 border-gray-200 hover:border-purple-300"
                        }`}
                        onClick={() => setSelectedDepartmentId(dept.departmentID)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">
                            {dept.name}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal("department", dept.departmentID, dept.name);
                              }}
                              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 transition"
                              title="تعديل"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDepartment(dept.departmentID, dept.name);
                              }}
                              className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition"
                              title="حذف"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">لا توجد أقسام</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* الشُعب */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <span className="text-3xl ml-2">📑</span>
              <h2 className="text-xl font-bold text-gray-800">الشُعب</h2>
            </div>

            {!selectedDepartmentId ? (
              <div className="text-center py-8">
                <span className="text-5xl">👈</span>
                <p className="text-gray-500 mt-2">اختر قسمًا أولاً</p>
              </div>
            ) : (
              <>
                {/* Add Unit Form */}
                <form onSubmit={handleAddUnit} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      placeholder="اسم شعبة جديدة"
                      className="flex-grow px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={loadingAction}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
                    >
                      {loadingAction ? "⏳" : "➕"}
                    </button>
                  </div>
                </form>

                {/* Units List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {loadingUnits ? (
                    <p className="text-center text-gray-500">يتم التحميل...</p>
                  ) : unitsForDisplay.length > 0 ? (
                    unitsForDisplay.map((unit) => (
                      <div
                        key={unit.unitID}
                        className="p-3 rounded-lg border-2 bg-gray-50 border-gray-200 hover:border-purple-300 transition"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">
                            {unit.name}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                openEditModal("unit", unit.unitID, unit.name)
                              }
                              className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 transition"
                              title="تعديل"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteUnit(unit.unitID, unit.name)}
                              className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition"
                              title="حذف"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">لا توجد شُعب</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/main")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium shadow-lg"
          >
            ← العودة للصفحة الرئيسية
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                ✏️ تعديل{" "}
                {editMode.type === "branch"
                  ? "الفرع"
                  : editMode.type === "department"
                  ? "القسم"
                  : "الشعبة"}
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✖️
              </button>
            </div>

            <form onSubmit={handleEdit}>
              <input
                type="text"
                value={editMode.name}
                onChange={(e) =>
                  setEditMode({ ...editMode, name: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                placeholder="الاسم الجديد"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {loadingAction ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBranchDeptUnit;
