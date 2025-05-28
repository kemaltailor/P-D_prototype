using NetTopologySuite.Geometries;

namespace KonyaKBS.API.Models
{
    public class Park
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Point Location { get; set; }
        public string IlceAdi { get; set; }
        public string UstNitelikAdi { get; set; }
    }
} 