using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScribeApi.Migrations
{
    /// <inheritdoc />
    public partial class RenameAnalysisToJob : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TranscriptionAnalyses");

            migrationBuilder.CreateTable(
                name: "ProcessedStripeEvents",
                columns: table => new
                {
                    EventId = table.Column<string>(type: "text", nullable: false),
                    EventType = table.Column<string>(type: "text", nullable: false),
                    ProcessedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessedStripeEvents", x => x.EventId);
                });

            migrationBuilder.CreateTable(
                name: "TranscriptionAnalysisJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TranscriptionJobId = table.Column<Guid>(type: "uuid", nullable: false),
                    AnalysisType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: true),
                    Translations = table.Column<Dictionary<string, string>>(type: "jsonb", nullable: false),
                    ModelUsed = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TranscriptionAnalysisJobs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TranscriptionAnalysisJobs_TranscriptionJobs_TranscriptionJo~",
                        column: x => x.TranscriptionJobId,
                        principalTable: "TranscriptionJobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcessedStripeEvents_ProcessedAtUtc",
                table: "ProcessedStripeEvents",
                column: "ProcessedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_TranscriptionAnalysisJobs_TranscriptionJobId_AnalysisType",
                table: "TranscriptionAnalysisJobs",
                columns: new[] { "TranscriptionJobId", "AnalysisType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProcessedStripeEvents");

            migrationBuilder.DropTable(
                name: "TranscriptionAnalysisJobs");

            migrationBuilder.CreateTable(
                name: "TranscriptionAnalyses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TranscriptionJobId = table.Column<Guid>(type: "uuid", nullable: false),
                    AnalysisType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModelUsed = table.Column<string>(type: "text", nullable: true),
                    Translations = table.Column<Dictionary<string, string>>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TranscriptionAnalyses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TranscriptionAnalyses_TranscriptionJobs_TranscriptionJobId",
                        column: x => x.TranscriptionJobId,
                        principalTable: "TranscriptionJobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TranscriptionAnalyses_TranscriptionJobId_AnalysisType",
                table: "TranscriptionAnalyses",
                columns: new[] { "TranscriptionJobId", "AnalysisType" },
                unique: true);
        }
    }
}
