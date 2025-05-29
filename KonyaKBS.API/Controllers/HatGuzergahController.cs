using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KonyaKBS.API.Models;
using KonyaKBS.API.Data;
using NetTopologySuite.Geometries;

namespace KonyaKBS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HatGuzergahController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<HatGuzergahController> _logger;

        public HatGuzergahController(ApplicationDbContext context, ILogger<HatGuzergahController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("hatlar")]
        public async Task<ActionResult<IEnumerable<int>>> GetHatlar()
        {
            try
            {
                _logger.LogInformation("Hat numaraları getiriliyor");
                var hatlar = await _context.HatGuzergah
                    .Select(h => h.hat_no)
                    .Distinct()
                    .OrderBy(h => h)
                    .ToListAsync();

                _logger.LogInformation("Toplam {Count} hat numarası bulundu", hatlar.Count);
                return Ok(hatlar);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hat numaraları alınırken hata oluştu");
                return StatusCode(500, new { message = "Hat numaraları alınırken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("guzergah/{hatNo}")]
        public async Task<ActionResult<IEnumerable<object>>> GetGuzergah(int hatNo)
        {
            try
            {
                _logger.LogInformation("Hat {HatNo} için güzergah bilgileri getiriliyor", hatNo);
                var guzergah = await _context.HatGuzergah
                    .Where(h => h.hat_no == hatNo)
                    .OrderBy(h => h.id)
                    .Select(h => new {
                        id = h.id,
                        hatNo = h.hat_no,
                        geometry = new {
                            type = "Point",
                            coordinates = new[] { h.geometry.X, h.geometry.Y }
                        }
                    })
                    .ToListAsync();

                if (!guzergah.Any())
                {
                    _logger.LogWarning("Hat {HatNo} için güzergah bulunamadı", hatNo);
                    return NotFound(new { message = $"Hat {hatNo} için güzergah bulunamadı" });
                }

                _logger.LogInformation("Hat {HatNo} için {Count} durak bulundu", hatNo, guzergah.Count);
                return Ok(guzergah);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hat {HatNo} için güzergah bilgileri alınırken hata oluştu", hatNo);
                return StatusCode(500, new { message = "Güzergah bilgileri alınırken bir hata oluştu", error = ex.Message });
            }
        }
    }
} 