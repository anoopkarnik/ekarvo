import type { SceneMode } from "./data";

/** This module and all Three.js dependencies are requested only for visible scenes. */
export async function createStudyWorld(host: HTMLElement, mode: SceneMode, paper: boolean) {
  if (mode === "operations" || mode === "execution") {
    const { createProductWorld } = await import("./productWorld");
    return createProductWorld(host, mode, paper);
  }
  const { createKineticWorld } = await import("../film/kineticWorld");
  return createKineticWorld(host, [], { composition: "study", paper });
}
