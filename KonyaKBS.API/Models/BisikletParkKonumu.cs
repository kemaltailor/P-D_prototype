using NetTopologySuite.Geometries;

namespace KonyaKBS.API.Models
{
    public class BisikletParkKonumu
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Point Location { get; set; }
    }
} 