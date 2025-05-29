using NetTopologySuite.Geometries;

namespace KonyaKBS.API.Models
{
    public class HatGuzergah
    {
        public int id { get; set; }
        public int hat_no { get; set; }
        public Point geometry { get; set; }
    }
} 