using AppFussionGym.Api.Enums;

namespace AppFussionGym.Api.Entities;

public class Pago
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }
    public decimal Monto { get; set; }
    public DateTime FechaPago { get; set; } = DateTime.UtcNow;
    public MetodoPago MetodoPago { get; set; }
    public int DiasAgregados { get; set; } = 30;
    public string? Periodo { get; set; }
}
