import { describe, expect, it } from "vitest";
import { getResponsiveImageSources } from "@/components/ProgressiveImage";

describe("getResponsiveImageSources", () => {
  it("creates lightweight responsive Unsplash variants", () => {
    const result = getResponsiveImageSources(
      "https://images.unsplash.com/photo-example?w=600",
      [112, 56, 56],
    );

    expect(result.src).toContain("w=112");
    expect(result.src).toContain("auto=format");
    expect(result.src).toContain("q=65");
    expect(result.srcSet).toContain("w=56");
    expect(result.srcSet).toContain("56w");
    expect(result.srcSet).toContain("112w");
  });

  it("keeps uploaded and local images unchanged", () => {
    expect(getResponsiveImageSources("data:image/jpeg;base64,abc", [56, 112])).toEqual({
      src: "data:image/jpeg;base64,abc",
      srcSet: undefined,
    });
    expect(getResponsiveImageSources("/placeholder.svg", [56, 112])).toEqual({
      src: "/placeholder.svg",
      srcSet: undefined,
    });
  });
});