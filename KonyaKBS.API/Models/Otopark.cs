using NetTopologySuite.Geometries;

namespace KonyaKBS.API.Models
{
    public class Otopark
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Kapasite { get; set; }
        public int Doluluk { get; set; }
        public Point Location { get; set; }
    }
} 