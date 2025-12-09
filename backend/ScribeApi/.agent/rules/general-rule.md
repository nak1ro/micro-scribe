---
trigger: always_on
---

# ScribeApi Cursor Rules


## Project Structure

### Folder Organization
```
ScribeApi/
├── Api/                  # Controllers, middleware, filters, DI extensions
├── Features/             # Feature-based vertical slices (controllers, services, DTOs, validators)
├── Infrastructure/       # Persistence, external services, background jobs
├── Common/              # Shared utilities, configurations, interfaces
├── Migrations/          # EF Core migrations
├── Program.cs
└── appsettings.json
```

### Layer Responsibilities
- **Api**: HTTP concerns, middleware, filters, service registration
- **Features**: Business logic organized by feature (vertical slices)
- **Infrastructure**: Data access, external integrations, background processing
- **Common**: Cross-cutting utilities, shared interfaces, exceptions

## Architectural Principles

### 1. Vertical Slice Architecture (Features)
- Group related functionality by feature, not by technical layer
- Each feature should at least contain:
  - Controller (API endpoints)
  - Service (business logic)
  - DTOs (request/response models)
  - Validators (input validation)
- Feature folders should be self-contained and cohesive

Example structure:
```
Features/
├── Transcription/
│   ├── TranscriptionController.cs
│   ├── TranscriptionService.cs
│   ├── TranscriptionDto.cs
│   └── TranscriptionValidator.cs
```

### 2. Dependency Flow
- **Api** → **Features** → **Infrastructure** → **Common**
- Never reverse dependencies (e.g., Infrastructure should not depend on Features)
- Use dependency injection for all cross-layer dependencies
- Features should depend on Infrastructure through interfaces in Common

### 3. Direct DbContext Usage
- **DO** inject `AppDbContext` directly into services
- **DO NOT** create repository abstractions or Unit of Work patterns
- Use DbContext transaction methods when needed
- Keep data access logic in service methods or extract to private methods

## Coding Standards

### Function Size & Complexity
- **Maximum 60 lines** per method (excluding whitespace and braces)
- **Maximum 3 levels** of nesting (if/for/while)
- If a method exceeds these limits, extract to private methods
- Each method should have a single, clear responsibility

### Async/Await Conventions
- **ALWAYS** use async/await for I/O operations (database, HTTP, file system)
- Suffix async methods with `Async` (e.g., `GetUserAsync`)
- Use `ConfigureAwait(false)` in library code, not in controllers
- Never use `.Result` or `.Wait()` - always await

```csharp
// ✅ GOOD
public async Task<User> GetUserAsync(int id, CancellationToken ct)
{
    return await _context.Users.FindAsync(id, ct);
}

// ❌ BAD
public User GetUser(int id)
{
    return _context.Users.Find(id); // Should be async
}
```

### Null Handling
- **Enable nullable reference types** in all projects
- Use `?` for nullable types explicitly
- Check for null before use or use null-coalescing operators
- Avoid returning null from methods; prefer empty collections or Result patterns

```csharp
// ✅ GOOD
public async Task<User?> FindUserAsync(int id)
{
    return await _context.Users.FindAsync(id);
}

// ✅ GOOD - for collections
public async Task<List<User>> GetUsersAsync()
{
    return await _context.Users.ToListAsync() ?? new List<User>();
}
```

### Error Handling
- Use custom exceptions in Common/Exceptions/
- Implement global exception middleware in Api/Middleware/
- Return Problem Details (RFC 7807) for errors
- Log exceptions with structured logging


### Validation
- Use FluentValidation for validation rules
- Place validators in the same feature folder as DTOs
- Validate in API layer before calling services
- Return 400 Bad Request with validation errors

### Logging
- Use `ILogger<T>` for structured logging
- Log at appropriate levels: Debug, Information, Warning, Error, Critical
- Include context in log messages (IDs, operation names)
- Never log sensitive data (passwords, tokens, PII)

## Entity Framework Core Best Practices

### DbContext Usage
- Inject `AppDbContext` via constructor
- Use DbContext methods directly (no repository wrapper)
- Always dispose/scope DbContext properly (ASP.NET Core handles this)
- Use AsNoTracking() for read-only queries

```csharp
// ✅ GOOD - Read-only query
var users = await _context.Users
    .AsNoTracking()
    .Where(u => u.IsActive)
    .ToListAsync(ct);

// ✅ GOOD - Update operation
var user = await _context.Users.FindAsync(id, ct);
user.UpdateProfile(name, email);
await _context.SaveChangesAsync(ct);
```

### Query Patterns
- Use LINQ method syntax (not query syntax)
- Project to DTOs in queries when possible
- Use `Include()` for related entities, avoid lazy loading
- Always pass `CancellationToken` to async methods

```csharp
// ✅ GOOD
var transcripts = await _context.TranscriptionJobs
    .Include(t => t.MediaFile)
    .Include(t => t.Segments)
    .Where(t => t.UserId == userId)
    .Select(t => new TranscriptDto 
    {
        Id = t.Id,
        FileName = t.MediaFile.FileName,
        Status = t.Status
    })
    .ToListAsync(ct);
```

### Transactions
- Use `BeginTransactionAsync()` for multi-operation transactions
- Commit explicitly, rollback on exceptions
- Keep transaction scope as small as possible

```csharp
await using var transaction = await _context.Database.BeginTransactionAsync(ct);
try
{
    // Multiple operations
    await _context.SaveChangesAsync(ct);
    await transaction.CommitAsync(ct);
}
catch
{
    await transaction.RollbackAsync(ct);
    throw;
}
```

### Entities
- Define entities in `Infrastructure/Persistence/Entities/`
- Use configurations in  separate configuration classes
- Keep entities as simple POCOs with minimal logic
- Use navigation properties for relationships

## Controller Best Practices

### Structure
- Place controllers in `Features/{FeatureName}/` folder
- Inherit from `ControllerBase` (not Controller)
- Use `[ApiController]` attribute
- Use route attribute: `[Route("api/[controller]")]`

### Action Methods
- Use HTTP verb attributes: `[HttpGet]`, `[HttpPost]`, etc.
- Use route parameters: `[HttpGet("{id}")]`
- Return `ActionResult<T>` or `IActionResult`
- Use status code methods: `Ok()`, `NotFound()`, `BadRequest()`, etc.

### Authorization
- Use `[Authorize]` attribute at controller or action level
- Use policy-based authorization for complex rules
- Retrieve current user via `User.Identity` or custom extension methods

## Service Layer Best Practices

### Structure
- Place services in `Features/{FeatureName}/` folder
- Name services with `Service` suffix
- Register as scoped dependencies in DI
- Inject only what's needed (DbContext, ILogger, other services)

### Responsibilities
- Implement business logic
- Coordinate between data access and API layer
- Handle transactions when needed
- Throw domain exceptions, not return error codes

## DTOs and Models

### Location
- Place DTOs in the same feature folder as related service
- Suffix with `Dto`, `Request`, or `Response` based on usage

### Guidelines
- Use records for immutable DTOs
- Use classes for DTOs that need validation attributes
- Keep DTOs flat and simple
- Don't expose entity IDs unnecessarily


## Authentication & Authorization

### JWT Implementation
- Configure JWT in `Program.cs`
- Store configuration in `appsettings.json`
- Implement token generation service in `Features/Auth/`
- Use refresh tokens (stored in `RefreshToken` entity)

### Identity Integration
- Use `ApplicationUser` entity (extends `IdentityUser`)
- Configure Identity in `Program.cs`
- Store in `AspNetUsers` and related Identity tables

### OAuth
- Store external logins in `ExternalLogin` entity
- Support multiple OAuth providers (Google, Microsoft, etc.)
- Link external accounts to `ApplicationUser`

## Dependency Injection

### Registration
- Register services in `Api/Extensions/ServiceCollectionExtensions.cs`
- Group registrations by concern (auth, features, infrastructure)
- Use appropriate lifetimes:
  - **Scoped**: DbContext, services (default)
  - **Singleton**: Configuration, caching
  - **Transient**: Lightweight, stateless helpers


## Configuration

### appsettings.json
- Store non-sensitive configuration
- Use hierarchical structure
- Override in `appsettings.Development.json` for dev settings

### Secrets
- **NEVER** commit secrets to source control
- Use User Secrets for local development
- Use Azure Key Vault or environment variables for production
- Reference via `IConfiguration`

## Naming Conventions

### General
- Use PascalCase for classes, methods, properties, constants
- Use camelCase for local variables, parameters
- Use meaningful, descriptive names
- Avoid abbreviations (except common ones like `dto`, `id`)

### Specific Patterns
- Controllers: `{Feature}Controller` (e.g., `TranscriptionController`)
- Services: `{Feature}Service` (e.g., `TranscriptionService`)
- DTOs: `{Feature}Dto` or `{Action}{Feature}Request/Response`
- Entities: Singular noun (e.g., `MediaFile`, not `MediaFiles`)
- DbSet properties: Plural (e.g., `DbSet<User> Users`)

### ❌ DO NOT
- Create repository abstractions over DbContext
- Implement Unit of Work pattern (DbContext is UoW)
- Use MediatR or command/query buses (keep it simple)
- Return null for collections (return empty collections)
- Mix business logic in controllers (controllers should be thin)
- Use magic strings (use constants or enums)
- Catch exceptions without re-throwing or handling
- Use `Task.Run()` in API methods (ASP.NET Core handles threading)
- Create "Manager" or "Helper" classes (be more specific)

### ✅ DO
- Inject DbContext directly into services
- Keep controllers thin (delegate to services)
- Use dependency injection for all dependencies
- Return typed results from methods
- Use CancellationToken in all async methods
- Validate input at API boundary
- Use structured logging
- Follow SOLID principles
- Write self-documenting code
- Keep methods small and focused

Before committing code, ensure:
- [ ] Methods are under 50 lines
- [ ] Async methods use `async/await` and have `Async` suffix
- [ ] `CancellationToken` passed to all async operations
- [ ] No raw SQL strings (use LINQ or parameterized queries)
- [ ] Proper error handling and logging
- [ ] DTOs used for API contracts (not entities)
- [ ] Authorization checks in place
- [ ] Input validation implemented

### Performance Considerations
- Use AsNoTracking() for read-only queries
- Project to DTOs in database queries (Select)
- Use pagination for large datasets
- Consider caching for frequently accessed data
- Use compiled queries for hot paths

### Security
- Validate all inputs
- Sanitize user-generated content
- Use parameterized queries (EF Core does this)
- Implement rate limiting for APIs
- Use HTTPS only
- Keep dependencies updated

### Maintenance
- Document complex business logic
- Keep dependencies up to date
- Remove unused code and imports
- Run code analysis tools
- Follow consistent formatting (use .editorconfig)