export type EventStatus = "upcoming" | "live" | "on-demand"

export interface EventSpeaker {
  name: string
  title: string
  company?: string
  avatarUrl?: string
}

export interface Event {
  id: string
  title: string
  category: string
  date: string
  time: string
  duration: string
  location: string
  level?: string
  status: EventStatus
  description: string
  summary?: string
  image?: string
  tags: string[]
  speakers: EventSpeaker[]
}

