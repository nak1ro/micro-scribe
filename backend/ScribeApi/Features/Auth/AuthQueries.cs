using Microsoft.EntityFrameworkCore;
using ScribeApi.Infrastructure.Persistence;
using ScribeApi.Infrastructure.Persistence.Entities;

namespace ScribeApi.Features.Auth;

public class AuthQueries
{
    private readonly AppDbContext _context;

    public AuthQueries(AppDbContext context)
    {
        _context = context;
    }

}