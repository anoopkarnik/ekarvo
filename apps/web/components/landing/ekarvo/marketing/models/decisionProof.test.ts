import { describe, expect, it } from "vitest";
import {
  approve,
  chooseResponse,
  execute,
  initialProof,
  learn,
  proofStatus,
  raiseException,
  resume,
  verify,
} from "./decisionProof";

const selected = () => chooseResponse(initialProof, "reassign");
const completed = () => learn(verify(execute(approve(selected()))));

describe("decision proof", () => {
  it("requires a choice and owner authority before recording action", () => {
    expect(approve(initialProof)).toEqual(initialProof);
    expect(execute(selected())).toEqual(selected());
    expect(execute(approve(selected())).executed).toBe(true);
  });
  it("requires recorded action before evidence, then evidence before learning", () => {
    expect(verify(approve(selected())).evidence).toBe(false);
    expect(learn(execute(approve(selected()))).learned).toBe(false);
    expect(completed()).toMatchObject({
      approved: true,
      executed: true,
      evidence: true,
      learned: true,
    });
  });
  it("clears previous authority, action, evidence and learning when choosing a response", () => {
    expect(chooseResponse(completed(), "resequence")).toEqual({
      ...initialProof,
      choice: "resequence",
    });
  });
  it("stops every work transition on exception until resumed and reapproved", () => {
    const stopped = raiseException(completed());
    expect(stopped).toMatchObject({
      paused: true,
      exception: true,
      approved: false,
      executed: false,
      evidence: false,
      learned: false,
    });
    for (const transition of [approve, execute, verify, learn])
      expect(transition(stopped)).toEqual(stopped);
    const resumed = resume(stopped);
    expect(execute(resumed)).toEqual(resumed);
    expect(execute(approve(resumed)).executed).toBe(true);
  });
  it("does not allow changing a choice to bypass an active exception", () => {
    const changed = chooseResponse(raiseException(completed()), "resequence");
    expect(changed).toMatchObject({
      choice: "resequence",
      paused: true,
      exception: true,
      approved: false,
    });
    expect(execute(approve(changed)).executed).toBe(false);
  });
  it("reports each stage honestly and completes only after evidence and learning", () => {
    const states = [
      initialProof,
      selected(),
      approve(selected()),
      execute(approve(selected())),
      verify(execute(approve(selected()))),
      completed(),
      raiseException(completed()),
    ];
    expect(states.map(proofStatus)).toEqual([
      "Compare two possible responses.",
      "Selected response awaits approval.",
      "Approved scope is ready to execute.",
      "Action is recorded; result still needs verification.",
      "Result verified; learning remains open.",
      "Example loop complete: result verified and learning captured.",
      "Paused. The changed scope needs a new decision.",
    ]);
  });
  it("is deterministic, immutable and JSON serializable", () => {
    const original = JSON.stringify(initialProof);
    expect(completed()).toEqual(completed());
    expect(JSON.parse(JSON.stringify(completed()))).toEqual(completed());
    expect(JSON.stringify(initialProof)).toBe(original);
  });
});
