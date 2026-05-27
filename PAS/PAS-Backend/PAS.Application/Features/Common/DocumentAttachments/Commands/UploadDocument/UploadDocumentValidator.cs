using FluentValidation;

namespace Application.Features.Common.DocumentAttachments.Commands.UploadDocument;

public class UploadDocumentCommandValidator : AbstractValidator<UploadDocumentCommand>
{
    private readonly string[] _allowedExtensions = { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".txt" };
    private const long MaxFileSize = 10 * 1024 * 1024; // 10MB

    public UploadDocumentCommandValidator()
    {
        RuleFor(v => v.File)
            .NotNull().WithMessage("File is required.");

        RuleFor(v => v.File.Length)
            .LessThanOrEqualTo(MaxFileSize).WithMessage($"File size must not exceed {MaxFileSize / 1024 / 1024}MB.");

        RuleFor(v => v.File.FileName)
            .Must(fileName => _allowedExtensions.Contains(Path.GetExtension(fileName).ToLower()))
            .WithMessage($"File type not allowed. Allowed types: {string.Join(", ", _allowedExtensions)}");

        RuleFor(v => v.RelatedEntityId)
            .NotEmpty().WithMessage("Related entity ID is required.");

        RuleFor(v => v.RelatedEntityName)
            .NotEmpty().WithMessage("Related entity name is required.")
            .MaximumLength(100).WithMessage("Related entity name must not exceed 100 characters.");
    }
}