import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router";
import { LandingPage } from "./LandingPage";

describe("LandingPage", () => {
  it("renders the updated section headings", () => {
render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /see the full picture without the noise/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /built to help you decide/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^how it works$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /what readers say/i })
    ).toBeInTheDocument();
  });

  it("does not include dark variants on top-level landing containers", () => {
const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    const landingRoot = container.querySelector("[data-landing]");
    expect(landingRoot).toBeTruthy();

    // Check only the container and its immediate section wrappers we control
    const immediateChildren = landingRoot ? Array.from(landingRoot.children) : [];
    const nodesToCheck = [landingRoot!, ...immediateChildren];

    for (const node of nodesToCheck) {
      const className = (node as HTMLElement).className ?? "";
      expect(className).not.toContain("dark:");
    }
  });
});
