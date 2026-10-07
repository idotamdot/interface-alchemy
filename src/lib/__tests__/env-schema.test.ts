import { describe, expect, it } from "vitest";
import { parseServerEnv } from "../env-schema";

describe("parseServerEnv", () => {
  it("does not require the retired application JWT secret in production", () => {
    const env = parseServerEnv({ NODE_ENV: "production" });
    expect(env.NODE_ENV).toBe("production");
  });

  it("rejects the development mock in production", () => {
    expect(() =>
      parseServerEnv({
        NODE_ENV: "production",
        ENABLE_DEV_MOCK_PROVIDER: "true",
      })
    ).toThrow("cannot be enabled in production");
  });

  it("allows the development mock only when explicitly enabled", () => {
    const env = parseServerEnv({
      NODE_ENV: "test",
      ENABLE_DEV_MOCK_PROVIDER: "true",
    });
    expect(env.ENABLE_DEV_MOCK_PROVIDER).toBe(true);
  });

  it("defaults the development mock to disabled", () => {
    expect(parseServerEnv({ NODE_ENV: "development" }).ENABLE_DEV_MOCK_PROVIDER).toBe(
      false
    );
  });
});
