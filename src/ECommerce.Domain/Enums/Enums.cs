namespace ECommerce.Domain.Enums;

public enum UserRole
{
    Customer = 0,
    Admin = 1
}

public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    Processing = 2,
    Shipped = 3,
    Delivered = 4,
    Cancelled = 5,
    ReturnRequested = 6,
    Returned = 7
}

public enum PaymentStatus
{
    Pending = 0,
    Completed = 1,
    Failed = 2,
    Refunded = 3
}

public enum PaymentMethod
{
    CreditCard = 0,
    DebitCard = 1,
    UPI = 2,
    NetBanking = 3,
    COD = 4
}

public enum RefundStatus
{
    Requested = 0,
    Approved = 1,
    Processed = 2,
    Rejected = 3
}

public enum DiscountType
{
    Percentage = 0,
    Flat = 1
}

