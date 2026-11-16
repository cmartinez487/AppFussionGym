namespace AppFussionGym.Api.Entities;

public class Rutina
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public List<Ejercicio> Ejercicios { get; set; } = new();
}
