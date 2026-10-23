import { useEffect, useRef, useState } from 'react';
import { computeSceneStateByIndex, SCENES } from '../utils/sceneEngine';
import { sampleSectionScroll, type SectionAnchor } from '../utils/scrollScene';

export function useLandingScroll() {
  const sceneStateRef = useRef(computeSceneStateByIndex(1, 0));
  const renderRequestRef = useRef<(() => void) | null>(null);
  const [activeSceneCode, setActiveSceneCode] = useState('01');

  useEffect(() => {
    let sections: SectionAnchor[] = [];
    let height = 0;
    let viewport = window.innerHeight;
    let activeIndex = 1;
    let measurementFrame = 0;
    let disposed = false;

    const update = () => {
      const { index, progress } = sampleSectionScroll(window.scrollY, viewport, height, sections);
      const state = computeSceneStateByIndex(index, progress);
      sceneStateRef.current = state;
      renderRequestRef.current?.();
      if (index !== activeIndex) {
        activeIndex = index;
        setActiveSceneCode(state.activeScene.code);
      }
    };
    const measure = () => {
      measurementFrame = 0;
      viewport = window.innerHeight;
      height = document.documentElement.scrollHeight;
      sections = SCENES.flatMap((scene) => {
        const element = document.getElementById(scene.id);
        return element ? [{ index: scene.index, top: element.getBoundingClientRect().top + window.scrollY }] : [];
      });
      update();
    };
    const scheduleMeasure = () => {
      if (!measurementFrame) measurementFrame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(scheduleMeasure);
    for (const scene of SCENES) {
      const element = document.getElementById(scene.id);
      if (element) observer.observe(element);
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    measure();
    void document.fonts?.ready.then(() => { if (!disposed) scheduleMeasure(); });
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(measurementFrame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, []);

  return { sceneStateRef, activeSceneCode, renderRequestRef };
}
