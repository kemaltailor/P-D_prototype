using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KonyaKBS.API.Migrations.KonyaKBS
{
    /// <inheritdoc />
    public partial class AddIlceAdiUstNitelikAdiToPark : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IlceAdi",
                table: "Parklar",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UstNitelikAdi",
                table: "Parklar",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IlceAdi",
                table: "Parklar");

            migrationBuilder.DropColumn(
                name: "UstNitelikAdi",
                table: "Parklar");
        }
    }
}
