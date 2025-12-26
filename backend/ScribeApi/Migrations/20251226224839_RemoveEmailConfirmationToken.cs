using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScribeApi.Migrations
{
    /// <inheritdoc />
    public partial class RemoveEmailConfirmationToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailConfirmationToken",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailConfirmationToken",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }
    }
}
