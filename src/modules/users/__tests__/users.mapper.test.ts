import { describe, expect, it } from "vitest";
import { mapUserDtoToEntity } from "../contracts/users.mapper";

describe("users mapper", () => {
  it("maps dto to entity", () => {
    const entity = mapUserDtoToEntity({
      id: "1",
      keycloakUserId: "k",
      name: "A",
      email: "a@a.com",
      isAdmin: true,
      active: true,
    });
    expect(entity.name).toBe("A");
  });
});
