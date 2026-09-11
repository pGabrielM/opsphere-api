import { ApiError, BadRequestError, NotFoundError, UnauthorizedError } from "./api-error";

describe("api-error", () => {
  it("carries a custom message and status code on the base ApiError", () => {
    const error = new ApiError("something went wrong", 418);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("something went wrong");
    expect(error.statusCode).toBe(418);
  });

  it("maps BadRequestError to 400", () => {
    const error = new BadRequestError("invalid payload");

    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("invalid payload");
  });

  it("maps NotFoundError to 404", () => {
    const error = new NotFoundError("panel not found");

    expect(error.statusCode).toBe(404);
  });

  it("maps UnauthorizedError to 401", () => {
    const error = new UnauthorizedError("missing token");

    expect(error.statusCode).toBe(401);
  });
});
