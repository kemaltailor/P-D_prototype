using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KonyaKBS.API.Data;
using KonyaKBS.API.Models;
using System.Globalization;
using Npgsql;

namespace KonyaKBS.API.Controllers
{
    [ApiController]
    [Route("api/hava-kalite")]
    [Produces("application/json")]
    public class HavaKaliteController : ControllerBase
    {
        private readonly KonyaKBSContext _db;
        private readonly ILogger<HavaKaliteController> _logger;

        public HavaKaliteController(KonyaKBSContext db, ILogger<HavaKaliteController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpPost("bosna")]
        public async Task<IActionResult> GetBosnaData([FromBody] HavaKaliteRequest request) => 
            await GetStationData(request, "istasyonbosna");

        [HttpPost("karatay1")]
        public async Task<IActionResult> GetKaratay1Data([FromBody] HavaKaliteRequest request) => 
            await GetStationData(request, "istasyonkaratay1");

        [HttpPost("karatay2")]
        public async Task<IActionResult> GetKaratay2Data([FromBody] HavaKaliteRequest request) => 
            await GetStationData(request, "istasyonkaratay2");

        [HttpPost("karkent")]
        public async Task<IActionResult> GetKarkentData([FromBody] HavaKaliteRequest request) => 
            await GetStationData(request, "istasyonkarkent");

        [HttpPost("meram")]
        public async Task<IActionResult> GetMeramData([FromBody] HavaKaliteRequest request) => 
            await GetStationData(request, "istasyonmeram");

        [HttpPost("sarayonu")]
        public async Task<IActionResult> GetSarayonuData([FromBody] HavaKaliteRequest request) => 
            await GetStationData(request, "istasyonsarayonu");

        [HttpPost("trafik")]
        public async Task<IActionResult> GetTrafikData([FromBody] HavaKaliteRequest request) => 
            await GetStationData(request, "istasyontrafik");

        private async Task<IActionResult> GetStationData(HavaKaliteRequest request, string tableName)
        {
            try
            {
                _logger.LogInformation("Hava kalitesi verisi isteği alındı: {Date}, {TableName}", request.Date, tableName);

                if (string.IsNullOrEmpty(request.Date))
                {
                    _logger.LogWarning("Geçersiz istek parametreleri: Date={Date}", request.Date);
                    return BadRequest(new { message = "Tarih gereklidir" });
                }

                var date = DateTime.ParseExact(request.Date, "yyyy-MM-dd", CultureInfo.InvariantCulture);
                var parameters = new NpgsqlParameter[]
                {
                    new NpgsqlParameter("@date", NpgsqlTypes.NpgsqlDbType.Date) { Value = date }
                };

                var sql = $@"
                    SELECT 
                        COALESCE(AVG(no), 0) as no,
                        COALESCE(AVG(no2), 0) as no2,
                        COALESCE(AVG(nox), 0) as nox,
                        COALESCE(AVG(pm10), 0) as pm10
                    FROM ""{tableName}""
                    WHERE DATE(tarih_saat) = @date";

                _logger.LogInformation("SQL sorgusu: {Sql}", sql);

                var result = await _db.Set<HavaKaliteGunlukOrtalama>()
                    .FromSqlRaw(sql, parameters)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (result == null)
                {
                    _logger.LogWarning("Veri bulunamadı: {Date}, {TableName}", request.Date, tableName);
                    return NotFound(new { message = "Seçilen tarih için veri bulunamadı" });
                }

                _logger.LogInformation("Veri başarıyla alındı: {Result}", result);
                return Ok(result);
            }
            catch (FormatException ex)
            {
                _logger.LogError(ex, "Tarih formatı hatası: {Date}", request.Date);
                return BadRequest(new { message = "Geçersiz tarih formatı. Tarih YYYY-MM-DD formatında olmalıdır." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Veri alınırken hata oluştu");
                return StatusCode(500, new { message = "Veriler alınırken bir hata oluştu", error = ex.Message });
            }
        }
    }

    public class HavaKaliteRequest
    {
        public string Date { get; set; } = string.Empty;
    }
} 