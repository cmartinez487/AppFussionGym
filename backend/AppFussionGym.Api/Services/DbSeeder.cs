using AppFussionGym.Api.Data;
using AppFussionGym.Api.Entities;
using Microsoft.Extensions.Configuration;

namespace AppFussionGym.Api.Services;

public class DbSeeder
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public DbSeeder(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public void Seed()
    {
        if (!_db.AppUsers.Any())
        {
            var username = _config["Admin:Username"] ?? "admin";
            var password = _config["Admin:Password"] ?? "admin123";

            _db.AppUsers.Add(new AppUser
            {
                Username = username,
                PasswordHash = PasswordHasher.Hash(password),
                Nombre = "Administrador"
            });
        }

        if (!_db.PlanesEntrenamiento.Any())
        {
            _db.PlanesEntrenamiento.AddRange(
                new PlanEntrenamiento
                {
                    Nombre = "Plan Básico",
                    Descripcion = "Acceso a sala de musculación",
                    PrecioMensual = 25.00m
                },
                new PlanEntrenamiento
                {
                    Nombre = "Plan Estándar",
                    Descripcion = "Musculación + clases grupales",
                    PrecioMensual = 40.00m
                },
                new PlanEntrenamiento
                {
                    Nombre = "Plan Premium",
                    Descripcion = "Todo incluido + entrenador personal",
                    PrecioMensual = 60.00m
                });
        }

        if (!_db.Entrenadores.Any())
        {
            _db.Entrenadores.AddRange(
                new Entrenador
                {
                    Nombre = "Carlos Pérez",
                    Email = "carlos@fusiongym.com",
                    Telefono = "3001234567",
                    Especialidad = "Musculación"
                },
                new Entrenador
                {
                    Nombre = "Ana Gómez",
                    Email = "ana@fusiongym.com",
                    Telefono = "3007654321",
                    Especialidad = "Cross Training"
                });
        }

        _db.SaveChanges();
    }
}
