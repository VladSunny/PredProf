import React, { useState, useMemo } from "react";
import { X, Plus, Calendar, ShoppingCart, Repeat, Croissant, Utensils } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "./Modal";

const WeeklyPlanner = ({ dishes, balance, onBulkOrder, user }) => {
  const [weekStart, setWeekStart] = useState(() => {
    // Start from Monday of current week
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [plannedMeals, setPlannedMeals] = useState({});
  const [isOrdering, setIsOrdering] = useState(false);
  const [subscriptionModal, setSubscriptionModal] = useState(false);
  const [subscriptionWeeks, setSubscriptionWeeks] = useState(1);
  const [editMode, setEditMode] = useState(null); // { dateString, mealType }
  const [dishQuantities, setDishQuantities] = useState({}); // { [key]: quantity }

  const isBreakfast = (dish) =>
    dish.meal_types?.some((mt) => mt.name === "breakfast");
  const isLunch = (dish) => dish.meal_types?.some((mt) => mt.name === "lunch");
  const isBoth = (dish) => isBreakfast(dish) && isLunch(dish);

  // Generate week days (Monday to Saturday)
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push({
        date: new Date(date),
        dayName: date.toLocaleDateString("ru-RU", { weekday: "short" }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString("ru-RU", { month: "short" }),
        // Use locale string to avoid timezone issues (toISOString converts to UTC)
        dateString: date.toLocaleDateString("en-CA"), // YYYY-MM-DD format
      });
    }
    return days;
  }, [weekStart]);

  const getMealKey = (dateString, mealType) => `${dateString}-${mealType}`;
  const getDishKey = (dateString, mealType, dishId) =>
    `${dateString}-${mealType}-${dishId}`;

  const addMealToPlan = (dish, dateString, mealType, quantity = 1) => {
    // Check if dish matches meal type
    const dishIsBreakfast = isBreakfast(dish);
    const dishIsLunch = isLunch(dish);

    if (dishIsBreakfast && !dishIsLunch && mealType !== "breakfast") {
      toast.error("Это блюдо для завтрака");
      return;
    }
    if (dishIsLunch && !dishIsBreakfast && mealType !== "lunch") {
      toast.error("Это блюдо для обеда");
      return;
    }

    const key = getMealKey(dateString, mealType);
    const dishKey = getDishKey(dateString, mealType, dish.id);

    setPlannedMeals((prev) => {
      const currentMeals = prev[key] || [];
      // Check if dish is already added
      if (currentMeals.some((d) => d.id === dish.id)) {
        toast.error(`${dish.name} уже добавлено`);
        return prev;
      }
      return {
        ...prev,
        [key]: [...currentMeals, { ...dish, quantity }],
      };
    });

    setDishQuantities((prev) => ({
      ...prev,
      [dishKey]: quantity,
    }));

    toast.success(`${dish.name} x${quantity} добавлено в план`);
    // Keep modal open so user can add more dishes
  };

  const removeMealFromPlan = (dateString, mealType, dishId) => {
    const key = getMealKey(dateString, mealType);
    const dishKey = getDishKey(dateString, mealType, dishId);

    setPlannedMeals((prev) => {
      const currentMeals = prev[key] || [];
      const updatedMeals = currentMeals.filter((d) => d.id !== dishId);
      if (updatedMeals.length === 0) {
        const newPlanned = { ...prev };
        delete newPlanned[key];
        return newPlanned;
      }
      return {
        ...prev,
        [key]: updatedMeals,
      };
    });

    setDishQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[dishKey];
      return newQuantities;
    });
  };

  const updateDishQuantity = (dateString, mealType, dishId, quantity) => {
    const dishKey = getDishKey(dateString, mealType, dishId);

    if (quantity <= 0) {
      removeMealFromPlan(dateString, mealType, dishId);
      return;
    }

    setDishQuantities((prev) => ({
      ...prev,
      [dishKey]: quantity,
    }));

    setPlannedMeals((prev) => {
      const key = getMealKey(dateString, mealType);
      const currentMeals = prev[key] || [];
      const updatedMeals = currentMeals.map((d) =>
        d.id === dishId ? { ...d, quantity } : d,
      );
      return {
        ...prev,
        [key]: updatedMeals,
      };
    });
  };

  const getPlannedMeals = (dateString, mealType) => {
    const key = getMealKey(dateString, mealType);
    return plannedMeals[key] || [];
  };

  const getAvailableDishes = (mealType) => {
    return dishes.filter((dish) => {
      if (mealType === "breakfast") {
        return isBreakfast(dish) && dish.stock_quantity > 0;
      } else {
        return isLunch(dish) && dish.stock_quantity > 0;
      }
    });
  };

  const calculateTotalCost = (weeks = 1) => {
    const baseCost = Object.values(plannedMeals).reduce((total, mealsArray) => {
      const mealsCost = Array.isArray(mealsArray)
        ? mealsArray.reduce(
            (sum, dish) => sum + (dish.price || 0) * (dish.quantity || 1),
            0,
          )
        : (mealsArray.price || 0) * (mealsArray.quantity || 1);
      return total + mealsCost;
    }, 0);
    return baseCost * weeks;
  };

  const handleBulkOrder = async (paymentType = "one-time", weeks = 1) => {
    // Flatten all meals into individual orders
    const allMeals = [];
    Object.entries(plannedMeals).forEach(([key, mealsArray]) => {
      const lastDashIndex = key.lastIndexOf("-");
      const dateString = key.substring(0, lastDashIndex);
      const mealType = key.substring(lastDashIndex + 1);
      const dishes = Array.isArray(mealsArray) ? mealsArray : [mealsArray];
      dishes.forEach((dish) => {
        allMeals.push({ dateString, mealType, dish });
      });
    });

    if (allMeals.length === 0) {
      toast.error("Выберите хотя бы одно блюдо");
      return;
    }

    const totalCost = calculateTotalCost(weeks);
    if (balance < totalCost) {
      toast.error(`Недостаточно средств. Нужно: ${totalCost.toFixed(2)} ₽`);
      return;
    }

    setIsOrdering(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const { dateString, dish } of allMeals) {
        try {
          const orderData = {
            dishId: dish.id,
            paymentType: paymentType,
            orderDate: dateString,
          };

          if (paymentType === "subscription") {
            orderData.subscriptionWeeks = weeks;
          }

          await onBulkOrder(orderData);
          successCount++;
        } catch (error) {
          console.error(`Error ordering ${dish.name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        const totalOrders =
          paymentType === "subscription" ? successCount * weeks : successCount;
        const message =
          paymentType === "subscription"
            ? `Успешно оформлен абонемент: ${successCount} блюд на ${weeks} недел${weeks > 1 ? "и" : "ю"} (${totalOrders} заказов)`
            : `Успешно заказано: ${successCount} блюд`;
        toast.success(message);
        setPlannedMeals({});
        setSubscriptionModal(false);
      }
      if (errorCount > 0) {
        toast.error(`Ошибка при заказе: ${errorCount} блюд`);
      }
    } catch (error) {
      toast.error("Ошибка при оформлении заказов");
    } finally {
      setIsOrdering(false);
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() + direction * 7);
    setWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    setWeekStart(monday);
  };

  const totalCost = calculateTotalCost();
  const plannedCount = Object.values(plannedMeals).reduce(
    (total, mealsArray) => {
      return total + (Array.isArray(mealsArray) ? mealsArray.length : 1);
    },
    0,
  );

  // Get selected day info for modal title
  const getSelectedDayInfo = () => {
    if (!editMode) return null;
    const day = weekDays.find((d) => d.dateString === editMode.dateString);
    if (!day) return null;
    const mealTypeLabel =
      editMode.mealType === "breakfast" ? "Завтрак" : "Обед";
    return {
      date: day.date.toLocaleDateString("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      mealType: mealTypeLabel,
    };
  };

  const selectedDayInfo = getSelectedDayInfo();
  const availableDishesForModal = editMode
    ? getAvailableDishes(editMode.mealType)
    : [];

  return (
    <div className="space-y-4 page-transition">
      {/* Week Navigation - Mobile Responsive */}
      <div className="bg-base-100 p-3 sm:p-4 rounded-box shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            className="btn btn-sm btn-ghost order-2 sm:order-1 transition-all duration-200 hover:scale-105"
            onClick={() => navigateWeek(-1)}
          >
            <span className="hidden sm:inline">← Предыдущая неделя</span>
            <span className="sm:hidden">← Назад</span>
          </button>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 order-1 sm:order-2 flex-1">
            <button
              className="btn btn-sm btn-ghost transition-all duration-200 hover:scale-105"
              onClick={goToCurrentWeek}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Текущая неделя</span>
              <span className="sm:hidden">Сегодня</span>
            </button>
            <div className="text-center">
              <div className="font-semibold text-sm sm:text-base">
                {weekDays[0].date.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                })}{" "}
                -{" "}
                {weekDays[5].date.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-ghost order-3 transition-all duration-200 hover:scale-105"
            onClick={() => navigateWeek(1)}
          >
            <span className="hidden sm:inline">Следующая неделя →</span>
            <span className="sm:hidden">Вперёд →</span>
          </button>
        </div>
      </div>

      {/* Weekly Grid - Mobile Scrollable */}
      <div className="bg-base-100 rounded-box shadow-lg hover:shadow-xl transition-all duration-300 overflow-x-auto -mx-2 sm:mx-0 pb-2 sm:pb-0">
        <div className="min-w-[700px] sm:min-w-full">
          {/* Header - Sticky on mobile */}
          <div className="grid grid-cols-6 border-b border-base-300 sticky top-0 bg-base-100 z-10">
            {weekDays.map((day) => (
              <div
                key={day.dateString}
                className={`p-2 sm:p-3 text-center border-r border-base-300 last:border-r-0 ${
                  day.date.toDateString() === new Date().toDateString()
                    ? "bg-primary/10"
                    : ""
                }`}
              >
                <div className="font-semibold text-xs sm:text-sm uppercase">
                  {day.dayName}
                </div>
                <div className="text-base sm:text-lg font-bold">
                  {day.dayNumber}
                </div>
                <div className="text-xs text-base-content/60 hidden sm:block">
                  {day.month}
                </div>
              </div>
            ))}
          </div>

          {/* Breakfast Row */}
          <div className="grid grid-cols-6 border-b border-base-300">
            {weekDays.map((day) => {
              const plannedMealsList = getPlannedMeals(
                day.dateString,
                "breakfast",
              );
              const isToday =
                day.date.toDateString() === new Date().toDateString();
              const isPast = day.date < new Date() && !isToday;

              return (
                <div
                  key={`breakfast-${day.dateString}`}
                  className="p-2 sm:p-3 border-r border-base-300 last:border-r-0 bg-warning/5"
                >
                  <div className="text-xs font-semibold mb-1 sm:mb-2 text-warning flex items-center gap-1">
                    <span className="hidden sm:inline">Завтрак</span>
                  </div>
                  {plannedMealsList.length > 0 ? (
                    <div className="space-y-1 sm:space-y-2">
                      <div className="space-y-1">
                        {plannedMealsList.map((dish) => {
                          const dishKey = getDishKey(
                            day.dateString,
                            "breakfast",
                            dish.id,
                          );
                          const quantity =
                            dishQuantities[dishKey] || dish.quantity || 1;

                          return (
                            <div
                              key={dish.id}
                              className="bg-base-200 p-1.5 sm:p-2 rounded text-xs transition-all duration-200"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-semibold truncate text-xs flex-1">
                                  {dish.name}
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    className="btn btn-xs btn-square btn-ghost h-6 w-6"
                                    onClick={() =>
                                      updateDishQuantity(
                                        day.dateString,
                                        "breakfast",
                                        dish.id,
                                        quantity - 1,
                                      )
                                    }
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-bold w-4 text-center">
                                    {quantity}
                                  </span>
                                  <button
                                    className="btn btn-xs btn-square btn-ghost h-6 w-6"
                                    onClick={() =>
                                      updateDishQuantity(
                                        day.dateString,
                                        "breakfast",
                                        dish.id,
                                        quantity + 1,
                                      )
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <div className="text-primary font-bold text-xs sm:text-sm">
                                {(dish.price * quantity).toFixed(2)} ₽
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        className={`btn btn-xs btn-outline btn-warning w-full transition-all duration-200 hover:scale-105 ${
                          isPast ? "btn-disabled" : ""
                        }`}
                        onClick={() => {
                          if (!isPast) {
                            setEditMode({
                              dateString: day.dateString,
                              mealType: "breakfast",
                            });
                          }
                        }}
                        disabled={isPast}
                      >
                        <span className="hidden sm:inline">Изменить</span>
                        <span className="sm:hidden">Изм.</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`btn btn-xs btn-outline btn-warning w-full transition-all duration-200 hover:scale-105 ${
                        isPast ? "btn-disabled" : ""
                      }`}
                      onClick={() => {
                        if (!isPast) {
                          setEditMode({
                            dateString: day.dateString,
                            mealType: "breakfast",
                          });
                        }
                      }}
                      disabled={isPast}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="hidden sm:inline">Добавить</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lunch Row */}
          <div className="grid grid-cols-6">
            {weekDays.map((day) => {
              const plannedMealsList = getPlannedMeals(day.dateString, "lunch");
              const isToday =
                day.date.toDateString() === new Date().toDateString();
              const isPast = day.date < new Date() && !isToday;

              return (
                <div
                  key={`lunch-${day.dateString}`}
                  className="p-2 sm:p-3 border-r border-base-300 last:border-r-0 bg-info/5"
                >
                  <div className="text-xs font-semibold mb-1 sm:mb-2 text-info flex items-center gap-1">
                    <span className="hidden sm:inline">Обед</span>
                  </div>
                  {plannedMealsList.length > 0 ? (
                    <div className="space-y-1 sm:space-y-2">
                      <div className="space-y-1">
                        {plannedMealsList.map((dish) => {
                          const dishKey = getDishKey(
                            day.dateString,
                            "lunch",
                            dish.id,
                          );
                          const quantity =
                            dishQuantities[dishKey] || dish.quantity || 1;

                          return (
                            <div
                              key={dish.id}
                              className="bg-base-200 p-1.5 sm:p-2 rounded text-xs transition-all duration-200"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-semibold truncate text-xs flex-1">
                                  {dish.name}
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    className="btn btn-xs btn-square btn-ghost h-6 w-6"
                                    onClick={() =>
                                      updateDishQuantity(
                                        day.dateString,
                                        "lunch",
                                        dish.id,
                                        quantity - 1,
                                      )
                                    }
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-bold w-4 text-center">
                                    {quantity}
                                  </span>
                                  <button
                                    className="btn btn-xs btn-square btn-ghost h-6 w-6"
                                    onClick={() =>
                                      updateDishQuantity(
                                        day.dateString,
                                        "lunch",
                                        dish.id,
                                        quantity + 1,
                                      )
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <div className="text-primary font-bold text-xs sm:text-sm">
                                {(dish.price * quantity).toFixed(2)} ₽
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        className={`btn btn-xs btn-outline btn-info w-full transition-all duration-200 hover:scale-105 ${
                          isPast ? "btn-disabled" : ""
                        }`}
                        onClick={() => {
                          if (!isPast) {
                            setEditMode({
                              dateString: day.dateString,
                              mealType: "lunch",
                            });
                          }
                        }}
                        disabled={isPast}
                      >
                        <span className="hidden sm:inline">Изменить</span>
                        <span className="sm:hidden">Изм.</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`btn btn-xs btn-outline btn-info w-full transition-all duration-200 hover:scale-105 ${
                        isPast ? "btn-disabled" : ""
                      }`}
                      onClick={() => {
                        if (!isPast) {
                          setEditMode({
                            dateString: day.dateString,
                            mealType: "lunch",
                          });
                        }
                      }}
                      disabled={isPast}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="hidden sm:inline">Добавить</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary and Order Buttons - Mobile Responsive */}
      {plannedCount > 0 && (
        <div className="bg-base-100 p-4 rounded-box shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1">
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm text-base-content/60">
                  Запланировано блюд
                </div>
                <div className="text-xl sm:text-2xl font-bold">
                  {plannedCount}
                </div>
              </div>
              <div className="divider divider-horizontal hidden sm:block"></div>
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm text-base-content/60">
                  Общая стоимость
                </div>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {totalCost.toFixed(2)} ₽
                </div>
              </div>
              <div className="divider divider-horizontal hidden sm:block"></div>
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm text-base-content/60">
                  Баланс после оплаты
                </div>
                <div
                  className={`text-xl sm:text-2xl font-bold ${
                    balance - totalCost >= 0 ? "text-success" : "text-error"
                  }`}
                >
                  {(balance - totalCost).toFixed(2)} ₽
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                className="btn btn-primary btn-sm sm:btn-lg flex-1 sm:flex-none transition-all duration-200 hover:scale-105"
                onClick={() => handleBulkOrder("one-time", 1)}
                disabled={isOrdering || balance < totalCost}
              >
                {isOrdering ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="hidden sm:inline">Оформление...</span>
                    <span className="sm:hidden">Оформление...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">
                      Заказать ({plannedCount})
                    </span>
                    <span className="sm:hidden">Заказать</span>
                  </>
                )}
              </button>
              <button
                className="btn btn-secondary btn-sm sm:btn-lg flex-1 sm:flex-none transition-all duration-200 hover:scale-105"
                onClick={() => setSubscriptionModal(true)}
                disabled={isOrdering}
              >
                <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Абонемент</span>
                <span className="sm:hidden">Абон.</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dish Selection Modal */}
      <Modal
        isOpen={!!editMode}
        onClose={() => setEditMode(null)}
        title={
          selectedDayInfo
            ? `${selectedDayInfo.mealType} - ${selectedDayInfo.date}`
            : "Выберите блюдо"
        }
        size="max-w-2xl"
      >
        <div className="space-y-4">
          {editMode &&
            getPlannedMeals(editMode.dateString, editMode.mealType).length >
              0 && (
              <div className="bg-info/10 p-3 rounded-lg">
                <p className="text-sm font-semibold mb-2">Добавлено:</p>
                <div className="flex flex-wrap gap-2">
                  {getPlannedMeals(editMode.dateString, editMode.mealType).map(
                    (dish) => (
                      <span
                        key={dish.id}
                        className="badge badge-info badge-sm gap-1 cursor-pointer hover:badge-error transition-colors"
                        onClick={() =>
                          removeMealFromPlan(
                            editMode.dateString,
                            editMode.mealType,
                            dish.id,
                          )
                        }
                        title="Нажмите, чтобы удалить"
                      >
                        {dish.name}
                        <X className="h-3 w-3" />
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
          {availableDishesForModal.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base-content/60">Нет доступных блюд</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {availableDishesForModal.map((dish) => {
                const isAlreadyAdded = editMode
                  ? getPlannedMeals(
                      editMode.dateString,
                      editMode.mealType,
                    ).some((d) => d.id === dish.id)
                  : false;

                return (
                  <button
                    key={dish.id}
                    onClick={() => {
                      if (isAlreadyAdded) {
                        removeMealFromPlan(
                          editMode.dateString,
                          editMode.mealType,
                          dish.id,
                        );
                      } else {
                        addMealToPlan(
                          dish,
                          editMode.dateString,
                          editMode.mealType,
                          1,
                        );
                      }
                    }}
                    className={`bg-base-200 p-4 rounded-lg text-left transition-all duration-200 border-2 ${
                      isAlreadyAdded
                        ? "border-success bg-success/10"
                        : "border-transparent hover:border-primary"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm sm:text-base truncate">
                            {dish.name}
                            {isAlreadyAdded && (
                              <span className="badge badge-success badge-xs ml-2">
                                Выбрано
                              </span>
                            )}
                          </h4>
                        </div>
                        {dish.description && (
                          <p className="text-xs sm:text-sm text-base-content/70 line-clamp-2 mb-2">
                            {dish.description}
                          </p>
                        )}
                        {dish.allergens_rel &&
                          dish.allergens_rel.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {dish.allergens_rel.map((allergen) => (
                                <span
                                  key={allergen.id}
                                  className="badge badge-error badge-xs"
                                >
                                  {allergen.name}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-lg sm:text-xl font-bold text-primary">
                          {dish.price} ₽
                        </div>
                        <div className="badge badge-success badge-sm">
                          В наличии: {dish.stock_quantity}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Subscription Modal */}
      <Modal
        isOpen={subscriptionModal}
        onClose={() => {
          setSubscriptionModal(false);
          setSubscriptionWeeks(1);
        }}
        title="Оформить абонемент"
      >
        <div className="space-y-4">
          <div className="bg-info/10 p-4 rounded-lg">
            <p className="text-sm mb-2">
              <strong>Запланировано блюд:</strong> {plannedCount}
            </p>
            <p className="text-sm mb-2">
              <strong>Стоимость за неделю:</strong> {totalCost.toFixed(2)} ₽
            </p>
            <p className="text-sm">
              <strong>Ваш баланс:</strong> {balance.toFixed(2)} ₽
            </p>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Количество недель</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={subscriptionWeeks}
              onChange={(e) => setSubscriptionWeeks(parseInt(e.target.value))}
            >
              {[1, 2, 3].map((week) => (
                <option key={week} value={week}>
                  {week} недел{week > 1 ? "и" : "я"}
                </option>
              ))}
            </select>
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Выберите количество недель (до 3)
              </span>
            </label>
          </div>

          <div className="bg-base-200 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Общая стоимость:</span>
              <span className="text-2xl font-bold text-primary">
                {calculateTotalCost(subscriptionWeeks).toFixed(2)} ₽
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-base-content/60">
                Баланс после оплаты:
              </span>
              <span
                className={`text-lg font-bold ${
                  balance - calculateTotalCost(subscriptionWeeks) >= 0
                    ? "text-success"
                    : "text-error"
                }`}
              >
                {(balance - calculateTotalCost(subscriptionWeeks)).toFixed(2)} ₽
              </span>
            </div>
          </div>

          <div className="modal-action">
            <button
              className="btn btn-ghost transition-all duration-200 hover:scale-105"
              onClick={() => {
                setSubscriptionModal(false);
                setSubscriptionWeeks(1);
              }}
            >
              Отмена
            </button>
            <button
              className="btn btn-primary transition-all duration-200 hover:scale-105"
              onClick={() => handleBulkOrder("subscription", subscriptionWeeks)}
              disabled={
                isOrdering || balance < calculateTotalCost(subscriptionWeeks)
              }
            >
              {isOrdering ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Оформление...
                </>
              ) : (
                <>
                  <Repeat className="h-4 w-4" />
                  Оформить абонемент
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WeeklyPlanner;
