using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace KonyaKBS.API.Migrations.KonyaKBS
{
    /// <inheritdoc />
    public partial class AddPointTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BisikletIstasyonlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<Point>(type: "geometry(Point, 4326)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BisikletIstasyonlari", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Otoparklar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<Point>(type: "geometry(Point, 4326)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Otoparklar", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Parklar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<Point>(type: "geometry(Point, 4326)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parklar", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TatliSuCesmeleri",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<Point>(type: "geometry(Point, 4326)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TatliSuCesmeleri", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BisikletIstasyonlari");

            migrationBuilder.DropTable(
                name: "Otoparklar");

            migrationBuilder.DropTable(
                name: "Parklar");

            migrationBuilder.DropTable(
                name: "TatliSuCesmeleri");
        }
    }
}
