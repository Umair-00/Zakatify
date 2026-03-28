using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Supabase;
using ZakatifyApi.Models;
using ZakatifyApi.Services;

namespace ZakatifyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly Supabase.Client _supabase;
        private readonly Supabase.Client _supabaseAdmin;

        public AuthController(IConfiguration configuration)
        {
            var url = configuration["Supabase:Url"]
                ?? throw new ArgumentNullException("Supabase:Url", "Supabase URL must be configured.");
            var anonKey = configuration["Supabase:AnonKey"];
            var serviceKey = configuration["Supabase:ServiceRoleKey"];

            var options = new SupabaseOptions
            {
                AutoRefreshToken = true,
                AutoConnectRealtime = true
            };

            _supabase = new Supabase.Client(url, anonKey, options);
            _supabaseAdmin = new Supabase.Client(url, serviceKey, options);
        }

        [HttpPost("login")]
        [EnableRateLimiting("auth-strict")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            request.Email = request.Email.Trim();

            if (!EmailValidator.IsValid(request.Email))
            {
                return Ok(new LoginResponse { Success = false, Message = "Please enter a valid email address." });
            }

            try
            {
                var session = await _supabase.Auth.SignIn(request.Email, request.Password);

                if (session?.User == null)
                {
                    return Ok(new LoginResponse
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    });
                }

                if (session.User.EmailConfirmedAt == null)
                {
                    return Ok(new LoginResponse
                    {
                        Success = false,
                        Message = "Please verify your email address before logging in. Check your inbox for a confirmation link."
                    });
                }

                return Ok(new LoginResponse
                {
                    Success = true,
                    Message = "Login successful",
                    UserId = session.User.Id,
                    Email = session.User.Email,
                    AccessToken = session.AccessToken,
                    RefreshToken = session.RefreshToken
                });
            }
            catch (Exception)
            {
                return Ok(new LoginResponse
                {
                    Success = false,
                    Message = "Login failed. Please try again."
                });
            }
        }

        [HttpPost("signup")]
        [EnableRateLimiting("auth-signup")]
        public async Task<ActionResult<LoginResponse>> Signup([FromBody] SignupRequest request)
        {
            // Trim inputs
            request.Email = request.Email.Trim();
            request.FirstName = request.FirstName.Trim();
            request.LastName = request.LastName.Trim();

            if (!EmailValidator.IsValid(request.Email))
            {
                return Ok(new LoginResponse { Success = false, Message = "Please enter a valid email address." });
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
            {
                return Ok(new LoginResponse { Success = false, Message = "First name and last name are required." });
            }

            if (request.FirstName.Length > 50 || request.LastName.Length > 50)
            {
                return Ok(new LoginResponse { Success = false, Message = "Name must be 50 characters or less." });
            }

            if (string.IsNullOrWhiteSpace(request.Country) || request.Country.Length != 2)
            {
                return Ok(new LoginResponse { Success = false, Message = "A valid country is required." });
            }

            if (string.IsNullOrWhiteSpace(request.Currency) || request.Currency.Length != 3)
            {
                return Ok(new LoginResponse { Success = false, Message = "A valid currency is required." });
            }

            var (isValid, error) = PasswordValidator.Validate(request.Password);
            if (!isValid)
            {
                return Ok(new LoginResponse { Success = false, Message = error! });
            }

            try
            {
                var session = await _supabase.Auth.SignUp(request.Email, request.Password);

                if (session?.User == null)
                {
                    return Ok(new LoginResponse
                    {
                        Success = false,
                        Message = "Signup failed. Please try again."
                    });
                }

                // Duplicate email: user exists but identities array is empty
                if (session.User.Identities == null || session.User.Identities.Count == 0)
                {
                    return Ok(new LoginResponse
                    {
                        Success = false,
                        Message = "An account with this email already exists"
                    });
                }

                // Insert profile using admin client (bypasses RLS since user isn't authenticated yet)
                await _supabaseAdmin.From<Profile>()
                    .Insert(new Profile
                    {
                        Id = session.User.Id!,
                        FirstName = request.FirstName.Trim(),
                        LastName = request.LastName.Trim(),
                        Country = request.Country.ToUpperInvariant(),
                        Currency = request.Currency.ToUpperInvariant()
                    });

                return Ok(new LoginResponse
                {
                    Success = true,
                    Message = "Account created! Please check your email to verify your account before logging in."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Signup error: {ex.Message}");
                return Ok(new LoginResponse
                {
                    Success = false,
                    Message = "Signup failed. Please try again."
                });
            }
        }

        [HttpPost("refresh")]
        [EnableRateLimiting("auth-refresh")]
        public async Task<ActionResult<LoginResponse>> Refresh([FromBody] RefreshRequest request)
        {
            try
            {
                var session = await _supabase.Auth.RefreshSession();

                if (session == null)
                {
                    await _supabase.Auth.SetSession(string.Empty, request.RefreshToken);
                    session = await _supabase.Auth.RefreshSession();
                }

                if (session?.User == null)
                {
                    return Ok(new LoginResponse
                    {
                        Success = false,
                        Message = "Session expired. Please log in again."
                    });
                }

                return Ok(new LoginResponse
                {
                    Success = true,
                    Message = "Token refreshed",
                    UserId = session.User.Id,
                    Email = session.User.Email,
                    AccessToken = session.AccessToken,
                    RefreshToken = session.RefreshToken
                });
            }
            catch (Exception)
            {
                return Ok(new LoginResponse
                {
                    Success = false,
                    Message = "Session expired. Please log in again."
                });
            }
        }

        [HttpPost("forgot-password")]
        [EnableRateLimiting("auth-email")]
        public async Task<ActionResult<LoginResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                // Always return success to prevent email enumeration
                await _supabase.Auth.ResetPasswordForEmail(request.Email);

                return Ok(new LoginResponse
                {
                    Success = true,
                    Message = "If an account exists with that email, a reset link has been sent."
                });
            }
            catch (Exception)
            {
                // Still return success to prevent email enumeration
                return Ok(new LoginResponse
                {
                    Success = true,
                    Message = "If an account exists with that email, a reset link has been sent."
                });
            }
        }

        [HttpGet("profile")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<ActionResult<ProfileResponse>> GetProfile()
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Ok(new ProfileResponse { Success = false, Message = "Unauthorized" });
                }

                var response = await _supabaseAdmin.From<Profile>()
                    .Where(p => p.Id == userId)
                    .Single();

                if (response == null)
                {
                    return Ok(new ProfileResponse { Success = false, Message = "Profile not found" });
                }

                return Ok(new ProfileResponse
                {
                    Success = true,
                    Message = "Profile retrieved",
                    Id = response.Id,
                    FirstName = response.FirstName,
                    LastName = response.LastName,
                    Country = response.Country,
                    Currency = response.Currency,
                    NisabBasis = response.NisabBasis,
                    CalendarType = response.CalendarType,
                    ZakatAnniversary = response.ZakatAnniversary?.ToString("yyyy-MM-dd")
                });
            }
            catch (Exception)
            {
                return Ok(new ProfileResponse { Success = false, Message = "Failed to retrieve profile" });
            }
        }

        [HttpPut("profile")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<ActionResult<ProfileResponse>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Ok(new ProfileResponse { Success = false, Message = "Unauthorized" });
            }

            request.FirstName = request.FirstName.Trim();
            request.LastName = request.LastName.Trim();

            if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
            {
                return Ok(new ProfileResponse { Success = false, Message = "First name and last name are required." });
            }

            if (request.FirstName.Length > 50 || request.LastName.Length > 50)
            {
                return Ok(new ProfileResponse { Success = false, Message = "Name must be 50 characters or less." });
            }

            if (string.IsNullOrWhiteSpace(request.Country) || request.Country.Length != 2)
            {
                return Ok(new ProfileResponse { Success = false, Message = "A valid country is required." });
            }

            if (string.IsNullOrWhiteSpace(request.Currency) || request.Currency.Length != 3)
            {
                return Ok(new ProfileResponse { Success = false, Message = "A valid currency is required." });
            }

            if (request.NisabBasis != "gold" && request.NisabBasis != "silver")
            {
                return Ok(new ProfileResponse { Success = false, Message = "Nisab basis must be 'gold' or 'silver'." });
            }

            if (request.CalendarType != "lunar" && request.CalendarType != "gregorian")
            {
                return Ok(new ProfileResponse { Success = false, Message = "Calendar type must be 'lunar' or 'gregorian'." });
            }

            DateTime? zakatAnniversary = null;
            if (!string.IsNullOrEmpty(request.ZakatAnniversary))
            {
                if (!DateTime.TryParse(request.ZakatAnniversary, out var parsed))
                {
                    return Ok(new ProfileResponse { Success = false, Message = "Invalid zakat anniversary date." });
                }
                zakatAnniversary = parsed;
            }

            try
            {
                var existing = await _supabaseAdmin.From<Profile>()
                    .Where(p => p.Id == userId)
                    .Single();

                if (existing == null)
                {
                    return Ok(new ProfileResponse { Success = false, Message = "Profile not found" });
                }

                existing.FirstName = request.FirstName;
                existing.LastName = request.LastName;
                existing.Country = request.Country.ToUpperInvariant();
                existing.Currency = request.Currency.ToUpperInvariant();
                existing.NisabBasis = request.NisabBasis;
                existing.CalendarType = request.CalendarType;
                existing.ZakatAnniversary = zakatAnniversary;

                await _supabaseAdmin.From<Profile>()
                    .Where(p => p.Id == userId)
                    .Update(existing);

                return Ok(new ProfileResponse
                {
                    Success = true,
                    Message = "Profile updated",
                    Id = existing.Id,
                    FirstName = existing.FirstName,
                    LastName = existing.LastName,
                    Country = existing.Country,
                    Currency = existing.Currency,
                    NisabBasis = existing.NisabBasis,
                    CalendarType = existing.CalendarType,
                    ZakatAnniversary = existing.ZakatAnniversary?.ToString("yyyy-MM-dd")
                });
            }
            catch (Exception)
            {
                return Ok(new ProfileResponse { Success = false, Message = "Failed to update profile" });
            }
        }

        [HttpPost("reset-password")]
        [EnableRateLimiting("auth-strict")]
        public async Task<ActionResult<LoginResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var (isValid, error) = PasswordValidator.Validate(request.NewPassword);
            if (!isValid)
            {
                return Ok(new LoginResponse { Success = false, Message = error! });
            }

            try
            {
                // Establish session using the recovery tokens from the email link
                await _supabase.Auth.SetSession(request.AccessToken, request.RefreshToken);

                // Update the user's password
                var user = await _supabase.Auth.Update(
                    new Supabase.Gotrue.UserAttributes { Password = request.NewPassword }
                );

                if (user == null)
                {
                    return Ok(new LoginResponse
                    {
                        Success = false,
                        Message = "Password reset failed. The link may have expired."
                    });
                }

                return Ok(new LoginResponse
                {
                    Success = true,
                    Message = "Password updated successfully. You can now log in."
                });
            }
            catch (Exception)
            {
                return Ok(new LoginResponse
                {
                    Success = false,
                    Message = "Password reset failed. The link may have expired."
                });
            }
        }
    }
}
