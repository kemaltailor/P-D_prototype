using Microsoft.AspNetCore.Mvc;
using KonyaKBS.API.Data;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;

namespace KonyaKBS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationController : ControllerBase
    {
        private readonly KonyaKBSContext _db;

        public LocationController(KonyaKBSContext db)
        {
            _db = db;
        }

        private IActionResult CreateGeoJsonResponse<T>(IEnumerable<T> data, Func<T, object> propertiesSelector)
        {
            var features = data.Select(item => new
            {
                type = "Feature",
                properties = propertiesSelector(item),
                geometry = new
                {
                    type = "Point",
                    coordinates = new[] { ((dynamic)item).Location.X, ((dynamic)item).Location.Y }
                }
            });

            var geoJson = new { type = "FeatureCollection", features = features };
            return new JsonResult(geoJson);
        }

        [HttpGet("otoparklar")]
        public IActionResult GetOtoparklar()
        {
            var data = _db.Otoparklar.ToList();
            return CreateGeoJsonResponse(data, o => new { name = o.Name, capacity = o.Kapasite, occupiedSpaces = o.Doluluk });
        }

        [HttpGet("tatli-su-cesmeleri")]
        public IActionResult GetTatliSuCesmeleri()
        {
            var data = _db.TatliSuCesmeleri.ToList();
            return CreateGeoJsonResponse(data, c => new { ACIKLAMA = c.Name });
        }

        [HttpGet("bisiklet-park")]
        public IActionResult GetBisikletPark()
        {
            var data = _db.BisikletParkKonumlari.ToList();
            return CreateGeoJsonResponse(data, b => new { NITELIK_AD = b.Name });
        }

        [HttpGet("kiralik-bisiklet")]
        public IActionResult GetKiralikBisiklet()
        {
            var data = _db.KiralikBisikletKonumlari.ToList();
            return CreateGeoJsonResponse(data, b => new { NITELIK_AD = b.Name, BOLGE = b.Bolge, PERON_ADET = b.PeronAdet });
        }

        [HttpGet("camiler")]
        public IActionResult GetCamiler()
        {
            var data = _db.Camiler.ToList();
            return CreateGeoJsonResponse(data, c => new { ADI = c.Name });
        }

        [HttpGet("okullar")]
        public IActionResult GetOkullar()
        {
            var data = _db.Okullar.ToList();
            return CreateGeoJsonResponse(data, o => new { ADI = o.Name });
        }

        [HttpGet("saglik-tesisleri")]
        public IActionResult GetSaglikTesisleri()
        {
            var data = _db.SaglikTesisleri.ToList();
            return CreateGeoJsonResponse(data, s => new { ADI = s.Name });
        }

        [HttpGet("toplanma-alanlari")]
        public IActionResult GetToplanmaAlanlari()
        {
            var data = _db.ToplanmaAlanlari.ToList();
            return CreateGeoJsonResponse(data, t => new { ADI = t.Name });
        }

        [HttpGet("eczaneler")]
        public IActionResult GetEczaneler()
        {
            var data = _db.Eczaneler.ToList();
            return CreateGeoJsonResponse(data, e => new { ADI = e.Name });
        }

        [HttpGet("parklar")]
        public IActionResult GetParklar()
        {
            var data = _db.Parklar.ToList();
            return CreateGeoJsonResponse(data, p => new { ADI = p.Name, ILCEADI = p.IlceAdi, UST_NITELIK_ADI = p.UstNitelikAdi });
        }

        [HttpGet("hava-kalite-istasyonlari")]
        public IActionResult GetHavaKaliteIstasyonlari()
        {
            var data = _db.HavaKaliteIstasyon.ToList();
            return CreateGeoJsonResponse(data, h => new { NITELIK_AD = h.Name });
        }

        [HttpGet("kameralar")]
        public IActionResult GetKameralar()
        {
            var data = _db.Kameralar.ToList();
            return CreateGeoJsonResponse(data, k => new { niteliK_AD = k.Name, URL = k.Url });
        }

        [HttpGet("turistik-konumlar")]
        public IActionResult GetTuristikKonumlar()
        {
            var result = new List<TuristikKonumlarDTO>();
            using (var conn = _db.Database.GetDbConnection())
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "SELECT id, tur, isim, icerik, resim, ST_X(geometry) as lon, ST_Y(geometry) as lat FROM turistik_konumlar";
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            result.Add(new TuristikKonumlarDTO
                            {
                                id = reader.GetInt32(0),
                                tur = reader.GetString(1),
                                isim = reader.GetString(2),
                                icerik = reader.IsDBNull(3) ? null : reader.GetString(3),
                                resim = reader.IsDBNull(4) ? null : reader.GetString(4),
                                lon = reader.GetDouble(5),
                                lat = reader.GetDouble(6)
                            });
                        }
                    }
                }
            }
            var features = result.Select(item => new
            {
                type = "Feature",
                properties = new {
                    tur = item.tur,
                    isim = item.isim,
                    icerik = item.icerik,
                    resim = item.resim
                },
                geometry = new {
                    type = "Point",
                    coordinates = new[] { item.lon, item.lat }
                }
            });
            var geoJson = new { type = "FeatureCollection", features = features };
            return new JsonResult(geoJson);
        }

        public class TuristikKonumlarDTO
        {
            public int id { get; set; }
            public string tur { get; set; }
            public string isim { get; set; }
            public string icerik { get; set; }
            public string resim { get; set; }
            public double lon { get; set; }
            public double lat { get; set; }
        }
    }
} 