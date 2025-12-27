FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

# Make sure the container listens on the port your host expects
ENV ASPNETCORE_URLS=http://+:8080

# Optional but recommended in some environments
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

EXPOSE 8080

# Use non-root (good practice). If you ever hit permission issues, revisit this.
USER app

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
