import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { studentApi } from "../../api/student";
import { allergenApi } from "../../api/allergen";
import toast from "react-hot-toast";
import {
  User,
  Wallet,
  AlertTriangle,
  Heart,
  Save,
  X,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [profileData, setProfileData] = useState({
    allergies: user?.allergies || "",
    preferences: user?.preferences || "",
  });
  const [allergens, setAllergens] = useState([]);
  const [selectedAllergenIds, setSelectedAllergenIds] = useState([]);
  const [personalInfoData, setPersonalInfoData] = useState({
    full_name: user?.full_name || "",
    parallel: user?.parallel || "",
  });
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [topupRequests, setTopupRequests] = useState([]);

  useEffect(() => {
    fetchAllergens();
    fetchTopupRequests();
    // Initialize selected allergens from user data
    if (user?.allergens_rel && user.allergens_rel.length > 0) {
      setSelectedAllergenIds(user.allergens_rel.map((a) => a.id));
    }
  }, [user]);

  const fetchAllergens = async () => {
    try {
      const data = await allergenApi.getAllergens();
      setAllergens(data);
    } catch (error) {
      console.error("Error fetching allergens:", error);
    }
  };

  const fetchTopupRequests = async () => {
    try {
      const data = await studentApi.getMyTopupRequests();
      setTopupRequests(data);
    } catch (error) {
      console.error("Error fetching topup requests:", error);
    }
  };

  const toggleAllergen = (allergenId) => {
    setSelectedAllergenIds((prev) =>
      prev.includes(allergenId)
        ? prev.filter((id) => id !== allergenId)
        : [...prev, allergenId],
    );
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Введите корректную сумму");
      return;
    }

    setLoading(true);
    try {
      await studentApi.addBalance(amount);
      toast.success(
        "Заявка на пополнение баланса создана и ожидает подтверждения администратора",
      );
      await refreshUser();
      setTopUpAmount("");
      fetchTopupRequests();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const updateData = {
        ...profileData,
        allergen_ids:
          selectedAllergenIds.length > 0 ? selectedAllergenIds : null,
      };
      await studentApi.updateProfile(updateData);
      toast.success("Профиль обновлен");
      await refreshUser();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfoUpdate = async () => {
    setLoading(true);
    try {
      await studentApi.updatePersonalInfo(personalInfoData);
      toast.success("Личная информация обновлена");
      await refreshUser();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      toast.error("Новые пароли не совпадают");
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error("Новый пароль должен содержать не менее 8 символов");
      return;
    }

    setLoading(true);
    try {
      await studentApi.updatePassword(passwordData);
      toast.success("Пароль успешно обновлен");
      // Reset password fields
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 200, 500, 1000];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Профиль</h1>
        <p className="text-base-content/60">
          Управление аккаунтом и настройками
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-lifted gap-2">
        <button
          className={`tab ${activeTab === "profile" ? "tab-active" : ""} bg-base-100 rounded-3xl`}
          onClick={() => setActiveTab("profile")}
        >
          Профиль
        </button>
        <button
          className={`tab ${activeTab === "personal" ? "tab-active" : ""} bg-base-100 rounded-3xl`}
          onClick={() => setActiveTab("personal")}
        >
          Личная информация
        </button>
        <button
          className={`tab ${activeTab === "password" ? "tab-active" : ""} bg-base-100 rounded-3xl`}
          onClick={() => setActiveTab("password")}
        >
          Безопасность
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Personal Info Tab */}
        {activeTab === "personal" && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">
                <User className="h-5 w-5" />
                Личная информация
              </h2>
              <div className="space-y-4 mt-4">
                <div className="form-control flex flex-col">
                  <label className="label">
                    <span className="label-text">ФИО</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={personalInfoData.full_name}
                    onChange={(e) =>
                      setPersonalInfoData({
                        ...personalInfoData,
                        full_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-control flex flex-col">
                  <label className="label">
                    <span className="label-text">Параллель</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={personalInfoData.parallel}
                    onChange={(e) =>
                      setPersonalInfoData({
                        ...personalInfoData,
                        parallel: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    className={`btn btn-primary ${loading ? "loading" : ""}`}
                    onClick={handlePersonalInfoUpdate}
                    disabled={loading}
                  >
                    <Save className="h-5 w-5" />
                    Сохранить изменения
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">
                <User className="h-5 w-5" />
                Изменение пароля
              </h2>
              <div className="space-y-4 mt-4">
                <div className="form-control flex flex-col">
                  <label className="label">
                    <span className="label-text">Старый пароль</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered"
                    value={passwordData.old_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        old_password: e.target.value,
                      })
                    }
                    placeholder="Введите текущий пароль"
                  />
                </div>

                <div className="form-control flex flex-col">
                  <label className="label">
                    <span className="label-text">Новый пароль</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                    placeholder="Введите новый пароль (не менее 8 символов)"
                  />
                </div>

                <div className="form-control flex flex-col">
                  <label className="label">
                    <span className="label-text">Подтвердите новый пароль</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered"
                    value={passwordData.confirm_new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_new_password: e.target.value,
                      })
                    }
                    placeholder="Подтвердите новый пароль"
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    className={`btn btn-primary ${loading ? "loading" : ""}`}
                    onClick={handlePasswordUpdate}
                    disabled={loading}
                  >
                    <Save className="h-5 w-5" />
                    Изменить пароль
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <>
            {/* User Info */}
            <div className="card md:w-3/5 bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">
                  <User className="h-5 w-5" />
                  Информация об аккаунте
                </h2>
                <div className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center p-3 bg-base-200 rounded-lg gap-2">
                    <span className="text-accent font-bold">ФИО</span>
                    <span className="font-semibold text-right">
                      {user?.full_name}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center p-3 bg-base-200 rounded-lg gap-2">
                    <span className="text-accent font-bold">Email</span>
                    <span className="font-semibold text-right">
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center p-3 bg-base-200 rounded-lg gap-2">
                    <span className="text-accent font-bold">Параллель</span>
                    <span className="font-semibold text-right">
                      {user?.parallel}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center p-3 bg-base-200 rounded-lg gap-2">
                    <span className="text-accent font-bold">Роль</span>
                    <span className="badge badge-primary">Ученик</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center p-3 bg-base-200 rounded-lg gap-2">
                    <span className="text-accent font-bold">
                      Дата регистрации
                    </span>
                    <span className="font-semibold text-right">
                      {user?.created_at &&
                        new Date(user.created_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Top-up */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">
                  <Wallet className="h-5 w-5" />
                  Пополнение баланса
                </h2>
                <div className="stat bg-base-300 rounded-box mt-4">
                  <div className="stat-title">Текущий баланс</div>
                  <div className="stat-value text-sm sm:text-base">
                    {user?.balance?.toFixed(2)} ₽
                  </div>
                </div>

                <div className="form-control mt-4 flex flex-col">
                  <label className="label">
                    <span className="label-text">Сумма пополнения</span>
                  </label>
                  <div className="join w-full sm:w-auto">
                    <input
                      type="number"
                      className="input input-bordered join-item flex-1 w-full"
                      placeholder="Введите сумму"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      min="1"
                    />
                    <button
                      className={`btn btn-primary join-item ${loading ? "loading" : ""}`}
                      onClick={handleTopUp}
                      disabled={loading}
                    >
                      Пополнить
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      className="btn btn-outline btn-sm"
                      onClick={() => setTopUpAmount(amount.toString())}
                    >
                      +{amount} ₽
                    </button>
                  ))}
                </div>

                {/* Top-up Requests History */}
                {topupRequests.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-3">
                      История заявок на пополнение
                    </h3>
                    <div className="space-y-2">
                      {topupRequests.map((request) => (
                        <div
                          key={request.id}
                          className={`p-4 rounded-lg border-2 ${
                            request.status === "approved"
                              ? "border-success bg-success/10"
                              : request.status === "rejected"
                                ? "border-error bg-error/10"
                                : "border-warning bg-warning/10"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {request.status === "pending" && (
                                <Clock className="h-5 w-5 text-warning" />
                              )}
                              {request.status === "approved" && (
                                <CheckCircle className="h-5 w-5 text-success" />
                              )}
                              {request.status === "rejected" && (
                                <XCircle className="h-5 w-5 text-error" />
                              )}
                              <div>
                                <div className="font-semibold">
                                  {request.amount.toFixed(2)} ₽
                                </div>
                                <div className="text-xs text-base-content/60">
                                  {new Date(
                                    request.created_at,
                                  ).toLocaleDateString("ru-RU", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="badge gap-2">
                              {request.status === "pending" && (
                                <>
                                  <span className="loading loading-spinner loading-xs"></span>
                                  Ожидает подтверждения
                                </>
                              )}
                              {request.status === "approved" && (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  Подтверждено
                                </>
                              )}
                              {request.status === "rejected" && (
                                <>
                                  <XCircle className="h-4 w-4" />
                                  Отклонено
                                </>
                              )}
                            </div>
                          </div>
                          {request.admin_comment && (
                            <div className="mt-2 text-sm text-base-content/70">
                              <strong>Комментарий администратора:</strong>{" "}
                              {request.admin_comment}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  Пищевые аллергии
                </h2>
                <p className="text-sm text-base-content/60">
                  Выберите аллергены из списка
                </p>
                <div className="form-control mt-4">
                  <div className="flex flex-wrap gap-2">
                    {allergens.map((allergen) => (
                      <button
                        key={allergen.id}
                        type="button"
                        className={`badge badge-lg cursor-pointer ${
                          selectedAllergenIds.includes(allergen.id)
                            ? "badge-error"
                            : "badge-outline"
                        }`}
                        onClick={() => toggleAllergen(allergen.id)}
                      >
                        {allergen.name}
                        {selectedAllergenIds.includes(allergen.id) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedAllergenIds.length > 0 && (
                    <div className="alert alert-warning mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">
                        Выбрано аллергенов: {selectedAllergenIds.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-success">
                  <Heart className="h-5 w-5" />
                  Предпочтения в еде
                </h2>
                <p className="text-sm text-base-content/60">
                  Укажите ваши пищевые предпочтения
                </p>
                <div className="form-control mt-4">
                  <textarea
                    className="textarea textarea-bordered h-24"
                    placeholder="Например: вегетарианство, без свинины..."
                    value={profileData.preferences}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        preferences: e.target.value,
                      })
                    }
                  />
                </div>
                {user?.preferences && (
                  <div className="alert alert-success mt-2">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">
                      Текущие предпочтения: {user.preferences}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                className={`btn btn-primary ${loading ? "loading" : ""}`}
                onClick={handleProfileUpdate}
                disabled={loading}
              >
                <Save className="h-5 w-5" />
                Сохранить изменения
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
