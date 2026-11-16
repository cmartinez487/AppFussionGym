using AppFussionGym.Api.Data;
using AppFussionGym.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AppFussionGym.Api.Controllers;

[ApiController]
[Route("api/planes-entrenamiento")]
[Authorize]
public class PlanesEntrenamientoController : ControllerBase
{
    private readonly AppDbContext _db;

    public PlanesEntrenamientoController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var planes = await _db.PlanesEntrenamiento
            .OrderBy(p => p.Nombre)
            .ToListAsync();
        return Ok(planes);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var plan = await _db.PlanesEntrenamiento.FindAsync(id);
        if (plan is null) return NotFound(new { message = "Plan no encontrado." });
        return Ok(plan);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PlanRequest request)
    {
        var plan = new PlanEntrenamiento
        {
            Nombre = request.Nombre,
            Descripcion = request.Descripcion,
            PrecioMensual = request.PrecioMensual,
            Activo = request.Activo
        };

        _db.PlanesEntrenamiento.Add(plan);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = plan.Id }, plan);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PlanRequest request)
    {
        var plan = await _db.PlanesEntrenamiento.FindAsync(id);
        if (plan is null) return NotFound(new { message = "Plan no encontrado." });

        plan.Nombre = request.Nombre;
        plan.Descripcion = request.Descripcion;
        plan.PrecioMensual = request.PrecioMensual;
        plan.Activo = request.Activo;

        await _db.SaveChangesAsync();
        return Ok(plan);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var plan = await _db.PlanesEntrenamiento.FindAsync(id);
        if (plan is null) return NotFound(new { message = "Plan no encontrado." });

        _db.PlanesEntrenamiento.Remove(plan);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
