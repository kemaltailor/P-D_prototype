using NetTopologySuite.Geometries;

namespace KonyaKBS.API.Models
{
    public class KiralikBisikletKonumu
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Bolge { get; set; }
        public int PeronAdet { get; set; }
        public Point Location { get; set; }
    }
} 