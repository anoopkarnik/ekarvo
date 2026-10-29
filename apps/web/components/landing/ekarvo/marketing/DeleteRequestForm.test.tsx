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
import { renderToString } from "react-dom/server";
import { DeleteRequestForm } from "./DeleteRequestForm";
const id = "11111111-1111-4111-8111-111111111111",
  token = "22222222-2222-4222-8222-222222222222";
function fill() {
  fireEvent.change(screen.getByLabelText("Request ID"), {
    target: { value: id },
  });
  fireEvent.change(screen.getByLabelText("Deletion token"), {
    target: { value: token },
  });
}
const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "Delete saved request" }));
const response = (message: string, status = 200) =>
  ({ ok: status < 400, json: async () => ({ message }) }) as Response;
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  window.history.replaceState(null, "", "/landing/legal/privacy-policy");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Saved request deletion", () => {
  it("renders static disabled controls, then enables after hydration", () => {
    expect(renderToString(<DeleteRequestForm />)).toContain('disabled=""');
    render(<DeleteRequestForm />);
    expect(
      screen.getByRole("button", { name: "Delete saved request" }),
    ).toBeEnabled();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
  it("validates both UUID fields and focuses linked errors without a request", async () => {
    render(<DeleteRequestForm />);
    fireEvent.change(screen.getByLabelText("Request ID"), {
      target: { value: "bad" },
    });
    submit();
    await waitFor(() => expect(screen.getByRole("status")).toHaveFocus());
    expect(screen.getByLabelText("Request ID")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    fireEvent.click(screen.getByRole("link", { name: /^Request ID:/ }));
    expect(screen.getByLabelText("Request ID")).toHaveFocus();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("locks pending controls and clears receipt after success", async () => {
    let resolve!: (value: Response) => void;
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((yes) => {
          resolve = yes;
        }),
    );
    render(<DeleteRequestForm />);
    fill();
    submit();
    expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
    expect(screen.getByLabelText("Request ID")).toBeDisabled();
    await act(async () =>
      resolve(response("The saved request has been deleted.")),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "The saved request has been deleted.",
    );
    expect(screen.getByLabelText("Request ID")).toHaveValue("");
    expect(screen.getByLabelText("Deletion token")).toHaveValue("");
    expect(
      JSON.parse(String(vi.mocked(fetch).mock.calls[0]![1]?.body)),
    ).toEqual({ id, token });
  });
  it.each([404, 422, 503])("retains receipt for status %s", async (status) => {
    vi.mocked(fetch).mockResolvedValue(response("Receipt not removed", status));
    render(<DeleteRequestForm />);
    fill();
    submit();
    await screen.findByText("Receipt not removed");
    expect(screen.getByLabelText("Request ID")).toHaveValue(id);
    expect(screen.getByLabelText("Deletion token")).toHaveValue(token);
  });
  it("retains values when server unavailable", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("offline"));
    render(<DeleteRequestForm />);
    fill();
    submit();
    await screen.findByText("The server is unavailable. Please try again.");
    expect(screen.getByLabelText("Deletion token")).toHaveValue(token);
  });
  it("focuses direct hash entry and later hash navigation", () => {
    window.history.replaceState(
      null,
      "",
      "/landing/legal/privacy-policy#delete",
    );
    render(<DeleteRequestForm />);
    expect(document.getElementById("delete")).toHaveFocus();
    screen.getByLabelText("Request ID").focus();
    fireEvent(window, new HashChangeEvent("hashchange"));
    expect(document.getElementById("delete")).toHaveFocus();
  });
  it("aborts unmount and ignores late success", async () => {
    let resolve!: (value: Response) => void;
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((yes) => {
          resolve = yes;
        }),
    );
    const view = render(<DeleteRequestForm />);
    fill();
    submit();
    const signal = vi.mocked(fetch).mock.calls[0]![1]?.signal;
    view.unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () =>
      resolve(response("The saved request has been deleted.")),
    );
    expect(
      screen.queryByText("The saved request has been deleted."),
    ).toBeNull();
  });
});
