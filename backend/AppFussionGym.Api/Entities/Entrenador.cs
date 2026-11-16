namespace AppFussionGym.Api.Entities;

public class Entrenador
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? Especialidad { get; set; }

    public List<Usuario> Usuarios { get; set; } = new();
}
