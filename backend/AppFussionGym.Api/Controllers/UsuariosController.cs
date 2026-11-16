using AppFussionGym.Api.Data;
using AppFussionGym.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AppFussionGym.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsuariosController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var usuarios = await _db.Usuarios
            .Include(u => u.PlanEntrenamiento)
            .Include(u => u.Entrenador)
            .OrderByDescending(u => u.FechaRegistro)
            .ToListAsync();

        return Ok(usuarios);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var usuario = await _db.Usuarios
            .Include(u => u.PlanEntrenamiento)
            .Include(u => u.Entrenador)
            .Include(u => u.Rutinas).ThenInclude(r => r.Ejercicios)
            .Include(u => u.Pagos)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (usuario is null) return NotFound(new { message = "Usuario no encontrado." });
        return Ok(usuario);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UsuarioRequest request)
    {
        if (request.EntrenadorId.HasValue && !request.PlanEntrenamientoId.HasValue)
            return BadRequest(new { message = "No se puede asignar entrenador a un usuario sin plan de entrenamiento." });

        var usuario = new Usuario
        {
            Nombre = request.Nombre,
            Email = request.Email,
            Telefono = request.Telefono,
            Estado = request.Estado,
            DiasDisponibles = request.DiasDisponibles,
            PlanEntrenamientoId = request.PlanEntrenamientoId,
            EntrenadorId = request.EntrenadorId
        };

        _db.Usuarios.Add(usuario);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Ya existe un usuario con ese email." });
        }

        return CreatedAtAction(nameof(GetById), new { id = usuario.Id }, usuario);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UsuarioRequest request)
    {
        var usuario = await _db.Usuarios.FindAsync(id);
        if (usuario is null) return NotFound(new { message = "Usuario no encontrado." });

        if (request.EntrenadorId.HasValue && !request.PlanEntrenamientoId.HasValue)
            return BadRequest(new { message = "No se puede asignar entrenador a un usuario sin plan de entrenamiento." });

        usuario.Nombre = request.Nombre;
        usuario.Email = request.Email;
        usuario.Telefono = request.Telefono;
        usuario.Estado = request.Estado;
        usuario.DiasDisponibles = request.DiasDisponibles;
        usuario.PlanEntrenamientoId = request.PlanEntrenamientoId;
        usuario.EntrenadorId = request.EntrenadorId;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Ya existe un usuario con ese email." });
        }

        return Ok(usuario);
    }

    [HttpPost("{id:int}/asignar-entrenador")]
    public async Task<IActionResult> AsignarEntrenador(int id, [FromBody] AsignarEntrenadorRequest request)
    {
        var usuario = await _db.Usuarios.FindAsync(id);
        if (usuario is null) return NotFound(new { message = "Usuario no encontrado." });

        if (!usuario.PlanEntrenamientoId.HasValue)
            return BadRequest(new { message = "El usuario no tiene un plan de entrenamiento asignado." });

        var entrenador = await _db.Entrenadores.FindAsync(request.EntrenadorId);
        if (entrenador is null) return NotFound(new { message = "Entrenador no encontrado." });

        usuario.EntrenadorId = request.EntrenadorId;
        await _db.SaveChangesAsync();

        return Ok(usuario);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var usuario = await _db.Usuarios.FindAsync(id);
        if (usuario is null) return NotFound(new { message = "Usuario no encontrado." });

        _db.Usuarios.Remove(usuario);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
