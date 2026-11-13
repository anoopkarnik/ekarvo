import { expect, it, vi } from "vitest";
const sources = vi.hoisted(() => ({
  en: { pulse: { navigation: "Old navigation" } },
  es: { pulse: { navigation: "Navegación anterior" } },
}));
vi.mock("./messages/en/index", () => ({
  get default() {
    return sources.en;
  },
}));
vi.mock("./messages/es/index", () => ({
  get default() {
    return sources.es;
  },
}));
import { getMessages } from "./messages";
it("refreshes cached catalogues when imported translation sources change during development", () => {
  expect(getMessages("en").pulse.navigation).toBe("Old navigation");
  expect(getMessages("es").pulse.navigation).toBe("Navegación anterior");
  sources.en = { pulse: { navigation: "Workspace navigation" } };
  sources.es = { pulse: { navigation: "Navegación del espacio de trabajo" } };
  expect(getMessages("en").pulse.navigation).toBe("Workspace navigation");
  expect(getMessages("es").pulse.navigation).toBe(
    "Navegación del espacio de trabajo",
  );
});
