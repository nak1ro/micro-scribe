import { z } from "zod";

// Extended validation for registration form (includes confirmPassword and acceptTerms)
export const registerSchema = z
    .object({
        email: z.string().min(1, "Email is required").email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
        acceptTerms: z.boolean().refine((val) => val === true, {
            message: "You must accept the terms",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type RegisterSchema = z.infer<typeof registerSchema>;
