namespace ZakatifyApi.Models
{
    public class ResetPasswordRequest
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
