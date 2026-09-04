import { describe, expect, it } from "vitest";
import { includesDiscoveryQuery, parseDiscoveryQuery } from "./query";

describe("intentional discovery query", () => {
  it("recognizes lightweight natural-language scope and timing", () => {
    expect(
      parseDiscoveryQuery("D&D Sessions near me this weekend", "across", "all"),
    ).toEqual({
      query: "D&D Sessions",
      scope: "near",
      timing: "soon",
    });
  });

  it("requires every search term without opaque ranking", () => {
    expect(
      includesDiscoveryQuery("black developers", "Black game developers in NJ"),
    ).toBe(true);
    expect(
      includesDiscoveryQuery(
        "black photographers",
        "Black game developers in NJ",
      ),
    ).toBe(false);
  });
});
