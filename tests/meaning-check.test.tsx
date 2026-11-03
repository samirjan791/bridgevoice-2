// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { meaningAnchors, compareUnderstanding, clarificationQuestions } from "@/lib/meaning-check";
import { MeaningCheck, meaningExample } from "@/components/chat/MeaningCheck";
afterEach(cleanup);
describe("Source-grounded Meaning Check", () => {
  it("keeps exact original offsets including mixed scripts", () => {
    const source = "مه: take ۵ mg only if requested. Do not take two tablets.";
    const anchors = meaningAnchors(source);
    expect(anchors.length).toBeGreaterThan(4);
    for (const a of anchors) expect(source.slice(a.start,a.end)).toBe(a.text);
    for (let i=1;i<anchors.length;i++) expect(anchors[i].start).toBeGreaterThanOrEqual(anchors[i-1].end);
  });
  it("does not mistake Arabic-script word fragments for negation", () => {
    expect(meaningAnchors("خانه").filter(a => a.kind === "negation")).toEqual([]);
  });
  it.each([
    ["Do not take two tablets.","Take two tablets.","negation-mismatch"],
    ["Take 5 mg.","Take 50 mg.","number-mismatch"],
    ["Take 5 mg every 2 hours.","Take 2 mg every 5 hours.","binding"],
    ["Call if you feel dizzy.","Call the clinic.","condition"],
    ["Take 5 mg daily.","Take 5 mg weekly.","frequency"],
    ["Take 5 mg.","Take 5 mcg.","unit-check"],
  ])("flags defined discrepancy: %s", (a,b,id) => {
    expect(compareUnderstanding(a,b,"en","en").map(x=>x.id)).toContain(id);
  });
  it("recognizes identical instructions without certifying safety", () => {
    expect(compareUnderstanding(meaningExample,meaningExample,"en","en")).toEqual([]);
  });
  it("recognizes digit equivalence across scripts", () => {
    expect(compareUnderstanding("5","۵","en","fa-AF")).toEqual([]);
  });
  it("asks for missing context without inventing details", () => {
    expect(clarificationQuestions("Take it as needed.")).toHaveLength(2);
    expect(clarificationQuestions("The result is positive.")[0]).toContain("context");
    expect(clarificationQuestions("Due tomorrow")[0]).toContain("exact deadline");
  });
  it("does not infer a dose from an empty source", () => {
    expect(meaningAnchors("")).toEqual([]);
    expect(clarificationQuestions("")).toEqual([]);
  });
  it("runs fictional omission, review, and correction workflow", () => {
    render(<MeaningCheck source={meaningExample} demo />);
    fireEvent.click(screen.getByText("Try a deliberate omission"));
    fireEvent.click(screen.getByText("Check important details"));
    expect(screen.getByText(/Possible missing or added negation/)).toBeTruthy();
    expect(screen.getByText(/condition may have been/)).toBeTruthy();
    fireEvent.click(screen.getByText("Mark reviewed by me"));
    expect(screen.getByText("Marked reviewed by you").getAttribute("aria-pressed")).toBe("true");
    fireEvent.change(screen.getByLabelText("In your own words, what does this mean?"),{target:{value:meaningExample}});
    expect(screen.queryByText("Marked reviewed by you")).toBeNull();
    fireEvent.click(screen.getByText("Check important details"));
    expect(screen.getByText("No differences detected by these limited checks")).toBeTruthy();
    expect(screen.getByText(/cannot confirm complete meaning or safety/)).toBeTruthy();
  });
  it("sends explicit language and passages to semantic review handler only on click", () => {
    const review=vi.fn();
    render(<MeaningCheck source="Take 5 mg." onReview={review} demo />);
    fireEvent.change(screen.getByLabelText("In your own words, what does this mean?"),{target:{value:"۵ mg"}});
    fireEvent.change(screen.getByLabelText("Your explanation’s language"),{target:{value:"fa-AF"}});
    fireEvent.click(screen.getByText("Check important details"));
    expect(review).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Ask Meta to review meaning"));
    expect(review).toHaveBeenCalledWith("Take 5 mg.","۵ mg","en","fa-AF");
  });
  it("renders HTML-looking input as text", () => {
    const {container}=render(<MeaningCheck source={'<script>alert(1)</script> 5 mg'} demo />);
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("blockquote")?.textContent).toBe('<script>alert(1)</script> 5 mg');
  });
  it("requires a nonblank restatement", () => {
    render(<MeaningCheck source="A letter" demo />);
    expect((screen.getByText("Check important details") as HTMLButtonElement).disabled).toBe(true);
  });
});
