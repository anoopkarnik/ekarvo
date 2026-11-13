import { expect, it } from "vitest";
import {
  selectPulseOrganization,
  selectedSuite,
  selectedAdminSection,
} from "./navigation";
it("uses the sidebar's active workspace without falling back to another BPO", () => {
  const organizations = [
    { id: "bpo-a", isItAdmin: true },
    { id: "bpo-b", isItAdmin: false },
  ];
  expect(selectPulseOrganization(organizations, "bpo-b")).toEqual(
    organizations[1],
  );
  expect(
    selectPulseOrganization(organizations, "personal-workspace"),
  ).toBeUndefined();
  expect(selectPulseOrganization(organizations, null)).toBeUndefined();
});
it("resolves supported deep links and safe default sections", () => {
  expect(selectedSuite("perform")).toBe("perform");
  expect(selectedSuite("unknown")).toBe("command");
  expect(selectedAdminSection("imports")).toBe("imports");
  expect(selectedAdminSection(null)).toBe("members");
});
