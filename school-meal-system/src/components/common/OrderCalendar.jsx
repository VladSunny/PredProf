import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Clock, CheckCircle, Package } from 'lucide-react';
import OrderCard from './OrderCard';

const OrderCalendar = ({ orders, userType = 'student', onReceiveClick = null }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Filter orders for the selected date
  const getOrdersForDate = (date) => {
    // Create a date object that represents the start and end of the selected date in local timezone
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    return orders.filter(order => {
      // Compare with order_date if available, otherwise use created_at
      const orderDate = order.order_date || order.created_at;
      const orderDateTime = new Date(orderDate);
      
      // Check if the order date falls within the selected date range
      return orderDateTime >= startDate && orderDateTime < endDate;
    });
  };
  
  // Get the count of orders for a specific date (for calendar tile styling)
  const getOrderCountForDate = (date) => {
    return getOrdersForDate(date).length;
  };
  
  // Custom tile content to show order count
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const count = getOrderCountForDate(date);
      return count > 0 ? (
        <div className="absolute bottom-1 right-1 text-[0.6rem] bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center">
          {count}
        </div>
      ) : null;
    }
  };
  
  const ordersForSelectedDate = getOrdersForDate(selectedDate);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <div className="bg-base-100 p-4 rounded-box shadow">
        <h3 className="text-lg font-semibold mb-4 text-center">Календарь заказов</h3>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          locale="ru-RU"
          tileContent={tileContent}
          className="calendar-custom"
          formatDay={(locale, date) => date.toLocaleDateString('ru-RU', { day: 'numeric' })}
        />
        
        <div className="mt-4 p-3 bg-base-200 rounded-box">
          <p className="text-sm font-medium">
            Выбранная дата: {selectedDate.toLocaleDateString('ru-RU', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-sm">
            Заказов: <span className="font-bold">{ordersForSelectedDate.length}</span>
          </p>
        </div>
      </div>
      
      {/* Orders for selected date */}
      <div className="bg-base-100 p-4 rounded-box shadow">
        <h3 className="text-lg font-semibold mb-4">
          Заказы на {selectedDate.toLocaleDateString('ru-RU')}
        </h3>
        
        {ordersForSelectedDate.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-base-content/30 mb-2" />
            <p className="text-base-content/60">Нет заказов на эту дату</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {ordersForSelectedDate.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onReceiveClick={onReceiveClick}
                showStudentId={userType === 'chef'}
                className="hover:shadow-md transition-shadow"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCalendar;