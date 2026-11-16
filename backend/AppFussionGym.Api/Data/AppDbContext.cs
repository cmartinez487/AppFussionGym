using AppFussionGym.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace AppFussionGym.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<PlanEntrenamiento> PlanesEntrenamiento => Set<PlanEntrenamiento>();
    public DbSet<Entrenador> Entrenadores => Set<Entrenador>();
    public DbSet<Rutina> Rutinas => Set<Rutina>();
    public DbSet<Ejercicio> Ejercicios => Set<Ejercicio>();
    public DbSet<Pago> Pagos => Set<Pago>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Nombre).HasMaxLength(120).IsRequired();
            e.Property(u => u.Email).HasMaxLength(120).IsRequired();

            e.HasOne(u => u.PlanEntrenamiento)
                .WithMany(p => p.Usuarios)
                .HasForeignKey(u => u.PlanEntrenamientoId)
                .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(u => u.Entrenador)
                .WithMany(t => t.Usuarios)
                .HasForeignKey(u => u.EntrenadorId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PlanEntrenamiento>(e =>
        {
            e.Property(p => p.Nombre).HasMaxLength(120).IsRequired();
            e.Property(p => p.PrecioMensual).HasPrecision(10, 2);
        });

        modelBuilder.Entity<Entrenador>(e =>
        {
            e.Property(t => t.Nombre).HasMaxLength(120).IsRequired();
            e.Property(t => t.Email).HasMaxLength(120).IsRequired();
        });

        modelBuilder.Entity<Rutina>(e =>
        {
            e.HasOne(r => r.Usuario)
                .WithMany(u => u.Rutinas)
                .HasForeignKey(r => r.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Ejercicio>(e =>
        {
            e.HasOne(x => x.Rutina)
                .WithMany(r => r.Ejercicios)
                .HasForeignKey(x => x.RutinaId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Property(x => x.Peso).HasPrecision(6, 2);
        });

        modelBuilder.Entity<Pago>(e =>
        {
            e.HasOne(p => p.Usuario)
                .WithMany(u => u.Pagos)
                .HasForeignKey(p => p.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            e.Property(p => p.Monto).HasPrecision(10, 2);
        });

        modelBuilder.Entity<AppUser>(e =>
        {
            e.HasIndex(a => a.Username).IsUnique();
            e.Property(a => a.Username).HasMaxLength(60).IsRequired();
        });
    }
}
