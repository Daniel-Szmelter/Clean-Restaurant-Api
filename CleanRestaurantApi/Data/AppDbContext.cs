using CleanRestaurantApi.Data;
using CleanRestaurantApi.Entities;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Linq.Expressions;
using System.Security.Claims;

namespace CleanRestaurantAPI.Data
{
    public class AppDbContext : DbContext
    {

        private string _connectionString =
    "Server=(localdb)\\mssqllocaldb;Database=CleanRestaurantDb;Trusted_Connection=True;";

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Category> Category => Set<Category>();
        public DbSet<Dish> Dish => Set<Dish>();
        public DbSet<User> User => Set<User>();
        public DbSet<Restaurant> Restaurant => Set<Restaurant>();
        public DbSet<Role> Role => Set<Role>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(AuditableEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType).Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime")
                        .IsRequired();

                    modelBuilder.Entity(entityType.ClrType).Property<DateTime?>("UpdatedAt")
                        .HasColumnType("datetime")
                        .IsRequired(false);
                }
            }

            // 🔥 Dodaj konfigurację relacji
            modelBuilder.Entity<Dish>()
                .HasOne(d => d.Category)
                .WithMany() // jeśli kategoria nie ma kolekcji Dish
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Precyzja dla ceny
            modelBuilder.Entity<Dish>()
                .Property(d => d.Price)
                .HasPrecision(10, 2);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(_connectionString);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is AuditableEntity &&
                            (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                var entity = (AuditableEntity)entityEntry.Entity;

                if (entityEntry.State == EntityState.Added)
                {
                    entity.CreatedAt = DateTime.UtcNow;
                }
                else
                {
                    entity.UpdatedAt = DateTime.UtcNow;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}


