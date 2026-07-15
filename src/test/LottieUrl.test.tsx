import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// Mock lottie-react to avoid lottie-web accessing canvas in jsdom
vi.mock("lottie-react", () => ({
  default: ({ animationData }: { animationData: unknown }) => (
    <div data-testid="lottie-ready-mock">{animationData ? "ok" : "empty"}</div>
  ),
}));

import { LottieUrl } from "@/components/LottieUrl";

describe("LottieUrl", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;
    render(<LottieUrl src="https://example.com/a.json" className="h-10 w-10" />);
    expect(screen.getByTestId("lottie-loading")).toBeInTheDocument();
  });

  it("shows fallback on fetch failure", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("boom"))) as unknown as typeof fetch;
    render(<LottieUrl src="https://example.com/broken.json" className="h-10 w-10" />);
    await waitFor(() => expect(screen.getByTestId("lottie-fallback")).toBeInTheDocument());
  });

  it("shows fallback on non-ok response", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve({}) })
    ) as unknown as typeof fetch;
    render(<LottieUrl src="https://example.com/403.json" className="h-10 w-10" />);
    await waitFor(() => expect(screen.getByTestId("lottie-fallback")).toBeInTheDocument());
  });

  it("shows fallback on invalid JSON payload", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ notALottie: true }) })
    ) as unknown as typeof fetch;
    render(<LottieUrl src="https://example.com/bad.json" className="h-10 w-10" />);
    await waitFor(() => expect(screen.getByTestId("lottie-fallback")).toBeInTheDocument());
  });

  it("renders custom fallback when provided", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("nope"))) as unknown as typeof fetch;
    render(
      <LottieUrl
        src="https://example.com/x.json"
        className="h-10 w-10"
        fallback={<div data-testid="custom-fallback">custom</div>}
      />
    );
    await waitFor(() => expect(screen.getByTestId("custom-fallback")).toBeInTheDocument());
  });
});
