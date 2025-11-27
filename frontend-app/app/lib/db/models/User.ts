import { ObjectId } from "mongodb";
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(12, "le MDP doit au moins contenir 12 caractères.")
  .regex(/[A-Z]/, "Le mot de passe doit avoir au moins une MAJUSCULE :)")
  .regex(/[a-z]/, "Le mot de passe doit avoir au moins une minuscule... c:")
  .regex(/[0-9]/, "Le mot de passe doit avoir au moins un chiffre... 0-9")
  .regex(
    /[^A-Za-z0-9]/,
    "Le mot de passe doit contenir au moins un caractère spécial.",
  );

export const userRegistrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: passwordSchema,
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export interface UserDocument {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  role: "USER" | "ADMIN";
  googleId?: string; //optionel?
  picture?: string; // ?
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  picture?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export function toUserResponse(user: UserDocument): UserResponse {
  return {
    id: user._id?.toString() || "",
    email: user.email,
    name: user.name,
    role: user.role,
    picture: user.picture,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
}

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
