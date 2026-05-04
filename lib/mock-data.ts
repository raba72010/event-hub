import type { Event } from "@/types/event"

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Strategic Planning Workshop",
    category: "Strategic Planning",
    date: "Dec 10, 2026",
    time: "06:00 PM",
    duration: "2 hours",
    location: "Virtual",
    status: "upcoming",
    description: "Learn the fundamentals of strategic planning and how to apply them to your organization.",
    tags: ["Strategy", "Management", "Leadership"],
    speakers: [{ name: "Ahmed Ali", title: "Strategy Consultant" }]
  },
  {
    id: "2",
    title: "Introduction to Artificial Intelligence",
    category: "Artificial Intelligence",
    date: "Dec 15, 2026",
    time: "07:00 PM",
    duration: "1.5 hours",
    location: "Virtual",
    status: "upcoming",
    description: "A beginner-friendly introduction to AI concepts and real-world applications.",
    tags: ["AI", "Technology", "Future"],
    speakers: [{ name: "Sara Hassan", title: "AI Researcher" }]
  },
  {
    id: "3",
    title: "Project Management Essentials",
    category: "Project Management",
    date: "Nov 20, 2026",
    time: "05:00 PM",
    duration: "3 hours",
    location: "Virtual",
    status: "on-demand",
    description: "Master the basics of project management from planning to execution.",
    tags: ["PMP", "Agile", "Scrum"],
    speakers: [{ name: "Omer Yasin", title: "Senior Project Manager" }]
  }
]
