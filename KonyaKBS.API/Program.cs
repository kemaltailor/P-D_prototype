using Microsoft.EntityFrameworkCore;
using KonyaKBS.API.Data;
using NetTopologySuite.IO;
using NetTopologySuite.Geometries;
using NetTopologySuite;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// CORS politikasını ekle
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "park-et_devam-et_map",
        Version = "v1",
        Description = "Kent Bilgi Sistemi tabanlı indeks haritası oluşturabilen ve park-et devam-et projesi için kullanılabilecek bir GIS prototipi.",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Kemal Terzi",
            Email = "terzikemal8@gmail.com"
        }
    });
});

// PostgreSQL ve PostGIS için DbContext yapılandırması
builder.Services.AddDbContext<KonyaKBSContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.UseNetTopologySuite()));

// NetTopologySuite servislerinin eklenmesi
builder.Services.AddSingleton(NtsGeometryServices.Instance);
builder.Services.AddSingleton<GeoJsonReader>();
builder.Services.AddSingleton<GeoJsonWriter>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS middleware'ini en başta ekle
app.UseCors();

// Sadece production ortamında HTTPS yönlendirmesi yap
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapControllers();

app.Run();
