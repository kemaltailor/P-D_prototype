using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using KonyaKBS.API.Models;

namespace KonyaKBS.API.Data
{
    public class KonyaKBSContext : DbContext
    {
        public KonyaKBSContext(DbContextOptions<KonyaKBSContext> options) : base(options) { }

        public DbSet<Cami> Camiler { get; set; }
        public DbSet<Okul> Okullar { get; set; }
        public DbSet<SaglikTesisi> SaglikTesisleri { get; set; }
        public DbSet<ToplanmaAlani> ToplanmaAlanlari { get; set; }
        public DbSet<Eczane> Eczaneler { get; set; }
        public DbSet<Park> Parklar { get; set; }
        public DbSet<Otopark> Otoparklar { get; set; }
        public DbSet<TatliSuCesmesi> TatliSuCesmeleri { get; set; }
        public DbSet<BisikletParkKonumu> BisikletParkKonumlari { get; set; }
        public DbSet<KiralikBisikletKonumu> KiralikBisikletKonumlari { get; set; }
        public DbSet<HavaKaliteIstasyon> HavaKaliteIstasyon { get; set; }
        public DbSet<Kamera> Kameralar { get; set; }
        public DbSet<HavaKaliteGunlukOrtalama> HavaKaliteGunlukOrtalamalar { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Cami>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
            });

            modelBuilder.Entity<Okul>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
            });

            modelBuilder.Entity<SaglikTesisi>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
            });

            modelBuilder.Entity<ToplanmaAlani>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
            });

            modelBuilder.Entity<Eczane>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
            });

            modelBuilder.Entity<Park>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
                entity.Property(e => e.IlceAdi).IsRequired();
                entity.Property(e => e.UstNitelikAdi).IsRequired();
            });

            modelBuilder.Entity<Otopark>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
            });

            modelBuilder.Entity<TatliSuCesmesi>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
            });

            modelBuilder.Entity<BisikletParkKonumu>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
            });

            modelBuilder.Entity<KiralikBisikletKonumu>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Bolge).IsRequired();
                entity.Property(e => e.PeronAdet).IsRequired();
                entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
            });

            modelBuilder.Entity<HavaKaliteIstasyon>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
            });

            modelBuilder.Entity<Kamera>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Location).HasColumnType("geometry(Point, 4326)");
            });

            modelBuilder.Entity<HavaKaliteGunlukOrtalama>(entity =>
            {
                entity.HasNoKey();
                entity.Property(e => e.no).HasColumnType("double precision");
                entity.Property(e => e.no2).HasColumnType("double precision");
                entity.Property(e => e.nox).HasColumnType("double precision");
                entity.Property(e => e.pm10).HasColumnType("double precision");
            });
        }
    }
} 