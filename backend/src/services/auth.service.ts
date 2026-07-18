import type { User } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import type { RegisterInput, LoginInput } from "../validators/auth.validator";

/** A user safe to return to clients (no password hash). */
export type SafeUser = Omit<User, "password">;

export interface AuthResult {
  token: string;
  user: SafeUser;
}

function toSafeUser(user: User): SafeUser {
  // Strip the password hash before it ever leaves the service layer.
  const { password: _password, ...safe } = user;
  return safe;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const hashed = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashed,
    });

    return this.buildResult(user);
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const valid = await comparePassword(input.password, user.password);
    if (!valid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    return this.buildResult(user);
  },

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return toSafeUser(user);
  },

  buildResult(user: User): AuthResult {
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: toSafeUser(user) };
  },
};
