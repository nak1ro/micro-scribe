using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScribeApi.Migrations
{
    /// <inheritdoc />
    public partial class ChangePlan1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TargetLanguage",
                table: "TranscriptionJobs",
                newName: "TranslationStatus");

            migrationBuilder.AddColumn<string>(
                name: "ProcessingStep",
                table: "TranscriptionJobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TranslatingToLanguage",
                table: "TranscriptionJobs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProcessingStep",
                table: "TranscriptionJobs");

            migrationBuilder.DropColumn(
                name: "TranslatingToLanguage",
                table: "TranscriptionJobs");

            migrationBuilder.RenameColumn(
                name: "TranslationStatus",
                table: "TranscriptionJobs",
                newName: "TargetLanguage");
        }
    }
}
