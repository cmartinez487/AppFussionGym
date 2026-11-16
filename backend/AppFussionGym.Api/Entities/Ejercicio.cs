namespace AppFussionGym.Api.Entities;

public class Ejercicio
{
    public int Id { get; set; }
    public int RutinaId { get; set; }
    public Rutina? Rutina { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int Series { get; set; }
    public int Repeticiones { get; set; }
    public decimal? Peso { get; set; }
    public string? Notas { get; set; }
}
