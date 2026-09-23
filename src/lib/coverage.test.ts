import { describe, expect, it } from "vitest";
import { gapSubmitUrl } from "./coverage";

describe("gapSubmitUrl", () => {
  it("links to the submit page with the technique pre-filled", () => {
    expect(gapSubmitUrl("T1059")).toBe("submit.html?technique=T1059");
  });

  it("keeps sub-technique IDs intact", () => {
    expect(gapSubmitUrl("T1059.001")).toBe("submit.html?technique=T1059.001");
  });

  it("encodes anything that isn't a plain ID", () => {
    expect(gapSubmitUrl("T1059&x=<y>")).toBe(
      "submit.html?technique=T1059%26x%3D%3Cy%3E",
    );
  });
});
