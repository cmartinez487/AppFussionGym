using AppFussionGym.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppFussionGym.Api.Controllers;

[ApiController]
[Route("api/mantenimiento")]
[Authorize]
public class MantenimientoController : ControllerBase
{
    private readonly EstadosService _estadosService;

    public MantenimientoController(EstadosService estadosService) => _estadosService = estadosService;

    /// <summary>
    /// Ejecuta manualmente el decremento de días (útil para pruebas/demo).
    /// </summary>
    [HttpPost("decrementar-dias")]
    public async Task<IActionResult> DecrementarDias()
    {
        var pasadosAMora = await _estadosService.AplicarDecrementoDiarioAsync();
        return Ok(new { usuariosPasadosAMora = pasadosAMora });
    }
}
