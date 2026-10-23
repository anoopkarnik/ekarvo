import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  SCENES,
  computeSceneStateByIndex,
  computeSceneStateFromScroll,
  simulateCapacityIntervention,
  SIMULATION_SCENARIOS,
  CAPABILITY_ATLAS,
  validateContactForm,
} from './sceneEngine';

test('SCENES covers all 13 website sections (00 through 12) with cohesive theme lock', () => {
  assert.equal(SCENES.length, 13);
  assert.equal(SCENES[0]!.code, '00');
  assert.equal(SCENES[4]!.code, '04');
  assert.equal(SCENES[12]!.code, '12');
});

test('computeSceneStateFromScroll and computeSceneStateByIndex are deterministic', () => {
  const startState = computeSceneStateFromScroll(0);
  assert.equal(startState.activeSceneIndex, 0);
  assert.equal(startState.isLightDominant, false);
  assert.equal(startState.colors.bgHex, '#090d11');

  const midState = computeSceneStateByIndex(8, 0.2);
  assert.equal(midState.activeScene.code, '08');
  assert.equal(midState.isLightDominant, false);
  assert.equal(midState.colors.bgHex, '#090d11');
  assert.equal(midState.colors.textPrimaryHex, '#EEF3F0');

  const finaleState = computeSceneStateFromScroll(1.0);
  assert.equal(finaleState.activeSceneIndex, 12);
  assert.equal(finaleState.isLightDominant, false);
  assert.equal(finaleState.signalCohesion, 1.0);
});

test('simulateCapacityIntervention recalculates SLA exposure and allocations accurately', () => {
  const baseline = simulateCapacityIntervention('baseline');
  const redistr = simulateCapacityIntervention('redistribute');
  const driveRoute = simulateCapacityIntervention('route_drive');

  assert.ok(redistr.slaExposureAfter < baseline.slaExposureAfter);
  assert.ok(driveRoute.slaExposureAfter < redistr.slaExposureAfter);
  assert.equal(driveRoute.projectedBacklogDelta, -145);
});

test('SIMULATION_SCENARIOS includes complete 7-stage flows and industry-agnostic audit trails', () => {
  assert.equal(SIMULATION_SCENARIOS.claims.executionSteps.length, 7);
  assert.equal(SIMULATION_SCENARIOS.support.executionSteps.length, 7);
  assert.equal(SIMULATION_SCENARIOS.finance.executionSteps.length, 7);
  assert.ok(SIMULATION_SCENARIOS.claims.evidenceTrail.length >= 4);
});

test('CAPABILITY_ATLAS contains all 12 Pulse modules and 15 Drive modules (27 total)', () => {
  const pulseModules = CAPABILITY_ATLAS.filter((m) => m.product === 'Pulse');
  const driveModules = CAPABILITY_ATLAS.filter((m) => m.product === 'Drive');
  assert.equal(pulseModules.length, 12);
  assert.equal(driveModules.length, 15);
  assert.equal(CAPABILITY_ATLAS.length, 27);
});

test('validateContactForm rejects empty or malformed inputs and accepts valid enterprise inquiry', () => {
  const invalid = validateContactForm({
    fullName: '',
    workEmail: 'not-an-email',
    organization: '',
    focusArea: '',
    message: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.workEmail);

  const valid = validateContactForm({
    fullName: 'Elena Rostova',
    workEmail: 'elena.rostova@enterprise.io',
    organization: 'Apex Global Operations',
    focusArea: 'Both Pulse & Drive',
    message: 'Exploring autonomous cross-system workflow execution.',
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});
