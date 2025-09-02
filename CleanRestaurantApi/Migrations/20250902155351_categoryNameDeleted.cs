using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CleanRestaurantApi.Migrations
{
    /// <inheritdoc />
    public partial class categoryNameDeleted : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CategoryName",
                table: "Dish");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CategoryName",
                table: "Dish",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
