/** Deterministic synthetic report journey. Timers belong to the client island. */
export type JourneyStatus =
  | "Draft"
  | "Ready"
  | "Running"
  | "Awaiting approval"
  | "Verifying"
  | "Verified"
  | "Blocked"
  | "Cancelled"
  | "Paused";
export type JourneyState = {
  status: JourneyStatus;
  authorized: boolean;
  executed: boolean;
  verified: boolean;
  exception: boolean;
  pausedFrom: "Running" | "Verifying" | null;
};
export const initialJourney: JourneyState = {
  status: "Draft",
  authorized: false,
  executed: false,
  verified: false,
  exception: false,
  pausedFrom: null,
};
export function propose(state: JourneyState): JourneyState {
  return state.status === "Draft" ? { ...state, status: "Ready" } : state;
}
export function start(state: JourneyState): JourneyState {
  return state.status === "Ready" ? { ...state, status: "Running" } : state;
}
export function finishClassification(state: JourneyState): JourneyState {
  return state.status === "Running"
    ? { ...state, status: "Awaiting approval" }
    : state;
}
export function approve(state: JourneyState): JourneyState {
  return state.status === "Awaiting approval"
    ? { ...state, authorized: true, exception: false }
    : state;
}
export function reject(state: JourneyState): JourneyState {
  return state.status === "Awaiting approval"
    ? { ...state, status: "Cancelled", authorized: false }
    : state;
}
export function execute(state: JourneyState): JourneyState {
  return state.status === "Awaiting approval" && state.authorized
    ? { ...state, status: "Verifying", executed: true }
    : state;
}
export function verify(state: JourneyState): JourneyState {
  return state.status === "Verifying" && state.authorized && state.executed
    ? { ...state, status: "Verified", verified: true }
    : state;
}
export function blockEvidence(state: JourneyState): JourneyState {
  return state.status === "Verifying" && state.executed
    ? { ...state, status: "Blocked", verified: false }
    : state;
}
export function retryEvidence(state: JourneyState): JourneyState {
  return state.status === "Blocked" ? { ...state, status: "Verifying" } : state;
}
export function raiseException(state: JourneyState): JourneyState {
  return state.status === "Verifying"
    ? {
        ...state,
        status: "Awaiting approval",
        authorized: false,
        executed: false,
        verified: false,
        exception: true,
      }
    : state;
}
export function pause(state: JourneyState): JourneyState {
  return state.status === "Running" || state.status === "Verifying"
    ? { ...state, status: "Paused", pausedFrom: state.status }
    : state;
}
export function resume(state: JourneyState): JourneyState {
  return state.status === "Paused" && state.pausedFrom
    ? { ...state, status: state.pausedFrom, pausedFrom: null }
    : state;
}
export function reset(state: JourneyState): JourneyState {
  return { ...state, ...initialJourney };
}
