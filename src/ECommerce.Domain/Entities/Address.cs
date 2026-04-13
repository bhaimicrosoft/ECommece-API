using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Address : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Label { get; set; } = string.Empty; // Home, Work, etc.
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}

