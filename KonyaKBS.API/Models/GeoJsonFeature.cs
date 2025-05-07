using System.Text.Json.Serialization;

namespace KonyaKBS.API.Models;

public class GeoJsonFeature
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "Feature";

    [JsonPropertyName("geometry")]
    public GeoJsonGeometry Geometry { get; set; }

    [JsonPropertyName("properties")]
    public Dictionary<string, object> Properties { get; set; }
}

public class GeoJsonGeometry
{
    [JsonPropertyName("type")]
    public string Type { get; set; }

    [JsonPropertyName("coordinates")]
    public double[] Coordinates { get; set; }
}

public class GeoJsonFeatureCollection
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "FeatureCollection";

    [JsonPropertyName("features")]
    public List<GeoJsonFeature> Features { get; set; }
} 