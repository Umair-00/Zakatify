using System.Text.RegularExpressions;

namespace ZakatifyApi.Services;

public static partial class EmailValidator
{
    [GeneratedRegex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$")]
    private static partial Regex EmailRegex();

    public static bool IsValid(string email)
    {
        return !string.IsNullOrWhiteSpace(email) && EmailRegex().IsMatch(email);
    }
}
