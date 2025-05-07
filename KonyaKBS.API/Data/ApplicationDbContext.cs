using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace KonyaKBS.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<GeoLocation> GeoLocations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<GeoLocation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Type).IsRequired();
                entity.Property(e => e.Geometry).HasColumnType("geometry");
            });
        }
    }

    public class GeoLocation
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public Geometry Geometry { get; set; }
    }
} 