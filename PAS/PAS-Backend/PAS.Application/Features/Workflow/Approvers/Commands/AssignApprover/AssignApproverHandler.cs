using Application.Events;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Persistence.Identity;

namespace Application.Features.Workflow.Approvers.Commands.AssignApprover;

public class AssignApproverCommandHandler : IRequestHandler<AssignApproverCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IMediator _mediator;
    private readonly UserManager<ApplicationUser> _userManager;

    public AssignApproverCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IMediator mediator,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _currentUser = currentUser;
        _mediator = mediator;
        _userManager = userManager;
    }

    public async Task<Result<Guid>> Handle(AssignApproverCommand request, CancellationToken cancellationToken)
    {
        var workflow = await _context.ApprovalWorkflows
            .Include(w => w.Approvers)
            .FirstOrDefaultAsync(w => w.Id == request.WorkflowId && !w.IsDeleted, cancellationToken);

        if (workflow == null)
        {
            return Result<Guid>.Failure("Workflow not found.");
        }

        var identityUserId = request.UserId.ToString();
        var identityUser = await _userManager.FindByIdAsync(identityUserId);
        if (identityUser == null || !identityUser.IsActive)
        {
            return Result<Guid>.Failure("User not found or inactive.");
        }

        var approverUserId = request.UserId;

        var existingApprover = workflow.Approvers?
            .FirstOrDefault(a => a.UserId == approverUserId && !a.IsDeleted);

        if (existingApprover != null)
        {
            return Result<Guid>.Failure("User is already assigned to this workflow.");
        }

        var existingLevel = workflow.Approvers?
            .Any(a => a.ApprovalLevel == request.ApprovalLevel && !a.IsDeleted) == true;

        if (existingLevel)
        {
            return Result<Guid>.Failure($"Approval level {request.ApprovalLevel} is already assigned.");
        }

        var approver = new Approver(request.WorkflowId, approverUserId, request.ApprovalLevel);

        _context.Approvers.Add(approver);
        await _context.SaveChangesAsync(cancellationToken);

        if (_currentUser.UserGuid.HasValue)
        {
            var auditTrail = new AuditTrail(
                _currentUser.UserGuid.Value,
                "ASSIGN_APPROVER",
                nameof(Approver),
                approver.Id);
            _context.AuditTrails.Add(auditTrail);
            await _context.SaveChangesAsync(cancellationToken);
        }

        await _mediator.Publish(new EntityCreatedEvent<Approver>(approver, _currentUser.UserGuid), cancellationToken);

        return Result<Guid>.Success(approver.Id);
    }
}