namespace PAS.API.Models.Responses;

public class ApiResponse<T>
{
    // Use property name `Succeeded` so JSON output matches frontend expectations (`succeeded`).
    public bool Succeeded { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public int StatusCode { get; set; }

    public static ApiResponse<T> SuccessResponse(T data, string message = "Success")
    {
        return new ApiResponse<T>
        {
            Succeeded = true,
            Message = message,
            Data = data,
            StatusCode = 200
        };
    }

    public static ApiResponse<T> ErrorResponse(string message, int statusCode = 400)
    {
        return new ApiResponse<T>
        {
            Succeeded = false,
            Message = message,
            StatusCode = statusCode
        };
    }
}