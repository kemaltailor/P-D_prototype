using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KonyaKBS.API.Data;
using NetTopologySuite.Geometries;
using Microsoft.AspNetCore.Authorization;

namespace KonyaKBS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TuristikKonumController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TuristikKonumController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetTuristikKonumlar()
        {
            try
            {
                var konumlar = await _context.Database.SqlQueryRaw<dynamic>(
                    "SELECT * FROM turistik_konumlar"
                ).ToListAsync();

                return Ok(konumlar);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Turistik konumlar alınırken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddTuristikKonum([FromBody] TuristikKonumInput input)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { message = "Geçersiz veri formatı" });

                if (string.IsNullOrEmpty(input.Isim) || string.IsNullOrEmpty(input.Tur))
                    return BadRequest(new { message = "İsim ve tür alanları zorunludur" });

                Console.WriteLine($"Gelen veriler: Isim={input.Isim}, Tur={input.Tur}, Latitude={input.Latitude}, Longitude={input.Longitude}");

                var point = new Point(input.Longitude, input.Latitude) { SRID = 4326 };

                await _context.Database.ExecuteSqlRawAsync(
                    @"INSERT INTO turistik_konumlar (isim, tur, icerik, resim, geometry) 
                      VALUES ({0}, {1}, {2}, {3}, ST_SetSRID(ST_MakePoint({4}, {5}), 4326))",
                    input.Isim, input.Tur, input.Icerik, input.Resim, input.Longitude, input.Latitude
                );

                return Ok(new { message = "Turistik konum başarıyla eklendi" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Turistik konum eklenirken bir hata oluştu", 
                    error = ex.Message,
                    stackTrace = ex.StackTrace,
                    innerException = ex.InnerException?.Message
                });
            }
        }
    }

    public class TuristikKonumInput
    {
        public string Isim { get; set; }
        public string Tur { get; set; }
        public string Icerik { get; set; }
        public string Resim { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
} 