namespace AppFussionGym.Api.Services;

/// <summary>
/// Trabajo en segundo plano que ejecuta el decremento de días cada 24 horas.
/// </summary>
public class DailyStatusService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DailyStatusService> _logger;

    public DailyStatusService(IServiceScopeFactory scopeFactory, ILogger<DailyStatusService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Primera ejecución a las 24 horas; luego cada 24 horas.
        await Task.Delay(TimeSpan.FromHours(24), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<EstadosService>();
                await service.AplicarDecrementoDiarioAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al aplicar el decremento diario de días.");
            }

            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
