using AppFussionGym.Api.Data;
using AppFussionGym.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AppFussionGym.Api.Controllers;

[ApiController]
[Route("api/entrenadores")]
[Authorize]
public class EntrenadoresController : ControllerBase
{
    private readonly AppDbContext _db;

    public EntrenadoresController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var entrenadores = await _db.Entrenadores
            .OrderBy(t => t.Nombre)
            .ToListAsync();
        return Ok(entrenadores);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var entrenador = await _db.Entrenadores.FindAsync(id);
        if (entrenador is null) return NotFound(new { message = "Entrenador no encontrado." });
        return Ok(entrenador);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EntrenadorRequest request)
    {
        var entrenador = new Entrenador
        {
            Nombre = request.Nombre,
            Email = request.Email,
            Telefono = request.Telefono,
            Especialidad = request.Especialidad
        };

        _db.Entrenadores.Add(entrenador);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = entrenador.Id }, entrenador);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] EntrenadorRequest request)
    {
        var entrenador = await _db.Entrenadores.FindAsync(id);
        if (entrenador is null) return NotFound(new { message = "Entrenador no encontrado." });

        entrenador.Nombre = request.Nombre;
        entrenador.Email = request.Email;
        entrenador.Telefono = request.Telefono;
        entrenador.Especialidad = request.Especialidad;

        await _db.SaveChangesAsync();
        return Ok(entrenador);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entrenador = await _db.Entrenadores.FindAsync(id);
        if (entrenador is null) return NotFound(new { message = "Entrenador no encontrado." });

        _db.Entrenadores.Remove(entrenador);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
