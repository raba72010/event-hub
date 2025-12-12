import type { Event } from "@/types/event"

export const events: Event[] = [
  {
    id: "ux-masterclass",
    title: "Designing for Human Attention",
    category: "UX Strategy",
    date: "Jan 24, 2025",
    time: "10:00 AM PST",
    duration: "90 minutes",
    location: "Virtual webinar",
    level: "Intermediate",
    status: "upcoming",
    summary: "A live teardown of real-world flows to reduce friction and increase engagement.",
    description:
      "Learn proven techniques for designing interfaces that respect human attention. We will review onboarding, notification, and retention flows from leading SaaS products, and distill repeatable patterns you can apply immediately.",
    tags: ["Product Design", "Research", "Conversion"],
    image: "/window.svg",
    speakers: [
      { name: "Ava Chen", title: "Director of Product Design", company: "Northwind" },
      { name: "Luis Romero", title: "Head of Research", company: "Skyline Labs" },
    ],
  },
  {
    id: "ai-content",
    title: "Building an AI Content Pipeline",
    category: "AI & Automation",
    date: "Feb 6, 2025",
    time: "9:00 AM PST",
    duration: "75 minutes",
    location: "Virtual webinar",
    level: "Beginner",
    status: "upcoming",
    summary: "From prompts to publishing: see the exact stack we use to keep quality high.",
    description:
      "See how modern marketing teams combine LLMs, editorial workflows, and QA to ship trustworthy content at scale. We will cover tooling, review checklists, and guardrails for brand safety.",
    tags: ["LLM", "Content Ops", "Automation"],
    image: "/globe.svg",
    speakers: [
      { name: "Riley Patel", title: "Marketing Ops Lead", company: "DeltaWorks" },
      { name: "Morgan Lee", title: "Staff ML Engineer", company: "Helix" },
    ],
  },
  {
    id: "analytics",
    title: "Product Analytics That Drives Roadmaps",
    category: "Data",
    date: "Feb 19, 2025",
    time: "11:00 AM PST",
    duration: "80 minutes",
    location: "Virtual webinar",
    level: "Advanced",
    status: "on-demand",
    summary: "Map metrics to decisions and make instrumentation a habit, not a sprint.",
    description:
      "This session shows how leading teams connect analytics to product bets. We will walk through defining north-star metrics, building durable dashboards, and running experiments without slowing delivery.",
    tags: ["Analytics", "Experimentation", "Product"],
    image: "/file.svg",
    speakers: [
      { name: "Jamie Fox", title: "VP of Product", company: "Harbor" },
      { name: "Tessa Nguyen", title: "Principal Data Scientist", company: "Signalry" },
    ],
  },
]

export const featuredEvent = events[0]

