using AppFussionGym.Api.Data;
using AppFussionGym.Api.Entities;
using AppFussionGym.Api.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AppFussionGym.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class PagosController : ControllerBase
{
    private readonly AppDbContext _db;

    public PagosController(AppDbContext db) => _db = db;

    [HttpGet("pagos")]
    public async Task<IActionResult> GetAll()
    {
        var pagos = await _db.Pagos
            .Include(p => p.Usuario)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();

        return Ok(pagos);
    }

    [HttpGet("usuarios/{usuarioId:int}/pagos")]
    public async Task<IActionResult> GetByUsuario(int usuarioId)
    {
        var pagos = await _db.Pagos
            .Where(p => p.UsuarioId == usuarioId)
            .OrderByDescending(p => p.FechaPago)
            .ToListAsync();

        return Ok(pagos);
    }

    [HttpPost("usuarios/{usuarioId:int}/pagos")]
    public async Task<IActionResult> RegistrarPago(int usuarioId, [FromBody] PagoRequest request)
    {
        var usuario = await _db.Usuarios.FindAsync(usuarioId);
        if (usuario is null) return NotFound(new { message = "Usuario no encontrado." });

        var dias = request.DiasAgregados > 0 ? request.DiasAgregados : 30;

        var pago = new Pago
        {
            UsuarioId = usuarioId,
            Monto = request.Monto,
            MetodoPago = request.MetodoPago,
            DiasAgregados = dias,
            Periodo = request.Periodo,
            FechaPago = request.FechaPago ?? DateTime.UtcNow
        };

        _db.Pagos.Add(pago);

        usuario.DiasDisponibles += dias;
        if (usuario.Estado == EstadoUsuario.EnMora)
            usuario.Estado = EstadoUsuario.Activo;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            pago,
            diasDisponibles = usuario.DiasDisponibles,
            estado = usuario.Estado
        });
    }
}
