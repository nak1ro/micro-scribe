using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using ScribeApi.Infrastructure.Persistence.Entities;

#nullable disable

namespace ScribeApi.Migrations
{
    /// <inheritdoc />
    public partial class UseJSONB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TranscriptSegments");

            migrationBuilder.AddColumn<List<TranscriptSegment>>(
                name: "Segments",
                table: "TranscriptionJobs",
                type: "jsonb",
                nullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Segments",
                table: "TranscriptionJobs");

            migrationBuilder.CreateTable(
                name: "TranscriptSegments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TranscriptionJobId = table.Column<Guid>(type: "uuid", nullable: false),
                    EndSeconds = table.Column<double>(type: "double precision", nullable: false),
                    IsEdited = table.Column<bool>(type: "boolean", nullable: false),
                    LastEditedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    OriginalText = table.Column<string>(type: "text", nullable: true),
                    Speaker = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    StartSeconds = table.Column<double>(type: "double precision", nullable: false),
                    Text = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TranscriptSegments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TranscriptSegments_TranscriptionJobs_TranscriptionJobId",
                        column: x => x.TranscriptionJobId,
                        principalTable: "TranscriptionJobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TranscriptSegments_TranscriptionJobId_Order",
                table: "TranscriptSegments",
                columns: new[] { "TranscriptionJobId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_TranscriptSegments_TranscriptionJobId_StartSeconds",
                table: "TranscriptSegments",
                columns: new[] { "TranscriptionJobId", "StartSeconds" });
        }
    }
}
