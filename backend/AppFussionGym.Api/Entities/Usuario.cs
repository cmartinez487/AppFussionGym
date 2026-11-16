using AppFussionGym.Api.Enums;

namespace AppFussionGym.Api.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    public EstadoUsuario Estado { get; set; } = EstadoUsuario.Activo;
    public int DiasDisponibles { get; set; }

    public int? PlanEntrenamientoId { get; set; }
    public PlanEntrenamiento? PlanEntrenamiento { get; set; }

    public int? EntrenadorId { get; set; }
    public Entrenador? Entrenador { get; set; }

    public List<Rutina> Rutinas { get; set; } = new();
    public List<Pago> Pagos { get; set; } = new();
}
