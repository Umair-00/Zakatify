using Microsoft.AspNetCore.Mvc;
using Supabase;
using ZakatifyApi.Models;

namespace ZakatifyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly Supabase.Client _supabase;

        public AuthController(IConfiguration configuration)
        {
            var url = configuration["Supabase:Url"]
                ?? throw new ArgumentNullException("Supabase:Url", "Supabase URL must be configured.");
            var key = configuration["Supabase:ServiceRoleKey"];

            var options = new SupabaseOptions
            {
                AutoRefreshToken = true,
                AutoConnectRealtime = true
            };

            _supabase = new Supabase.Client(url, key, options);
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
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
        public async Task<ActionResult<LoginResponse>> Signup([FromBody] LoginRequest request)
        {
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

                return Ok(new LoginResponse
                {
                    Success = true,
                    Message = "Account created successfully",
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
                    Message = "Signup failed. Please try again."
                });
            }
        }

        [HttpPost("refresh")]
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

        [HttpPost("reset-password")]
        public async Task<ActionResult<LoginResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
        {
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
