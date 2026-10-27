import React from "react";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SiteFooter, SiteHeader } from "./SiteChrome";

const route = vi.hoisted(() => ({ pathname: "/landing" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

const destinations = [
  ["Products", "/landing/products"],
  ["Approach", "/landing/approach"],
  ["Platform", "/landing/platform"],
  ["Trust", "/landing/trust"],
  ["Company", "/landing/company"],
];

beforeEach(() => { route.pathname = "/landing"; });
afterEach(cleanup);

function openMenu(container: HTMLElement) {
  const menu = container.querySelector("details")!;
  menu.open = true;
  return menu;
}

describe("marketing navigation", () => {
  it("links desktop and mobile navigation to the canonical marketing pages", () => {
    const { container } = render(<SiteHeader />);
    openMenu(container);
    for (const name of ["Main navigation", "Mobile navigation"]) {
      const nav = within(screen.getByRole("navigation", { name }));
      expect(nav.getAllByRole("link").slice(0, 5).map((link) => [link.textContent, link.getAttribute("href")])).toEqual(destinations);
    }
    for (const link of screen.getAllByRole("link", { name: "Discuss a workflow" })) {
      expect(link).toHaveAttribute("href", "/landing/contact");
    }
    for (const link of screen.getAllByRole("link", { name: "Log in" })) {
      expect(link).toHaveAttribute("href", "/sign-in");
    }
    expect(screen.getByRole("link", { name: "Ekarvo home" })).toHaveAttribute("href", "/landing");
  });

  it("gives the desktop Login action at least a 44px inline target", () => {
    const style = document.createElement("style");
    style.textContent = readFileSync(new NodeURL("../../../app/landing/marketing.css", import.meta.url), "utf8");
    document.head.appendChild(style);
    try {
      const { container } = render(<div className="ek-site theme-ekarvo marketing-site"><SiteHeader /></div>);
      const login = container.querySelector<HTMLAnchorElement>(".header-login")!;
      expect(Number.parseFloat(getComputedStyle(login).minInlineSize)).toBeGreaterThanOrEqual(44);
    } finally {
      style.remove();
    }
  });

  it("marks the current product section in both menus on product detail routes", () => {
    route.pathname = "/landing/products/operations-os";
    const { container } = render(<SiteHeader />);
    openMenu(container);
    for (const link of screen.getAllByRole("link", { name: "Products" })) {
      expect(link).toHaveAttribute("aria-current", "page");
    }
    expect(screen.getAllByRole("link", { name: "Platform" })[0]).not.toHaveAttribute("aria-current");
  });

  it.each(["Approach", "Platform", "Trust", "Company"])("marks the current %s route", (label) => {
    route.pathname = `/landing/${label.toLowerCase()}`;
    const { container } = render(<SiteHeader />);
    openMenu(container);
    expect(screen.getAllByRole("link", { name: label }).every((link) => link.getAttribute("aria-current") === "page")).toBe(true);
  });

  it("closes the mobile menu on Escape and returns focus to its summary", () => {
    const { container } = render(<SiteHeader />);
    const menu = openMenu(container);
    const summary = container.querySelector("summary")!;
    const link = within(screen.getByRole("navigation", { name: "Mobile navigation" })).getByRole("link", { name: "Products" });
    link.focus();
    fireEvent.keyDown(link, { key: "Escape" });
    expect(menu.open).toBe(false);
    expect(summary).toHaveFocus();
  });

  it("closes an open menu on Escape even after focus moves outside the header", () => {
    const { container } = render(<><SiteHeader /><main tabIndex={-1}>Page content</main></>);
    const menu = openMenu(container);
    const main = screen.getByRole("main");
    main.focus();
    fireEvent.keyDown(main, { key: "Escape" });
    expect(menu.open).toBe(false);
    expect(container.querySelector("summary")).toHaveFocus();
  });

  it("closes the mobile menu when a destination is selected", () => {
    const { container } = render(<SiteHeader />);
    const menu = openMenu(container);
    fireEvent.click(within(screen.getByRole("navigation", { name: "Mobile navigation" })).getByRole("link", { name: "Products" }));
    expect(menu.open).toBe(false);
  });

  it("keeps marketing navigation but omits Login on sign-in", () => {
    route.pathname = "/sign-in";
    const { container } = render(<><SiteHeader /><SiteFooter /></>);
    openMenu(container);
    expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "Main navigation" })).getAllByRole("link")).toHaveLength(5);
  });

  it("uses product, company, contact and existing legal destinations in the footer", () => {
    render(<SiteFooter />);
    for (const [name, href] of [
      ["Ekarvo Pulse", "/landing/products/operations-os"],
      ["Ekarvo Drive", "/landing/products/autonomous-execution"],
      ["The shared platform", "/landing/platform"],
      ["Our approach", "/landing/approach"],
      ["Trust & control", "/landing/trust"],
      ["Company", "/landing/company"],
      ["Discuss a workflow", "/landing/contact"],
      ["Privacy", "/landing/legal/privacy-policy"],
      ["Terms", "/landing/legal/terms-of-service"],
      ["Refunds", "/landing/legal/cancellation-refund-policies"],
    ]) expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
  });
});

describe("marketing shell and primitives", () => {
  it("provides a scoped page with a skip link and an explicit active section", async () => {
    const { MarketingShell } = await import("./marketing/MarketingShell");
    const { container } = render(<MarketingShell active="Company"><h1>Our company</h1></MarketingShell>);
    expect(container.firstChild).toHaveClass("ek-site", "theme-ekarvo");
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
    expect(within(screen.getByRole("main")).getByRole("heading", { level: 1 })).toHaveTextContent("Our company");
    expect(within(screen.getByRole("navigation", { name: "Main navigation" })).getByRole("link", { name: "Company" })).toHaveAttribute("aria-current", "page");
  });

  it("preserves the cinematic theme hook when requested", async () => {
    const { MarketingShell } = await import("./marketing/MarketingShell");
    const { container } = render(<MarketingShell cinematic><h1>Story</h1></MarketingShell>);
    expect(container.firstChild).toHaveClass("cinematic-home", "dark");
    expect(screen.getByRole("banner")).toHaveClass("site-header--cinematic");
  });

  it("renders editorial content and routes product and workflow actions canonically", async () => {
    const { PageHero, MarketingCTA, ProductLink } = await import("./marketing/primitives");
    render(<>
      <PageHero eyebrow="THE PLATFORM" title="One connected path." body="Insight, action and assurance."><p>Supporting detail</p></PageHero>
      <ProductLink href="/products/operations-os">Explore Pulse</ProductLink>
      <MarketingCTA />
    </>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("One connected path.");
    expect(screen.getByText("THE PLATFORM")).toBeInTheDocument();
    expect(screen.getByText("Insight, action and assurance.")).toBeInTheDocument();
    expect(screen.getByText("Supporting detail")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Pulse" })).toHaveAttribute("href", "/landing/products/operations-os");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Which workflow should change first?");
    expect(screen.getByRole("link", { name: "Discuss a workflow" })).toHaveAttribute("href", "/landing/contact");
  });

  it("maps marketing paths without double-prefixing canonical destinations", async () => {
    const { marketingHref } = await import("./marketing/navigation");
    expect(marketingHref("/")).toBe("/landing");
    expect(marketingHref("products")).toBe("/landing/products");
    expect(marketingHref("/landing/products")).toBe("/landing/products");
  });
});
