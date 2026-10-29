export type Response = "reassign" | "resequence";
export type DecisionProofState = {
  choice: Response | null;
  approved: boolean;
  executed: boolean;
  evidence: boolean;
  learned: boolean;
  paused: boolean;
  exception: boolean;
};
export const initialProof: DecisionProofState = {
  choice: null,
  approved: false,
  executed: false,
  evidence: false,
  learned: false,
  paused: false,
  exception: false,
};
export function chooseResponse(
  _state: DecisionProofState,
  choice: Response,
): DecisionProofState {
  return {
    ...initialProof,
    choice,
    paused: _state.paused,
    exception: _state.exception,
  };
}
export function approve(state: DecisionProofState): DecisionProofState {
  return state.choice && !state.paused ? { ...state, approved: true } : state;
}
export function execute(state: DecisionProofState): DecisionProofState {
  return state.choice && state.approved && !state.paused
    ? { ...state, executed: true }
    : state;
}
export function verify(state: DecisionProofState): DecisionProofState {
  return state.executed && !state.paused ? { ...state, evidence: true } : state;
}
export function learn(state: DecisionProofState): DecisionProofState {
  return state.evidence && !state.paused ? { ...state, learned: true } : state;
}
export function raiseException(state: DecisionProofState): DecisionProofState {
  return {
    ...state,
    approved: false,
    executed: false,
    evidence: false,
    learned: false,
    paused: true,
    exception: true,
  };
}
export function resume(state: DecisionProofState): DecisionProofState {
  return { ...state, paused: false };
}
export function proofStatus(state: DecisionProofState) {
  if (state.paused) return "Paused. The changed scope needs a new decision.";
  if (!state.choice) return "Compare two possible responses.";
  if (!state.approved) return "Selected response awaits approval.";
  if (!state.executed) return "Approved scope is ready to execute.";
  if (!state.evidence)
    return "Action is recorded; result still needs verification.";
  if (!state.learned) return "Result verified; learning remains open.";
  return "Example loop complete: result verified and learning captured.";
}
export const proofSteps = [
  {
    name: "Detect",
    title: "A commitment starts to drift.",
    body: "A change in the work queue may put an agreed time at risk. The signal identifies a possible gap; it does not decide the response.",
    question: "What changed, and which commitment could be affected?",
  },
  {
    name: "Understand",
    title: "Put the signal in context.",
    body: "Capacity, due times, priorities and existing commitments give the change meaning. A response must account for effects elsewhere.",
    question: "What else could change if the team responds?",
  },
  {
    name: "Simulate",
    title: "Compare the next moves.",
    body: "Explore two possible responses before a person selects one. Each option has a different effect on capacity and timing.",
    question: "Which trade-off is acceptable for this scope?",
  },
  {
    name: "Authorize",
    title: "Keep the decision with its owner.",
    body: "The owner approves a defined response. If scope changes later, the example stops and returns for another decision.",
    question: "Who can authorize this action, and within what limit?",
  },
  {
    name: "Execute",
    title: "Move only the agreed work.",
    body: "The selected response is carried out within its approved scope. A new exception pauses the path instead of silently changing it.",
    question: "Did the action stay within its authority?",
  },
  {
    name: "Verify",
    title: "Check the result against its source.",
    body: "An action is not completion. Compare the source record with the agreed outcome before closing the work.",
    question: "What evidence shows that the result is real?",
  },
  {
    name: "Learn",
    title: "Keep the learning connected.",
    body: "Record what changed, why the response was chosen and what the result showed. That context can improve the next decision.",
    question: "What should the next decision know?",
  },
] as const;
