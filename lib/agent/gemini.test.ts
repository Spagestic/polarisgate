import { describe, expect, test } from "bun:test";
import { parseModelJson } from "./gemini";

describe("parseModelJson", () => {
  test("parses raw JSON", () => {
    expect(parseModelJson<{ countries: [] }>('{"countries":[]}')).toEqual({
      countries: [],
    });
  });

  test("parses fenced JSON", () => {
    expect(
      parseModelJson<{ name: string }>(
        'Here is the result:\n```json\n{"name":"Canada"}\n```',
      ),
    ).toEqual({ name: "Canada" });
  });

  test("extracts a JSON object from leading prose", () => {
    expect(
      parseModelJson<{ countries: string[] }>(
        'Summary first.\n{"countries":["ca"]}',
      ),
    ).toEqual({ countries: ["ca"] });
  });

  test("rejects conversational markdown without JSON", () => {
    expect(() => parseModelJson("* User: hello")).toThrow(
      /not valid JSON/i,
    );
  });
});
