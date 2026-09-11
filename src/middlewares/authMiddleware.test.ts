import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./authMiddleware";
import { userRepository } from "../repositories/userRepository";
import { UnauthorizedError } from "../helpers/api-error";

jest.mock("../repositories/userRepository", () => ({
  userRepository: { findOneBy: jest.fn() },
}));
jest.mock("jsonwebtoken");

const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedFindOneBy = userRepository.findOneBy as jest.Mock;

function buildRequest(authorization?: string): Request {
  return { headers: { authorization } } as unknown as Request;
}

describe("authMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects requests without an Authorization header", async () => {
    const next = jest.fn();

    await expect(authMiddleware(buildRequest(), {} as Response, next)).rejects.toBeInstanceOf(
      UnauthorizedError
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a valid token whose user no longer exists", async () => {
    mockedJwt.verify.mockReturnValue({ id: 42 } as never);
    mockedFindOneBy.mockResolvedValue(null);
    const next = jest.fn();

    await expect(
      authMiddleware(buildRequest("Bearer valid-token"), {} as Response, next)
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("attaches the authenticated user (without the password) and calls next() on success", async () => {
    mockedJwt.verify.mockReturnValue({ id: 42 } as never);
    mockedFindOneBy.mockResolvedValue({ id: 42, name: "Gabriel", password: "hashed" });
    const next = jest.fn();
    const req = buildRequest("Bearer valid-token");

    await authMiddleware(req, {} as Response, next);

    expect(req.user).toEqual({ id: 42, name: "Gabriel" });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
