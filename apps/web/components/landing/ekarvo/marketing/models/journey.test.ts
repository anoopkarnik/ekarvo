import { describe, expect, it } from "vitest";
import {
  initialJourney,
  propose,
  start,
  finishClassification,
  approve,
  reject,
  execute,
  verify,
  blockEvidence,
  retryEvidence,
  raiseException,
  pause,
  resume,
  reset,
} from "./journey";
const awaiting = () => finishClassification(start(propose(initialJourney)));
const executing = () => execute(approve(awaiting()));
describe("Drive journey authority and evidence", () => {
  it("keeps a proposal separate from authority and execution", () => {
    const proposed = propose(initialJourney);
    expect(proposed.status).toBe("Ready");
    expect(proposed.authorized).toBe(false);
    expect(execute(proposed)).toBe(proposed);
    expect(approve(proposed)).toBe(proposed);
    expect(awaiting().authorized).toBe(false);
  });
  it("separates approved work, executed action and verified result", () => {
    const approved = approve(awaiting());
    expect(approved.authorized).toBe(true);
    expect(approved.executed).toBe(false);
    expect(verify(approved)).toBe(approved);
    const action = execute(approved);
    expect(action.executed).toBe(true);
    expect(action.verified).toBe(false);
    expect(verify(action).status).toBe("Verified");
  });
  it("never executes a rejected proposal", () => {
    const rejected = reject(awaiting());
    expect(rejected.status).toBe("Cancelled");
    expect(execute(approve(rejected))).toBe(rejected);
  });
  it("requires another explicit decision after an exception", () => {
    const changed = raiseException(executing());
    expect(changed.authorized).toBe(false);
    expect(changed.executed).toBe(false);
    expect(changed.verified).toBe(false);
    expect(execute(changed)).toBe(changed);
    expect(execute(approve(changed)).status).toBe("Verifying");
  });
  it("pause blocks all work until resume restores the pending stage", () => {
    for (const pending of [start(propose(initialJourney)), executing()]) {
      const stopped = pause(pending);
      for (const transition of [
        propose,
        start,
        finishClassification,
        approve,
        reject,
        execute,
        verify,
        blockEvidence,
        retryEvidence,
        raiseException,
      ])
        expect(transition(stopped)).toBe(stopped);
      expect(resume(stopped)).toEqual(pending);
    }
  });
  it("blocks missing receipts and recovers only with another verification", () => {
    const blocked = blockEvidence(executing());
    expect(blocked.status).toBe("Blocked");
    expect(blocked.verified).toBe(false);
    const retry = retryEvidence(blocked);
    expect(retry.status).toBe("Verifying");
    expect(retry.verified).toBe(false);
    expect(verify(retry).status).toBe("Verified");
  });
  it("reset clears authority, action, evidence and pending model work", () => {
    for (const state of [
      executing(),
      pause(executing()),
      blockEvidence(executing()),
      verify(executing()),
    ]) {
      const fresh = reset(state);
      expect(fresh).toEqual(initialJourney);
      expect(finishClassification(fresh)).toBe(fresh);
      expect(verify(fresh)).toBe(fresh);
    }
    expect(initialJourney.status).toBe("Draft");
  });
});
