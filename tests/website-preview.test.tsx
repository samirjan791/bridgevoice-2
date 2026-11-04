// @vitest-environment jsdom
import { it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { WebsitePreview } from "@/components/chat/WebsitePreview";

afterEach(() => cleanup());

const SITE = "<!doctype html><html><body><h1>Sample</h1></body></html>";

it("renders a sandboxed iframe preview with download and copy", () => {
  const { container } = render(<WebsitePreview html={SITE} index={0} />);
  const frame = container.querySelector("iframe");
  expect(frame).toBeTruthy();
  expect(frame?.getAttribute("sandbox")).toBe("allow-scripts");
  expect(frame?.getAttribute("srcdoc")).toContain("<h1>Sample</h1>");
  expect(screen.getByText("Website preview")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Download website.html" }),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "Copy code" })).toBeTruthy();
  expect(screen.getByText("View code")).toBeTruthy();
});
