using Application.Common.Interfaces;
using Microsoft.Extensions.Options;
using PAS.API.Configurations;

namespace PAS.API.Services;

public class FileStorageService : IFileStorageService
{
    private readonly FileStorageSettings _settings;
    private readonly ILogger<FileStorageService> _logger;

    public FileStorageService(IOptions<FileStorageSettings> settings, ILogger<FileStorageService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<string> SaveFileAsync(byte[] content, string fileName, string folder, CancellationToken cancellationToken = default)
    {
        var root = string.IsNullOrWhiteSpace(_settings.StoragePath) ? "uploads" : _settings.StoragePath;
        var directoryPath = Path.Combine(root, folder);
        Directory.CreateDirectory(directoryPath);

        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        var filePath = Path.Combine(directoryPath, uniqueFileName);

        await File.WriteAllBytesAsync(filePath, content, cancellationToken);
        _logger.LogInformation("File saved: {FilePath}", filePath);

        return filePath;
    }

    public async Task<byte[]> GetFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        if (!File.Exists(filePath))
            throw new FileNotFoundException($"File not found: {filePath}");

        return await File.ReadAllBytesAsync(filePath, cancellationToken);
    }

    public Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
            _logger.LogInformation("File deleted: {FilePath}", filePath);
        }

        return Task.CompletedTask;
    }

    public Task<string> GetFileUrlAsync(string filePath)
    {
        var root = string.IsNullOrWhiteSpace(_settings.StoragePath) ? "uploads" : _settings.StoragePath;
        var relativePath = filePath.Replace(root, "").Replace("\\", "/");
        return Task.FromResult(relativePath);
    }
}