using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KonyaKBS.API.Migrations.KonyaKBS
{
    /// <inheritdoc />
    public partial class UpdatePointEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Doluluk",
                table: "Otoparklar",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Kapasite",
                table: "Otoparklar",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Doluluk",
                table: "Otoparklar");

            migrationBuilder.DropColumn(
                name: "Kapasite",
                table: "Otoparklar");
        }
    }
}
