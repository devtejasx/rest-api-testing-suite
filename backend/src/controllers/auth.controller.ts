import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthenticatedRequest } from "../types";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 201, "Account created");
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 200, "Logged in");
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const profile = await authService.getProfile(user!.id);
    sendSuccess(res, profile);
  }),
};
