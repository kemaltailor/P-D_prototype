using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace KonyaKBS.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminUsersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admin_users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_admin_users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "admin_users",
                columns: new[] { "Id", "CreatedAt", "PasswordHash", "Username" },
                values: new object[] { 1, new DateTime(2025, 5, 11, 14, 1, 10, 465, DateTimeKind.Utc).AddTicks(1270), "$2a$11$iZHRBRJDvuOGu./wecCqUe35YN9cFQJVtPfJaFuhuWck5/FnxJxVa", "admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_users");
        }
    }
}
