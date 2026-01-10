FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

# Make sure the container listens on the port your host expects
ENV ASPNETCORE_URLS=http://+:8080

# Optional but recommended in some environments
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

EXPOSE 8080

# Install FFmpeg (required for media processing)
# Install FFmpeg (media processing) and curl (health check)
USER root
RUN apt-get update && \
    apt-get install -y ffmpeg curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Use non-root user (security best practice)
USER app

# Container self-health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["ScribeApi.csproj", "./"]
RUN dotnet restore "ScribeApi.csproj"

COPY . .
RUN dotnet build "ScribeApi.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "ScribeApi.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ScribeApi.dll"]
