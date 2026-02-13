# Import all functions from individual CRUD modules to maintain backward compatibility
from .user_crud import (
    get_user_by_email,
    get_user_by_full_name,
    create_user,
    update_user_profile,
    update_user_balance,
    update_user_personal_info,
    update_user_password
)

from .dish_crud import (
    get_dishes,
    get_dish_by_id,
    create_dish,
    update_dish,
    delete_dish
)

from .order_crud import (
    create_order,
    get_user_orders,
    get_all_orders,
    get_all_orders_with_student,
    mark_order_received,
    get_today_orders,
    get_today_orders_with_student
)

from .purchase_request_crud import (
    create_purchase_request,
    get_purchase_requests,
    update_purchase_request_status
)

from .review_crud import (
    create_review,
    get_dish_reviews,
    get_user_reviews
)

from .stats_crud import (
    get_payment_statistics,
    get_attendance_statistics
)

__all__ = [
    # User CRUD functions
    "get_user_by_email",
    "get_user_by_full_name",
    "create_user",
    "update_user_profile",
    "update_user_balance",
    "update_user_personal_info",
    "update_user_password",
    
    # Dish CRUD functions
    "get_dishes",
    "get_dish_by_id",
    "create_dish",
    "update_dish",
    "delete_dish",
    
    # Order CRUD functions
    "create_order",
    "get_user_orders",
    "get_all_orders",
    "get_all_orders_with_student",
    "mark_order_received",
    "get_today_orders",
    "get_today_orders_with_student",
    
    # Purchase request CRUD functions
    "create_purchase_request",
    "get_purchase_requests",
    "update_purchase_request_status",
    
    # Review CRUD functions
    "create_review",
    "get_dish_reviews",
    "get_user_reviews",
    
    # Statistics CRUD functions
    "get_payment_statistics",
    "get_attendance_statistics"
]