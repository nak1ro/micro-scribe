using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScribeApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTranslatedLanguages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<string>>(
                name: "TranslatedLanguages",
                table: "TranscriptionJobs",
                type: "jsonb",
                defaultValueSql: "'[]'",
                nullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TranslatedLanguages",
                table: "TranscriptionJobs");
        }
    }
}
