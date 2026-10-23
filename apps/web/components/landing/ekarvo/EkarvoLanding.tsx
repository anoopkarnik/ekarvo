"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Pause, Play } from 'lucide-react';
import { useLandingScroll } from './hooks/useLandingScroll';
import { EkarvoWorkstreamMap } from './components/EkarvoWorkstreamMap';
import { TopNav } from './components/TopNav';
import { StoryScenesEarly } from './components/StoryScenesEarly';
import { PulseExperience } from './components/PulseExperience';
import { DriveExperience } from './components/DriveExperience';
import { SimulationStudio } from './components/SimulationStudio';
import { StoryScenesLate } from './components/StoryScenesLate';
import { EnterpriseModals } from './components/EnterpriseModals';

export function EkarvoLanding() {
  const { sceneStateRef, activeSceneCode, renderRequestRef } = useLandingScroll();
  const [hoveredProduct, setHoveredProduct] = useState<'none' | 'pulse' | 'drive'>('none');
  const [operatingModelMode, setOperatingModelMode] = useState<
    'fragmented' | 'connected' | 'autonomous'
  >('autonomous');
  const [dispatchedPackageSummary, setDispatchedPackageSummary] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<
    'none' | 'contact' | 'platform' | 'solutions' | 'company'
  >('none');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ambientPaused, setAmbientPaused] = useState(false);
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => {
    try { setAmbientPaused(sessionStorage.getItem('ekarvo.ambientPaused') === 'true'); } catch { /* Storage may be unavailable in private contexts. */ }
    setMotionReady(true);
  }, []);

  const toggleAmbientMotion = () => {
    const paused = !ambientPaused;
    setAmbientPaused(paused);
    try { sessionStorage.setItem('ekarvo.ambientPaused', String(paused)); } catch { /* The control still works without persistence. */ }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const handleNavigateScene = useCallback((sceneId: string) => {
    const el = document.getElementById(sceneId);
    if (el) {
      el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }
  }, []);

  const handleSendToDrive = useCallback(
    (summary: string) => {
      setDispatchedPackageSummary(summary);
      handleNavigateScene('scene-07');
    },
    [handleNavigateScene]
  );

  return (
    <div className="ekarvo-site relative isolate min-h-dvh bg-[#090D11] text-[#EEF3F0]">
      {/* Scroll-driven operational workstream map */}
      <EkarvoWorkstreamMap
        sceneStateRef={sceneStateRef}
        renderRequestRef={renderRequestRef}
        hoveredProduct={hoveredProduct}
        operatingModelMode={operatingModelMode}
        reducedMotion={reducedMotion}
        ambientPaused={!motionReady || ambientPaused}
        modalOpen={activeModal !== 'none'}
      />

      {/* Persistent Single-Line Top Navigation (Max 80px height) */}
      <TopNav
        onNavigateScene={handleNavigateScene}
        onOpenModal={(m) => setActiveModal(m)}
      />

      <button
        type="button"
        className="ekarvo-motion-control"
        onClick={toggleAmbientMotion}
        disabled={reducedMotion || !motionReady}
        hidden={activeModal !== 'none'}
        aria-label={reducedMotion ? 'Animation disabled by reduced motion preference' : ambientPaused ? 'Resume ambient motion' : 'Pause ambient motion'}
        title={reducedMotion ? 'Reduced motion enabled' : ambientPaused ? 'Resume ambient motion' : 'Pause ambient motion'}
      >
        {ambientPaused && !reducedMotion ? <Play aria-hidden="true" size={14} /> : <Pause aria-hidden="true" size={14} />}
        <span>{reducedMotion ? 'Reduced motion' : ambientPaused ? 'Resume motion' : 'Pause motion'}</span>
      </button>

      {/* Main Website Content */}
      <main
        id="main-content"
        tabIndex={-1}
        data-active-scene={activeSceneCode}
        className="relative z-10"
      >
        <StoryScenesEarly
          onNavigateScene={handleNavigateScene}
          hoveredProduct={hoveredProduct}
          onHoverProduct={setHoveredProduct}
          onOpenModal={(m) => setActiveModal(m)}
        />

        <PulseExperience onSendToDrive={handleSendToDrive} />

        <DriveExperience
          dispatchedPackageSummary={dispatchedPackageSummary}
          onNavigateToSimulation={() => handleNavigateScene('scene-08')}
        />

        <SimulationStudio />

        <StoryScenesLate
          operatingModelMode={operatingModelMode}
          onChangeOperatingModel={setOperatingModelMode}
          onNavigateScene={handleNavigateScene}
          onOpenModal={(m) => setActiveModal(m)}
        />
      </main>

      {/* Enterprise Modals (Talk to EKARVO, Platform, Solutions, Company) */}
      <EnterpriseModals
        activeModal={activeModal}
        onCloseModal={() => setActiveModal('none')}
        onNavigateScene={handleNavigateScene}
      />
    </div>
  );
}

export default EkarvoLanding;
