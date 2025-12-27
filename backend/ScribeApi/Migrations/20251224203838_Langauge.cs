using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using ScribeApi.Infrastructure.Persistence.Entities;

#nullable disable

namespace ScribeApi.Migrations
{
    /// <inheritdoc />
    public partial class Langauge : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LanguageCode",
                table: "TranscriptionJobs",
                newName: "SourceLanguage");

            migrationBuilder.AddColumn<bool>(
                name: "EnableSpeakerDiarization",
                table: "TranscriptionJobs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<List<TranscriptionSpeaker>>(
                name: "Speakers",
                table: "TranscriptionJobs",
                type: "jsonb",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "TargetLanguage",
                table: "TranscriptionJobs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EnableSpeakerDiarization",
                table: "TranscriptionJobs");

            migrationBuilder.DropColumn(
                name: "Speakers",
                table: "TranscriptionJobs");

            migrationBuilder.DropColumn(
                name: "TargetLanguage",
                table: "TranscriptionJobs");

            migrationBuilder.RenameColumn(
                name: "SourceLanguage",
                table: "TranscriptionJobs",
                newName: "LanguageCode");
        }
    }
}
