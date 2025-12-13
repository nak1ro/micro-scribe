using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScribeApi.Migrations
{
    /// <inheritdoc />
    public partial class UseXminConcurrency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "UploadSessions");

            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "UploadSessions",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "xmin",
                table: "UploadSessions");

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "UploadSessions",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);
        }
    }
}
