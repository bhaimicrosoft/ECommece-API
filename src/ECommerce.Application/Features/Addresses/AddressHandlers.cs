using AutoMapper;
using ECommerce.Application.Common.Models;
using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Addresses;

public record GetAddressesQuery(Guid UserId) : IRequest<ApiResponse<List<AddressDto>>>;

public class GetAddressesQueryHandler : IRequestHandler<GetAddressesQuery, ApiResponse<List<AddressDto>>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public GetAddressesQueryHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<List<AddressDto>>> Handle(GetAddressesQuery request, CancellationToken ct)
    {
        var addresses = await _uow.Addresses.Query()
            .Where(a => a.UserId == request.UserId)
            .OrderByDescending(a => a.IsDefault)
            .ToListAsync(ct);

        return ApiResponse<List<AddressDto>>.SuccessResponse(_mapper.Map<List<AddressDto>>(addresses));
    }
}

public record CreateAddressCommand(Guid UserId, CreateAddressDto Dto) : IRequest<ApiResponse<AddressDto>>;

public class CreateAddressCommandHandler : IRequestHandler<CreateAddressCommand, ApiResponse<AddressDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CreateAddressCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<AddressDto>> Handle(CreateAddressCommand request, CancellationToken ct)
    {
        if (request.Dto.IsDefault)
        {
            var existing = await _uow.Addresses.FindAsync(a => a.UserId == request.UserId && a.IsDefault, ct);
            foreach (var addr in existing)
            {
                addr.IsDefault = false;
                await _uow.Addresses.UpdateAsync(addr, ct);
            }
        }

        var address = _mapper.Map<Address>(request.Dto);
        address.UserId = request.UserId;

        await _uow.Addresses.AddAsync(address, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<AddressDto>.SuccessResponse(_mapper.Map<AddressDto>(address), "Address added.");
    }
}

public record UpdateAddressCommand(Guid UserId, Guid AddressId, UpdateAddressDto Dto) : IRequest<ApiResponse<AddressDto>>;

public class UpdateAddressCommandHandler : IRequestHandler<UpdateAddressCommand, ApiResponse<AddressDto>>
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public UpdateAddressCommandHandler(IUnitOfWork uow, IMapper mapper) { _uow = uow; _mapper = mapper; }

    public async Task<ApiResponse<AddressDto>> Handle(UpdateAddressCommand request, CancellationToken ct)
    {
        var address = await _uow.Addresses.Query()
            .FirstOrDefaultAsync(a => a.Id == request.AddressId && a.UserId == request.UserId, ct);

        if (address == null) return ApiResponse<AddressDto>.FailResponse("Address not found.");

        if (request.Dto.IsDefault)
        {
            var existing = await _uow.Addresses.FindAsync(a => a.UserId == request.UserId && a.IsDefault && a.Id != request.AddressId, ct);
            foreach (var addr in existing)
            {
                addr.IsDefault = false;
                await _uow.Addresses.UpdateAsync(addr, ct);
            }
        }

        address.Label = request.Dto.Label;
        address.FullName = request.Dto.FullName;
        address.Phone = request.Dto.Phone;
        address.Street = request.Dto.Street;
        address.City = request.Dto.City;
        address.State = request.Dto.State;
        address.ZipCode = request.Dto.ZipCode;
        address.Country = request.Dto.Country;
        address.IsDefault = request.Dto.IsDefault;
        address.UpdatedAt = DateTime.UtcNow;

        await _uow.Addresses.UpdateAsync(address, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<AddressDto>.SuccessResponse(_mapper.Map<AddressDto>(address), "Address updated.");
    }
}

public record DeleteAddressCommand(Guid UserId, Guid AddressId) : IRequest<ApiResponse<bool>>;

public class DeleteAddressCommandHandler : IRequestHandler<DeleteAddressCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _uow;

    public DeleteAddressCommandHandler(IUnitOfWork uow) { _uow = uow; }

    public async Task<ApiResponse<bool>> Handle(DeleteAddressCommand request, CancellationToken ct)
    {
        var address = await _uow.Addresses.Query()
            .FirstOrDefaultAsync(a => a.Id == request.AddressId && a.UserId == request.UserId, ct);

        if (address == null) return ApiResponse<bool>.FailResponse("Address not found.");

        await _uow.Addresses.DeleteAsync(address, ct);
        await _uow.SaveChangesAsync(ct);

        return ApiResponse<bool>.SuccessResponse(true, "Address deleted.");
    }
}

