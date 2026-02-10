import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { studentApi } from "../../api/student";
import toast from "react-hot-toast";
import { User, Wallet, AlertTriangle, Heart, Save } from "lucide-react";

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [profileData, setProfileData] = useState({
    allergies: user?.allergies || "",
    preferences: user?.preferences || "",
  });
  const [personalInfoData, setPersonalInfoData] = useState({
    full_name: user?.full_name || "",
    parallel: user?.parallel || "",
  });
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [activeTab, setActiveTab] = useState("profile"); // 'profile', 'personal', 'password'

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Введите корректную сумму");
      return;
    }

    setLoading(true);
    try {
      await studentApi.addBalance(amount);
      toast.success(`Баланс пополнен на ${amount} ₽`);
      await refreshUser();
      setTopUpAmount("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await studentApi.updateProfile(profileData);
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
      // Update the personal info form with the new values
      // setPersonalInfoData({
      //   full_name: user?.full_name || "",
      //   parallel: user?.parallel || "",
      // });
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
      <div className="tabs tabs-lifted">
        <button
          className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Профиль
        </button>
        <button
          className={`tab ${activeTab === "personal" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          Личная информация
        </button>
        <button
          className={`tab ${activeTab === "password" ? "tab-active" : ""}`}
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
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">
                  <User className="h-5 w-5" />
                  Информация об аккаунте
                </h2>
                <div className="space-y-4 mt-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-base-200 rounded-lg gap-2">
                    <span className="text-base-content/60">ФИО</span>
                    <span className="font-semibold text-right">
                      {user?.full_name}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-base-200 rounded-lg gap-2">
                    <span className="text-base-content/60">Email</span>
                    <span className="font-semibold text-right">
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-base-200 rounded-lg gap-2">
                    <span className="text-base-content/60">Параллель</span>
                    <span className="font-semibold text-right">
                      {user?.parallel}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-base-200 rounded-lg gap-2">
                    <span className="text-base-content/60">Роль</span>
                    <span className="badge badge-primary">Ученик</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-base-200 rounded-lg gap-2">
                    <span className="text-base-content/60">
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
                <div className="stat bg-[#6B46C1] text-primary-content rounded-box mt-4">
                  <div className="stat-title text-primary-content/70">
                    Текущий баланс
                  </div>
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
                  Укажите продукты, на которые у вас аллергия
                </p>
                <div className="form-control mt-4">
                  <textarea
                    className="textarea textarea-bordered h-24"
                    placeholder="Например: молоко, орехи, глютен..."
                    value={profileData.allergies}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        allergies: e.target.value,
                      })
                    }
                  />
                </div>
                {user?.allergies && (
                  <div className="alert alert-warning mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">
                      Текущие аллергии: {user.allergies}
                    </span>
                  </div>
                )}
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
