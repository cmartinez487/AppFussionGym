namespace AppFussionGym.Api.Entities;

public class PlanEntrenamiento
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal PrecioMensual { get; set; }
    public bool Activo { get; set; } = true;

    public List<Usuario> Usuarios { get; set; } = new();
}
