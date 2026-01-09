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
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
            
            var url = _configuration["Supabase:Url"];
            var key = _configuration["Supabase:ServiceRoleKey"];
            
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
                    Email = session.User.Email
                });
            }
            catch (Exception ex)
            {
                return Ok(new LoginResponse
                {
                    Success = false,
                    Message = $"Login failed: {ex.Message}"
                });
            }
        }

      [HttpPost("signup")]
public async Task<ActionResult<LoginResponse>> Signup([FromBody] LoginRequest request)
{
    try
    {
        var session = await _supabase.Auth.SignUp(request.Email, request.Password);

        // Check if signup failed
        if (session?.User == null)
        {
            return Ok(new LoginResponse
            {
                Success = false,
                Message = "Signup failed. Please try again."
            });
        }

        // Check for duplicate email: If user exists but identities array is empty, email is taken
        if (session.User.Identities == null || session.User.Identities.Count == 0)
        {
            return Ok(new LoginResponse
            {
                Success = false,
                Message = "An account with this email already exists"
            });
        }

        // Success - new user created
        return Ok(new LoginResponse
        {
            Success = true,
            Message = "Account created successfully",
            UserId = session.User.Id,
            Email = session.User.Email
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
    }
}