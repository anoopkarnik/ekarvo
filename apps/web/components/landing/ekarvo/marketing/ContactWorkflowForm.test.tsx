import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  ContactWorkflowEntry,
  ContactWorkflowForm,
} from "./ContactWorkflowForm";
let query = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(query),
}));
const id = "11111111-1111-4111-8111-111111111111";
const token = "22222222-2222-4222-8222-222222222222";
const receipt = {
  id,
  createdAt: "2026-10-29T12:00:00.000Z",
  deleteToken: token,
  message: "Your workflow request has been saved on this computer.",
};
const response = (body: unknown, status = 201) => ({
  ok: status < 400,
  status,
  json: async () => body,
});
function fill() {
  for (const [label, value] of [
    ["Name *", "Synthetic Reviewer"],
    ["Work email *", "review@example.test"],
    ["Organization *", "Synthetic Operations"],
    ["What work needs to be done? *", "Review synthetic records"],
  ])
    fireEvent.change(screen.getByLabelText(label!), { target: { value } });
}
const save = () =>
  fireEvent.click(
    screen.getByRole("button", { name: "Save workflow request" }),
  );
beforeEach(() => {
  query = "";
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:brief"),
      revokeObjectURL: vi.fn(),
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("Contact workflow form", () => {
  it.each(["operations-os", "autonomous-execution", "invalid"])(
    "preselects the query product %s with safe fallback",
    (product) => {
      query = `product=${product}`;
      render(<ContactWorkflowEntry />);
      expect(screen.getByLabelText("Product interest *")).toHaveValue(
        product === "invalid" ? "not-sure" : product,
      );
    },
  );
  it("focuses the linked error summary and associates field errors", async () => {
    render(<ContactWorkflowForm />);
    save();
    const summary = screen.getByRole("status");
    await waitFor(() => expect(summary).toHaveFocus());
    expect(
      screen.getByRole("link", { name: "Name: Complete this field." }),
    ).toHaveAttribute("href", "#name");
    expect(screen.getByLabelText("Name *")).toHaveAttribute(
      "aria-describedby",
      "name-error",
    );
    fireEvent.click(
      screen.getByRole("link", { name: "Name: Complete this field." }),
    );
    expect(screen.getByLabelText("Name *")).toHaveFocus();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("validates email, counts characters and hides the honeypot", () => {
    render(<ContactWorkflowForm />);
    fill();
    fireEvent.change(screen.getByLabelText("Work email *"), {
      target: { value: "bad" },
    });
    save();
    expect(
      screen.getByText("Email: Enter a valid email address."),
    ).toBeVisible();
    expect(screen.getByText("24 / 2000 characters")).toBeVisible();
    expect(
      screen.getByLabelText("Website", { selector: "input" }).closest(".hp"),
    ).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByLabelText("Website", { selector: "input" }),
    ).toHaveAttribute("tabindex", "-1");
  });
  it("disables pending fields and retries retained data with the same UUID", async () => {
    let reject!: (error: Error) => void;
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise((_, no) => {
          reject = no;
        }),
    );
    render(<ContactWorkflowForm initialProduct="operations-os" />);
    fill();
    save();
    expect(screen.getByRole("button", { name: /Saving…/ })).toBeDisabled();
    expect(screen.getByLabelText("Name *")).toBeDisabled();
    await act(async () => reject(new TypeError("offline")));
    expect(screen.getByRole("status")).toHaveTextContent(
      "The local server is unavailable. Your entries are still here. Please try again.",
    );
    expect(screen.getByLabelText("Name *")).toHaveValue("Synthetic Reviewer");
    vi.mocked(fetch).mockResolvedValueOnce(response(receipt) as Response);
    save();
    await screen.findByText("Your workflow request is saved.");
    const bodies = vi
      .mocked(fetch)
      .mock.calls.map((call) => JSON.parse(String(call[1]?.body)));
    expect(bodies[0].requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(bodies[0]).toEqual(bodies[1]);
  });
  it("keeps server field errors linked and values intact", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      response(
        {
          message: "Check the marked fields.",
          errors: { workflow: "Complete this field." },
        },
        422,
      ) as Response,
    );
    render(<ContactWorkflowForm />);
    fill();
    save();
    await screen.findByRole("link", { name: "Workflow: Complete this field." });
    expect(screen.getByLabelText("What work needs to be done? *")).toHaveValue(
      "Review synthetic records",
    );
  });
  it("starts a new UUID only on the explicit conflict action", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        response(
          { message: "This request changed after saving. Start a new brief." },
          409,
        ) as Response,
      )
      .mockResolvedValueOnce(response(receipt) as Response);
    render(<ContactWorkflowForm />);
    fill();
    save();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Start a new request with these entries",
      }),
    );
    save();
    await screen.findByText("Your workflow request is saved.");
    const calls = vi.mocked(fetch).mock.calls;
    expect(JSON.parse(String(calls[0]![1]?.body)).requestId).not.toBe(
      JSON.parse(String(calls[1]![1]?.body)).requestId,
    );
  });
  it("focuses receipt, downloads private receipt without honeypot and resets for another brief", async () => {
    const blobs: Blob[] = [];
    vi.mocked(URL.createObjectURL).mockImplementation((blob) => {
      blobs.push(blob as Blob);
      return "blob:brief";
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    vi.mocked(fetch).mockResolvedValueOnce(response(receipt) as Response);
    const view = render(<ContactWorkflowForm initialProduct="operations-os" />);
    fill();
    save();
    await screen.findByText("Your workflow request is saved.");
    expect(document.querySelector(".receipt")).toHaveFocus();
    expect(
      screen.getByRole("link", { name: "Manage your request" }),
    ).toHaveAttribute("href", "/landing/legal/privacy-policy#delete");
    fireEvent.click(
      screen.getByRole("button", { name: "Download brief & receipt" }),
    );
    const body = JSON.parse(await blobs[0]!.text());
    expect(body.receipt).toEqual(receipt);
    expect(body.website).toBeUndefined();
    expect(body.workflow).toBe("Review synthetic records");
    fireEvent.click(
      screen.getByRole("button", { name: "Create another brief" }),
    );
    expect(screen.getByLabelText("Name *")).toHaveValue("");
    expect(screen.getByLabelText("Product interest *")).toHaveValue(
      "operations-os",
    );
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:brief");
  });
  it("aborts on unmount and ignores a late response", async () => {
    let resolve!: (value: Response) => void;
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((yes) => {
          resolve = yes;
        }),
    );
    const view = render(<ContactWorkflowForm />);
    fill();
    save();
    const signal = vi.mocked(fetch).mock.calls[0]![1]?.signal;
    view.unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => resolve(response(receipt) as Response));
    expect(screen.queryByText("Your workflow request is saved.")).toBeNull();
  });
});
