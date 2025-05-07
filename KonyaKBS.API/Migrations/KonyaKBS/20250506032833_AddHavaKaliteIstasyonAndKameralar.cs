using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace KonyaKBS.API.Migrations.KonyaKBS
{
    /// <inheritdoc />
    public partial class AddHavaKaliteIstasyonAndKameralar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HavaKaliteIstasyonlari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<Point>(type: "geometry(Point, 4326)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HavaKaliteIstasyonlari", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Kameralar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<Point>(type: "geometry(Point, 4326)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Kameralar", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HavaKaliteIstasyonlari");

            migrationBuilder.DropTable(
                name: "Kameralar");
        }
    }
}
