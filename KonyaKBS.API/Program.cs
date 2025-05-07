using Microsoft.EntityFrameworkCore;
using KonyaKBS.API.Data;
using NetTopologySuite.IO;
using NetTopologySuite.Geometries;
using NetTopologySuite;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.UseNetTopologySuite()));

builder.Services.AddDbContext<KonyaKBSContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.UseNetTopologySuite()));

builder.Services.AddControllers();

// NetTopologySuite servislerinin eklenmesi
builder.Services.AddSingleton(NtsGeometryServices.Instance);
builder.Services.AddSingleton<GeoJsonReader>();
builder.Services.AddSingleton<GeoJsonWriter>();

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

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
