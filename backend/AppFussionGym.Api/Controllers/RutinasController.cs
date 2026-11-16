using AppFussionGym.Api.Data;
using AppFussionGym.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AppFussionGym.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class RutinasController : ControllerBase
{
    private readonly AppDbContext _db;

    public RutinasController(AppDbContext db) => _db = db;

    [HttpGet("usuarios/{usuarioId:int}/rutinas")]
    public async Task<IActionResult> GetByUsuario(int usuarioId)
    {
        var rutinas = await _db.Rutinas
            .Include(r => r.Ejercicios)
            .Where(r => r.UsuarioId == usuarioId)
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync();

        return Ok(rutinas);
    }

    [HttpGet("rutinas/{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var rutina = await _db.Rutinas
            .Include(r => r.Ejercicios)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rutina is null) return NotFound(new { message = "Rutina no encontrada." });
        return Ok(rutina);
    }

    [HttpPost("usuarios/{usuarioId:int}/rutinas")]
    public async Task<IActionResult> Create(int usuarioId, [FromBody] RutinaRequest request)
    {
        var usuario = await _db.Usuarios.FindAsync(usuarioId);
        if (usuario is null) return NotFound(new { message = "Usuario no encontrado." });

        var rutina = new Rutina
        {
            UsuarioId = usuarioId,
            Nombre = request.Nombre,
            Descripcion = request.Descripcion,
            Ejercicios = request.Ejercicios.Select(e => new Ejercicio
            {
                Nombre = e.Nombre,
                Series = e.Series,
                Repeticiones = e.Repeticiones,
                Peso = e.Peso,
                Notas = e.Notas
            }).ToList()
        };

        _db.Rutinas.Add(rutina);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = rutina.Id }, rutina);
    }

    [HttpPut("rutinas/{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] RutinaRequest request)
    {
        var rutina = await _db.Rutinas
            .Include(r => r.Ejercicios)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rutina is null) return NotFound(new { message = "Rutina no encontrada." });

        rutina.Nombre = request.Nombre;
        rutina.Descripcion = request.Descripcion;

        _db.Ejercicios.RemoveRange(rutina.Ejercicios);
        rutina.Ejercicios = request.Ejercicios.Select(e => new Ejercicio
        {
            Nombre = e.Nombre,
            Series = e.Series,
            Repeticiones = e.Repeticiones,
            Peso = e.Peso,
            Notas = e.Notas
        }).ToList();

        await _db.SaveChangesAsync();
        return Ok(rutina);
    }

    [HttpDelete("rutinas/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var rutina = await _db.Rutinas.FindAsync(id);
        if (rutina is null) return NotFound(new { message = "Rutina no encontrada." });

        _db.Rutinas.Remove(rutina);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
