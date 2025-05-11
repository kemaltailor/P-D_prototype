using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using KonyaKBS.API.Models;

namespace KonyaKBS.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<GeoLocation> GeoLocations { get; set; }
        public DbSet<AdminUser> AdminUsers { get; set; }

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

            modelBuilder.Entity<AdminUser>(entity =>
            {
                entity.ToTable("admin_users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired();
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
            });

            // Admin kullanıcısı için seed data
            modelBuilder.Entity<AdminUser>().HasData(
                new AdminUser
                {
                    Id = 1,
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    CreatedAt = DateTime.UtcNow
                }
            );
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