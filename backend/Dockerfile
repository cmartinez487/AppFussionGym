# Etapa de compilación
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["AppFussionGym.Api/AppFussionGym.Api.csproj", "AppFussionGym.Api/"]
RUN dotnet restore "AppFussionGym.Api/AppFussionGym.Api.csproj"

COPY . .
WORKDIR "/src/AppFussionGym.Api"
RUN dotnet publish "AppFussionGym.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa de ejecución
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AppFussionGym.Api.dll"]
