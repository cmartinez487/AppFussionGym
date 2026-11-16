using AppFussionGym.Api.Enums;

namespace AppFussionGym.Api;

public record LoginRequest(string Username, string Password);

public record UsuarioRequest(
    string Nombre,
    string Email,
    string? Telefono,
    EstadoUsuario Estado = EstadoUsuario.Activo,
    int DiasDisponibles = 0,
    int? PlanEntrenamientoId = null,
    int? EntrenadorId = null);

public record AsignarEntrenadorRequest(int EntrenadorId);

public record PlanRequest(string Nombre, string? Descripcion, decimal PrecioMensual, bool Activo = true);

public record EntrenadorRequest(string Nombre, string Email, string? Telefono, string? Especialidad);

public record EjercicioRequest(string Nombre, int Series, int Repeticiones, decimal? Peso, string? Notas);

public record RutinaRequest(string Nombre, string? Descripcion, List<EjercicioRequest> Ejercicios);

public record PagoRequest(
    decimal Monto,
    MetodoPago MetodoPago,
    int DiasAgregados = 30,
    string? Periodo = null,
    DateTime? FechaPago = null);
