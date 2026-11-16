using AppFussionGym.Api.Data;
using AppFussionGym.Api.Enums;

namespace AppFussionGym.Api.Services;

public class EstadosService
{
    private readonly AppDbContext _db;
    private readonly ILogger<EstadosService> _logger;

    public EstadosService(AppDbContext db, ILogger<EstadosService> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Decrementa en 1 los días disponibles de los usuarios activos.
    /// Cuando llegan a 0, cambian su estado a "EnMora".
    /// </summary>
    public async Task<int> AplicarDecrementoDiarioAsync()
    {
        var activos = _db.Usuarios.Where(u => u.Estado == EstadoUsuario.Activo).ToList();
        var pasadosAMora = 0;

        foreach (var usuario in activos)
        {
            usuario.DiasDisponibles = Math.Max(0, usuario.DiasDisponibles - 1);
            if (usuario.DiasDisponibles == 0)
            {
                usuario.Estado = EstadoUsuario.EnMora;
                pasadosAMora++;
            }
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Decremento diario aplicado. Usuarios pasados a mora: {Cantidad}", pasadosAMora);
        return pasadosAMora;
    }
}
