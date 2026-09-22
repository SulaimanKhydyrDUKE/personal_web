import { describe, expect, it } from "vitest"
import { buildFacts, buildSystemPrompt } from "./chat-context"
import { projects } from "@/app/data/projects"

describe("assistant grounding", () => {
  it("instructs the model to answer only from the facts and to admit gaps", () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toContain("Answer only from the Facts section")
    expect(prompt).toContain("say you don't have that information")
    expect(prompt).toContain("Never invent projects, achievements, dates, metrics, affiliations, or links")
  })

  it("renders every project from the data file into the facts", () => {
    const facts = buildFacts()
    for (const project of projects) expect(facts).toContain(project.title)
  })

  it("is deterministic, so the cached prompt prefix stays stable", () => {
    expect(buildSystemPrompt()).toBe(buildSystemPrompt())
  })
})
