using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScribeApi.Migrations
{
    /// <inheritdoc />
    public partial class AddLastEditedAtToTranscriptionJob : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastEditedAtUtc",
                table: "TranscriptionJobs",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastEditedAtUtc",
                table: "TranscriptionJobs");
        }
    }
}
