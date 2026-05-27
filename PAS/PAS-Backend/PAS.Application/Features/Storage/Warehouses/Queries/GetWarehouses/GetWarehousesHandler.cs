using Application.Features.Storage.Warehouses.Dtos;
using MediatR;

namespace Application.Features.Storage.Warehouses.Queries;

public class GetWarehousesQueryHandler : IRequestHandler<GetWarehousesQuery, Result<PaginatedList<WarehouseListDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetWarehousesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PaginatedList<WarehouseListDto>>> Handle(GetWarehousesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Warehouses
            .Include(w => w.ShelfLocations)
            .Where(w => !w.IsDeleted)
            .AsNoTracking();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(w =>
                w.WarehouseName.Contains(request.SearchTerm) ||
                w.LocationCode.Contains(request.SearchTerm) ||
                (w.City != null && w.City.Contains(request.SearchTerm)));
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(w => w.IsActive == request.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(request.City))
        {
            query = query.Where(w => w.City == request.City);
        }

        // Project to DTO
        var projectedQuery = query.Select(w => new WarehouseListDto
        {
            Id = w.Id,
            WarehouseName = w.WarehouseName,
            LocationCode = w.LocationCode,
            City = w.City ?? string.Empty,
            IsActive = w.IsActive,
            ShelfCount = w.ShelfLocations != null ? w.ShelfLocations.Count(s => !s.IsDeleted) : 0,
            ItemCount = w.ShelfLocations != null ?
                w.ShelfLocations.Where(s => !s.IsDeleted).Sum(s =>
                    s.InventoryStocks != null ? s.InventoryStocks.Count(i => !i.IsDeleted) : 0) : 0
        });

        var paginatedWarehouses = await projectedQuery
            .OrderBy(w => w.WarehouseName)
            .PaginatedListAsync(request.PageNumber, request.PageSize);

        return Result<PaginatedList<WarehouseListDto>>.Success(paginatedWarehouses);
    }
}
