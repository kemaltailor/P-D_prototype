using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KonyaKBS.API.Models
{
    public class GeoLocation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Type { get; set; }

        [Required]
        public Geometry Geometry { get; set; }

        public string? Description { get; set; }
        public string? Address { get; set; }
        public Dictionary<string, string> Properties { get; set; } = new();

        [NotMapped]
        public double? Latitude => Geometry is Point point ? point.Y : 
                                 Geometry is Polygon polygon ? polygon.Centroid.Y : null;

        [NotMapped]
        public double? Longitude => Geometry is Point point ? point.X : 
                                  Geometry is Polygon polygon ? polygon.Centroid.X : null;
    }
} 