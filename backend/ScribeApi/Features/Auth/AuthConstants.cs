namespace ScribeApi.Features.Auth;

public static class AuthConstants
{
    public static class Roles
    {
        public const string User = "User";
        public const string Admin = "Admin";
    }

    public static class Providers
    {
        public const string Google = "google";
    }

    public static class Validation
    {
        public const int MinPasswordLength = 8;
        public const string PasswordPatternUpper = "[A-Z]";
        public const string PasswordPatternLower = "[a-z]";
        public const string PasswordPatternDigit = "[0-9]";
        public const string PasswordPatternSpecial = "[^a-zA-Z0-9]";
        
        public const string PasswordMessageUpper = "Password must contain at least one uppercase letter.";
        public const string PasswordMessageLower = "Password must contain at least one lowercase letter.";
        public const string PasswordMessageDigit = "Password must contain at least one digit.";
        public const string PasswordMessageSpecial = "Password must contain at least one special character.";
    }
}
