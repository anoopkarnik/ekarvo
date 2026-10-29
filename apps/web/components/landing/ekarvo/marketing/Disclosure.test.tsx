import React from "react";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Disclosure } from "./Disclosure";
import Approach, {
  metadata as approachMetadata,
} from "@/app/landing/approach/page";
import Platform, {
  metadata as platformMetadata,
} from "@/app/landing/platform/page";
import Trust, { metadata as trustMetadata } from "@/app/landing/trust/page";
import Company, {
  metadata as companyMetadata,
} from "@/app/landing/company/page";

vi.mock("next/navigation", () => ({ usePathname: () => "/landing" }));
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

const pages = [
  {
    Page: Approach,
    name: "Approach",
    title: "Done is more than a status.",
    eyebrow: "THE EKARVO APPROACH",
    scene: "evidence",
    meta: approachMetadata,
    seo: "Our approach — Ekarvo",
    description:
      "Explore how Ekarvo defines an outcome, governs the work and verifies completion.",
    links: [
      ["Inside an Outcome Contract", "#outcome-contract"],
      ["Download an example contract", "/downloads/outcome-contract.txt"],
      ["Our control principles", "/landing/trust"],
    ],
    headings: [
      "Give every decision a clear destination.",
      "Define the result",
      "Coordinate the work",
      "Verify completion",
      "Clarity before the first action.",
      "The result",
      "The authority",
      "The evidence",
      "Make the distinction that matters.",
    ],
  },
  {
    Page: Platform,
    name: "Platform",
    title: "A shared foundation. Built to connect.",
    eyebrow: "THE SHARED FOUNDATION",
    scene: "platform",
    meta: platformMetadata,
    seo: "The platform — Ekarvo",
    description:
      "Intelligence, Execution and Assurance. The shared foundation behind Ekarvo Pulse and Ekarvo Drive.",
    links: [["Meet the products", "/landing/products"]],
    headings: [
      "Intelligence",
      "Execution",
      "Assurance",
      "Connected by design.",
      "Your systems in a shared operating context.",
    ],
  },
  {
    Page: Trust,
    name: "Trust",
    title: "More autonomy needs clearer accountability.",
    eyebrow: "CONFIDENCE, BY DESIGN",
    scene: "trust",
    meta: trustMetadata,
    seo: "Trust and control — Ekarvo",
    description:
      "Ekarvo’s design principles for accountable execution: explicit authority, human oversight, clear evidence and bounded autonomy.",
    links: [["Discuss your requirements", "/landing/contact"]],
    headings: [
      "Explicit permission.",
      "An accountable decision.",
      "A traceable result.",
      "Authority follows the work.",
      "Permission grows with definition.",
      "Read within scope",
      "Recommend a next step",
      "Act after approval",
      "Act within agreed limits",
      "Coordinate a bounded workflow",
      "Confidence comes from the details.",
    ],
  },
  {
    Page: Company,
    name: "Company",
    title: "Responsibility belongs to people.",
    eyebrow: "THE AUTONOMOUS EXECUTION COMPANY",
    scene: null,
    meta: companyMetadata,
    seo: "Our vision — Ekarvo",
    description:
      "Ekarvo’s vision: enterprises define outcomes and intelligent systems deliver them. Meet the thinking behind accountable autonomous operations.",
    links: [
      ["Explore Ekarvo Pulse", "/landing/products/operations-os"],
      ["Explore Ekarvo Drive", "/landing/products/autonomous-execution"],
    ],
    headings: [
      "Close the gap between intent and outcome.",
      "Start with operating intelligence and build toward autonomy.",
      "Ekarvo Pulse",
      "Ekarvo Drive",
      "Our way of building.",
    ],
  },
];

describe("source editorial routes", () => {
  it.each(pages)(
    "renders $name hierarchy, artwork, destinations and active navigation",
    ({ Page, name, title, eyebrow, scene, links, headings }) => {
      const { container } = render(<Page />);
      const main = within(screen.getByRole("main"));
      expect(main.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(main.getByRole("heading", { level: 1 })).toHaveTextContent(title);
      expect(main.getByText(eyebrow)).toBeInTheDocument();
      for (const heading of headings)
        expect(
          main.getByRole("heading", { name: heading }),
        ).toBeInTheDocument();
      if (scene)
        expect(
          container.querySelector(`[data-world-mode="${scene}"]`),
        ).toBeInTheDocument();
      else
        expect(
          main.getByRole("img", {
            name: "A person climbs a quiet stairway toward daylight, framed by concrete walls.",
          }),
        ).toHaveAttribute("src", "/images/company/human-judgment.webp");
      for (const [label, href] of links)
        expect(main.getByRole("link", { name: label })).toHaveAttribute(
          "href",
          href,
        );
      expect(
        main.getByRole("link", { name: "Discuss a workflow" }),
      ).toHaveAttribute("href", "/landing/contact");
      expect(container.querySelector(".film-closing-art img")).toHaveAttribute(
        "src",
        "/images/cinematic/study-evidence-dark.webp",
      );
      expect(
        within(
          screen.getByRole("navigation", { name: "Main navigation" }),
        ).getByRole("link", { name }),
      ).toHaveAttribute("aria-current", "page");
      for (const link of main.getAllByRole("link")) {
        const href = link.getAttribute("href")!;
        expect(
          href.startsWith("#") ||
            href.startsWith("/landing/") ||
            href.startsWith("/downloads/") ||
            href.startsWith("https://"),
        ).toBe(true);
      }
    },
  );

  it.each(pages)(
    "sets $name source metadata and its mapped canonical",
    ({ name, meta, seo, description }) => {
      expect(meta.title).toBe(seo);
      expect(meta.description).toBe(description);
      expect(meta.alternates?.canonical).toMatch(
        new RegExp(`/landing/${name.toLowerCase()}$`),
      );
    },
  );

  it("retains static contract anchor and download", () => {
    const markup = renderToStaticMarkup(<Approach />);
    expect(markup).toContain('id="outcome-contract"');
    expect(markup).toContain('href="/downloads/outcome-contract.txt" download');
  });
});

describe("native disclosure", () => {
  it("reflects pointer changes in aria-expanded", async () => {
    const { container } = render(
      <Disclosure question="What establishes completion?">
        <p>Evidence against agreed criteria.</p>
      </Disclosure>,
    );
    const summary = screen
      .getByText("What establishes completion?")
      .closest("summary")!;
    const details = container.querySelector("details")!;
    expect(summary).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(summary);
    await waitFor(() =>
      expect(summary).toHaveAttribute("aria-expanded", "true"),
    );
    expect(details.open).toBe(true);
    fireEvent.click(summary);
    await waitFor(() =>
      expect(summary).toHaveAttribute("aria-expanded", "false"),
    );
  });

  it.each(["Enter", " "])(
    "opens and closes from the keyboard with %s",
    (key) => {
      const { container } = render(
        <Disclosure question="Keyboard question">
          <p>Readable answer</p>
        </Disclosure>,
      );
      const summary = container.querySelector("summary")!;
      summary.focus();
      fireEvent.keyDown(summary, { key });
      expect(container.querySelector("details")).toHaveAttribute("open");
      expect(summary).toHaveAttribute("aria-expanded", "true");
      fireEvent.keyDown(summary, { key });
      expect(container.querySelector("details")).not.toHaveAttribute("open");
      expect(summary).toHaveFocus();
    },
  );

  it("renders its native control and complete answer without JavaScript", () => {
    const markup = renderToStaticMarkup(
      <Disclosure question="Static question">
        <p>Static answer remains in the document.</p>
      </Disclosure>,
    );
    expect(markup).toContain("<details");
    expect(markup).toContain("<summary");
    // Native semantics must stay authoritative when hydration never runs.
    expect(markup).not.toContain("aria-expanded");
    expect(markup).toContain("Static answer remains in the document.");
  });

  it("opens and focuses a direct disclosure hash, including later hash changes", () => {
    window.history.replaceState(null, "", "/landing/trust#missing-evidence");
    const { container } = render(
      <Disclosure id="missing-evidence" question="Missing evidence">
        <p>Recovery step</p>
      </Disclosure>,
    );
    expect(container.querySelector("details")).toHaveAttribute("open");
    expect(container.querySelector("summary")).toHaveFocus();
    cleanup();
    window.history.replaceState(null, "", "/landing/trust");
    const next = render(
      <Disclosure id="missing-evidence" question="Missing evidence">
        <p>Recovery step</p>
      </Disclosure>,
    );
    window.history.replaceState(null, "", "/landing/trust#missing-evidence");
    fireEvent(window, new Event("hashchange"));
    expect(next.container.querySelector("details")).toHaveAttribute("open");
    expect(next.container.querySelector("summary")).toHaveFocus();
  });

  it("keeps its summary at least 44px tall with the scoped stylesheet", () => {
    const style = document.createElement("style");
    style.textContent = readFileSync(
      new NodeURL("../../../../app/landing/marketing.css", import.meta.url),
      "utf8",
    );
    document.head.appendChild(style);
    try {
      const { container } = render(
        <div className="ek-site marketing-site">
          <Disclosure question="Sized question">
            <p>Answer</p>
          </Disclosure>
        </div>,
      );
      expect(
        Number.parseFloat(
          getComputedStyle(container.querySelector("summary")!).minHeight,
        ),
      ).toBeGreaterThanOrEqual(44);
    } finally {
      style.remove();
    }
  });
});
