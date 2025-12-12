using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScribeApi.Migrations
{
    /// <inheritdoc />
    public partial class AddUploadSessionAndStrictMediaFile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UploadSessions_MediaFiles_MediaFileId",
                table: "UploadSessions");

            migrationBuilder.DropTable(
                name: "UploadSessionParts");

            migrationBuilder.DropIndex(
                name: "IX_UploadSessions_ExpiresAtUtc",
                table: "UploadSessions");

            migrationBuilder.DropIndex(
                name: "IX_UploadSessions_UserId_Status",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "ContentType",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "DurationSeconds",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "MultipartUploadId",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "ObjectKey",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "OriginalFileName",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "TotalParts",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "ValidationError",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "VersionId",
                table: "UploadSessions");

            migrationBuilder.RenameColumn(
                name: "TotalSizeBytes",
                table: "UploadSessions",
                newName: "SizeBytes");

            migrationBuilder.RenameColumn(
                name: "CompletedAtUtc",
                table: "UploadSessions",
                newName: "UploadedAtUtc");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "UploadSessions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "ETag",
                table: "UploadSessions",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "UploadSessions",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AddColumn<string>(
                name: "BucketName",
                table: "UploadSessions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ClientRequestId",
                table: "UploadSessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CorrelationId",
                table: "UploadSessions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DeclaredContentType",
                table: "UploadSessions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAtUtc",
                table: "UploadSessions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DetectedContainerType",
                table: "UploadSessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DetectedMediaType",
                table: "UploadSessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ErrorMessage",
                table: "UploadSessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "UploadSessions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StorageKey",
                table: "UploadSessions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StorageProvider",
                table: "UploadSessions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UploadId",
                table: "UploadSessions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedFromUploadSessionId",
                table: "MediaFiles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "ETag",
                table: "MediaFiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StorageObjectKey",
                table: "MediaFiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_UploadSessions_UserId",
                table: "UploadSessions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_UploadSessions_MediaFiles_MediaFileId",
                table: "UploadSessions",
                column: "MediaFileId",
                principalTable: "MediaFiles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UploadSessions_MediaFiles_MediaFileId",
                table: "UploadSessions");

            migrationBuilder.DropIndex(
                name: "IX_UploadSessions_UserId",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "BucketName",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "ClientRequestId",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "CorrelationId",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "DeclaredContentType",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "DeletedAtUtc",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "DetectedContainerType",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "DetectedMediaType",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "ErrorMessage",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "StorageKey",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "StorageProvider",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "UploadId",
                table: "UploadSessions");

            migrationBuilder.DropColumn(
                name: "CreatedFromUploadSessionId",
                table: "MediaFiles");

            migrationBuilder.DropColumn(
                name: "ETag",
                table: "MediaFiles");

            migrationBuilder.DropColumn(
                name: "StorageObjectKey",
                table: "MediaFiles");

            migrationBuilder.RenameColumn(
                name: "UploadedAtUtc",
                table: "UploadSessions",
                newName: "CompletedAtUtc");

            migrationBuilder.RenameColumn(
                name: "SizeBytes",
                table: "UploadSessions",
                newName: "TotalSizeBytes");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "UploadSessions",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "ETag",
                table: "UploadSessions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "UploadSessions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<string>(
                name: "ContentType",
                table: "UploadSessions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "DurationSeconds",
                table: "UploadSessions",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MultipartUploadId",
                table: "UploadSessions",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ObjectKey",
                table: "UploadSessions",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OriginalFileName",
                table: "UploadSessions",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TotalParts",
                table: "UploadSessions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ValidationError",
                table: "UploadSessions",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VersionId",
                table: "UploadSessions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "UploadSessionParts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UploadSessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ETag = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PartNumber = table.Column<int>(type: "integer", nullable: false),
                    UploadedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UploadSessionParts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UploadSessionParts_UploadSessions_UploadSessionId",
                        column: x => x.UploadSessionId,
                        principalTable: "UploadSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UploadSessions_ExpiresAtUtc",
                table: "UploadSessions",
                column: "ExpiresAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_UploadSessions_UserId_Status",
                table: "UploadSessions",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_UploadSessionParts_UploadSessionId_PartNumber",
                table: "UploadSessionParts",
                columns: new[] { "UploadSessionId", "PartNumber" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_UploadSessions_MediaFiles_MediaFileId",
                table: "UploadSessions",
                column: "MediaFileId",
                principalTable: "MediaFiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
