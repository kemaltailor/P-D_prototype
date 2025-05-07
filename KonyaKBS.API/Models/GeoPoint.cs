namespace KonyaKBS.API.Models
{
    public class GeoPoint
    {
        public string Name { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Type { get; set; } = string.Empty;
    }
}
