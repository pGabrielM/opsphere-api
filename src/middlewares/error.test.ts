import { Request, Response } from "express";
import { errorMiddleware } from "./error";
import { BadRequestError } from "../helpers/api-error";

function buildResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("errorMiddleware", () => {
  it("responds with the error status code and message for known ApiError instances", () => {
    const res = buildResponse();
    const error = new BadRequestError("invalid payload");

    errorMiddleware(error, {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "invalid payload" });
  });

  it("hides the original message and falls back to 500 for unexpected errors", () => {
    const res = buildResponse();
    const error = new Error("some internal detail that should not leak");

    errorMiddleware(error, {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});
