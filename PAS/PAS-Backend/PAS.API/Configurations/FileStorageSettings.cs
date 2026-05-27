namespace PAS.API.Configurations;
public class FileStorageSettings
{
  public string StoragePath { get; set; }
    public long MaxFileSizeBytes { get; set; } = 10 * 1024 * 1024;
    public List<string> AllowedExtensions { get; set; } = new()
    {
        ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".bmp",
        ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
        ".txt", ".rtf", ".csv"
    };
    public bool UseAzureStorage { get; set; } = false;

    public string AzureStorageConnectionString { get; set; }

    public string AzureContainerName { get; set; } = "pas-documents";

    public bool UseAwsS3 { get; set; } = false;
    public string AwsS3BucketName { get; set; }
    public string AwsRegion { get; set; }
    public string AwsAccessKey { get; set; }
    public string AwsSecretKey { get; set; }

    public Dictionary<string, string> DocumentCategories { get; set; } = new()
    {
        { "PurchaseOrder", "purchase-orders" },
        { "Invoice", "invoices" },
        { "InspectionReport", "inspection-reports" },
        { "ReceivingNote", "receiving-notes" },
        { "IssueVoucher", "issue-vouchers" },
        { "ReturnNote", "return-notes" },
        { "TransferNote", "transfer-notes" },
        { "DisposalMinutes", "disposal-minutes" },
        { "CommitteeMinutes", "committee-minutes" },
        { "PropertyTag", "property-tags" },
        { "AnnualInventory", "annual-inventory" },
        { "Other", "other" }
    };
    public string NamingPattern { get; set; } = "{category}/{year}/{month}/{guid}_{originalName}";

    public bool CreateThumbnails { get; set; } = true;
    public int ThumbnailSize { get; set; } = 200;
    public bool CompressFiles { get; set; } = false;
    public int TempFileRetentionDays { get; set; } = 7;
    public bool ScanForViruses { get; set; } = false;
    public string VirusScanEndpoint { get; set; }
    public string CdnEndpoint { get; set; }
    public bool RequireAuthenticationForDownload { get; set; } = true;
}