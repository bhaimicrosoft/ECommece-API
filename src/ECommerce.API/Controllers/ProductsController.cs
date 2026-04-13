using ECommerce.Application.DTOs;
using ECommerce.Application.Features.Products;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] string? search, [FromQuery] Guid? categoryId,
        [FromQuery] Guid? brandId, [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice,
        [FromQuery] bool? isFeatured, [FromQuery] string? sortBy, [FromQuery] bool sortDescending = false,
        [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 12)
    {
        var result = await _mediator.Send(new GetProductsQuery(search, categoryId, brandId, minPrice, maxPrice,
            isFeatured, sortBy, sortDescending, pageNumber, pageSize));
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var result = await _mediator.Send(new GetProductByIdQuery(id));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
    {
        var result = await _mediator.Send(new CreateProductCommand(dto));
        return result.Success ? CreatedAtAction(nameof(GetProduct), new { id = result.Data!.Id }, result) : BadRequest(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductDto dto)
    {
        var result = await _mediator.Send(new UpdateProductCommand(id, dto));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var result = await _mediator.Send(new DeleteProductCommand(id));
        return result.Success ? Ok(result) : NotFound(result);
    }
}

