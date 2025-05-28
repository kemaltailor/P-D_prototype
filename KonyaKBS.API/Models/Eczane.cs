using NetTopologySuite.Geometries;

namespace KonyaKBS.API.Models
{
    public class Eczane
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Point Location { get; set; }
    }
} 