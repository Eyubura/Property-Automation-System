namespace Application.Features.TransferReturn.ReturnMaterialRequests.Commands;

public class CreateReturnRequestCommandHandler : IRequestHandler<CreateReturnRequestCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IMediator _mediator;

    public CreateReturnRequestCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IMediator mediator)
    {
        _context = context;
        _currentUser = currentUser;
        _mediator = mediator;
    }

    public async Task<Result<Guid>> Handle(CreateReturnRequestCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.UserGuid.HasValue)
        {
            return Result<Guid>.Failure("User not authenticated.");
        }

        // Validate item exists
        var item = await _context.ItemMasters
            .FirstOrDefaultAsync(i => i.Id == request.ItemId && !i.IsDeleted, cancellationToken);

        if (item == null)
        {
            return Result<Guid>.Failure($"Item with ID {request.ItemId} not found.");
        }

        // Validate return type
        var validReturnTypes = new[] { "TO_SUPPLIER", "TO_WAREHOUSE", "DAMAGED", "QUALITY_ISSUE", "EXCESS" };
        if (!validReturnTypes.Contains(request.ReturnType))
        {
            return Result<Guid>.Failure($"Return type must be one of: {string.Join(", ", validReturnTypes)}");
        }

        // Validate supplier if return type is TO_SUPPLIER
        if (request.ReturnType == "TO_SUPPLIER")
        {
            if (!request.SupplierId.HasValue)
            {
                return Result<Guid>.Failure("Supplier is required for returns to supplier.");
            }

            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Id == request.SupplierId && !s.IsDeleted, cancellationToken);

            if (supplier == null)
            {
                return Result<Guid>.Failure($"Supplier with ID {request.SupplierId} not found.");
            }
        }

        // Validate source location and shelf
        Guid? sourceLocationId = request.SourceLocationId;
        Guid? sourceShelfId = request.SourceShelfId;

        if (request.Quantity <= 0)
        {
            return Result<Guid>.Failure("Quantity must be greater than zero.");
        }

        if (sourceLocationId.HasValue && !sourceShelfId.HasValue)
        {
            var sourceLocation = await _context.PropertyLocations
                .FirstOrDefaultAsync(l => l.Id == sourceLocationId.Value && !l.IsDeleted, cancellationToken);

            if (sourceLocation == null)
            {
                return Result<Guid>.Failure($"Source location with ID {sourceLocationId} not found.");
            }
        }

        if (sourceShelfId.HasValue)
        {
            // If shelf is provided, source location will be derived from shelf's warehouse mapping.
            sourceLocationId = null;

            var sourceShelf = await _context.ShelfLocations
                .Include(s => s.Warehouse)
                .FirstOrDefaultAsync(s => s.Id == sourceShelfId && !s.IsDeleted, cancellationToken);

            if (sourceShelf == null)
            {
                return Result<Guid>.Failure($"Source shelf with ID {sourceShelfId} not found.");
            }

            // Map shelf's warehouse to PropertyLocation (ReturnMaterialRequest FK expects PropertyLocations.Id)
            var mappedLocation = await _context.PropertyLocations
                .FirstOrDefaultAsync(l => !l.IsDeleted
                                       && l.LocationType == "Warehouse"
                                       && l.Name == sourceShelf.Warehouse!.WarehouseName, cancellationToken);

            if (mappedLocation == null)
            {
                mappedLocation = new Domain.PropertyManagement.PropertyLocation(
                    sourceShelf.Warehouse!.WarehouseName,
                    "Warehouse");
                _context.PropertyLocations.Add(mappedLocation);
                await _context.SaveChangesAsync(cancellationToken);
            }

            sourceLocationId = mappedLocation.Id;
        }

        // Check if stock is available for return
        if (sourceShelfId.HasValue)
        {
            var stock = await _context.InventoryStocks
                .FirstOrDefaultAsync(s => s.ItemId == request.ItemId &&
                                          s.ShelfId == sourceShelfId &&
                                          !s.IsDeleted, cancellationToken);

            if (stock == null || stock.CurrentQuantity < request.Quantity)
            {
                return Result<Guid>.Failure($"Insufficient stock at the specified location.");
            }
        }

        // Generate return number
        var returnCount = await _context.ReturnMaterialRequestNotes.CountAsync(cancellationToken) + 1;
        var returnNumber = $"RMA-{DateTime.Now:yyyyMMdd}-{returnCount:D4}";

        // Create return request
        var returnRequest = new Domain.TransferReturn.ReturnMaterialRequestNote(
            request.ItemId,
            request.Quantity,
            request.Reason);

        typeof(Domain.TransferReturn.ReturnMaterialRequestNote).GetProperty("ReturnNumber")?.SetValue(returnRequest, returnNumber);
        typeof(Domain.TransferReturn.ReturnMaterialRequestNote).GetProperty("ReturnType")?.SetValue(returnRequest, request.ReturnType);
        typeof(Domain.TransferReturn.ReturnMaterialRequestNote).GetProperty("RequestedById")?.SetValue(returnRequest, _currentUser.UserGuid);
        typeof(Domain.TransferReturn.ReturnMaterialRequestNote).GetProperty("Status")?.SetValue(returnRequest, "Pending");
        typeof(Domain.TransferReturn.ReturnMaterialRequestNote).GetProperty("SourceLocationId")?.SetValue(returnRequest, sourceLocationId);
        typeof(Domain.TransferReturn.ReturnMaterialRequestNote).GetProperty("SourceShelfId")?.SetValue(returnRequest, sourceShelfId);
        typeof(Domain.TransferReturn.ReturnMaterialRequestNote).GetProperty("SupplierId")?.SetValue(returnRequest, request.SupplierId);
        typeof(Domain.TransferReturn.ReturnMaterialRequestNote).GetProperty("BatchNumber")?.SetValue(returnRequest, request.BatchNumber);
        typeof(Domain.TransferReturn.ReturnMaterialRequestNote).GetProperty("ExpiryDate")?.SetValue(returnRequest, request.ExpiryDate);
        typeof(Domain.TransferReturn.ReturnMaterialRequestNote).GetProperty("Reference")?.SetValue(returnRequest, request.Reference);
        typeof(Domain.TransferReturn.ReturnMaterialRequestNote).GetProperty("Remarks")?.SetValue(returnRequest, request.Remarks);

        _context.ReturnMaterialRequestNotes.Add(returnRequest);

        // Reserve stock if source shelf is specified
        if (sourceShelfId.HasValue)
        {
            var stock = await _context.InventoryStocks
                .FirstOrDefaultAsync(s => s.ItemId == request.ItemId &&
                                          s.ShelfId == sourceShelfId &&
                                          !s.IsDeleted, cancellationToken);

            if (stock != null)
            {
                typeof(Domain.Storage.InventoryStock).GetProperty(nameof(Domain.Storage.InventoryStock.ReservedQuantity))
                    ?.SetValue(stock, stock.ReservedQuantity + request.Quantity);

                // Create stock ledger entry for return reservation
                var ledger = new Domain.Storage.StockLedger(
                    request.ItemId,
                    sourceShelfId.Value,
                    -request.Quantity,
                    "RETURN_RESERVED",
                    returnRequest.Id);

                typeof(Domain.Storage.StockLedger).GetProperty("BatchNumber")?.SetValue(ledger, request.BatchNumber);
                typeof(Domain.Storage.StockLedger).GetProperty("ExpiryDate")?.SetValue(ledger, request.ExpiryDate);
                _context.StockLedgers.Add(ledger);
            }
        }

        // Create audit trail
        var auditTrail = new AuditTrail(
            _currentUser.UserGuid.Value,
            "CREATE",
            nameof(Domain.TransferReturn.ReturnMaterialRequestNote),
            returnRequest.Id);
        _context.AuditTrails.Add(auditTrail);

        await _context.SaveChangesAsync(cancellationToken);

        await _mediator.Publish(new EntityCreatedEvent<Domain.TransferReturn.ReturnMaterialRequestNote>(returnRequest, _currentUser.UserGuid), cancellationToken);

        return Result<Guid>.Success(returnRequest.Id);
    }
}