import { z } from "zod";
import type { LoginRequest } from "../types";

// Schema validates LoginRequest DTO
export const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
}) satisfies z.ZodType<LoginRequest>;

export type LoginSchema = z.infer<typeof loginSchema>;
