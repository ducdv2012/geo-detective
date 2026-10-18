import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OutcomeCinematic } from "./OutcomeCinematic";

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe("OutcomeCinematic", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("uses the full capture duration and completes only once", () => {
    mockReducedMotion(false);
    const complete = vi.fn();
    render(
      <OutcomeCinematic
        kind="capture"
        final
        locale="vi"
        country="Việt Nam"
        onComplete={complete}
      />,
    );
    vi.advanceTimersByTime(2399);
    expect(complete).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(complete).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: /bỏ qua/i }));
    expect(complete).toHaveBeenCalledOnce();
  });

  it("shortens an intermediate escape and lets Escape skip it", () => {
    mockReducedMotion(false);
    const complete = vi.fn();
    const view = render(
      <OutcomeCinematic
        kind="escape"
        final={false}
        locale="en"
        country="Thailand"
        onComplete={complete}
      />,
    );
    expect(screen.getByText("TARGET RELOCATED")).toBeInTheDocument();
    vi.advanceTimersByTime(1399);
    expect(complete).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(complete).toHaveBeenCalledOnce();
    view.unmount();
    vi.runAllTimers();
    expect(complete).toHaveBeenCalledOnce();
  });

  it("collapses motion to 300ms when reduced motion is requested", () => {
    mockReducedMotion(true);
    const complete = vi.fn();
    render(
      <OutcomeCinematic
        kind="escape"
        final
        locale="vi"
        country="Lào"
        onComplete={complete}
      />,
    );
    vi.advanceTimersByTime(299);
    expect(complete).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(complete).toHaveBeenCalledOnce();
  });
});
