using ECommerce.Domain.Common;
using ECommerce.Domain.Enums;

namespace ECommerce.Domain.Entities;

public class Refund : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid PaymentId { get; set; }
    public Payment Payment { get; set; } = null!;

    public string Reason { get; set; } = string.Empty;
    public RefundStatus Status { get; set; } = RefundStatus.Requested;
    public decimal Amount { get; set; }
    public string? AdminNotes { get; set; }
    public DateTime? ProcessedAt { get; set; }
}

