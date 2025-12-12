import type { Event } from "@/types/event"

/**
 * Parses a duration string (e.g., "90 minutes", "1 hour 30 minutes") and returns duration in minutes
 */
function parseDuration(duration: string): number {
  const durationLower = duration.toLowerCase()
  let totalMinutes = 0

  // Match hours
  const hourMatch = durationLower.match(/(\d+)\s*h(?:our)?s?/i)
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60
  }

  // Match minutes
  const minuteMatch = durationLower.match(/(\d+)\s*m(?:inute)?s?/i)
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10)
  }

  // If no matches found, try to extract just a number (assume minutes)
  if (totalMinutes === 0) {
    const numberMatch = durationLower.match(/(\d+)/)
    if (numberMatch) {
      totalMinutes = parseInt(numberMatch[1], 10)
    } else {
      // Default to 60 minutes if we can't parse
      totalMinutes = 60
    }
  }

  return totalMinutes
}

/**
 * Parses date and time strings to create a Date object
 * Handles formats like "Jan 24, 2025" and "10:00 AM PST"
 */
function parseEventDateTime(date: string, time: string): Date | null {
  try {
    // Parse the date string (e.g., "Jan 24, 2025")
    const dateMatch = date.match(/(\w+)\s+(\d+),\s+(\d+)/)
    if (!dateMatch) return null

    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ]
    const monthName = dateMatch[1].toLowerCase()
    const monthIndex = monthNames.findIndex((m) => m.startsWith(monthName))
    if (monthIndex === -1) return null

    const day = parseInt(dateMatch[2], 10)
    const year = parseInt(dateMatch[3], 10)

    // Parse the time string (e.g., "10:00 AM PST")
    const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!timeMatch) return null

    let hours = parseInt(timeMatch[1], 10)
    const minutes = parseInt(timeMatch[2], 10)
    const ampm = timeMatch[3].toUpperCase()

    if (ampm === "PM" && hours !== 12) {
      hours += 12
    } else if (ampm === "AM" && hours === 12) {
      hours = 0
    }

    return new Date(year, monthIndex, day, hours, minutes)
  } catch {
    return null
  }
}

/**
 * Formats a Date object to ICS format (YYYYMMDDTHHMMSS)
 * The Date object is already stored internally as UTC, so we can use UTC methods directly
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hours = String(date.getUTCHours()).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")
  const seconds = String(date.getUTCSeconds()).padStart(2, "0")
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Escapes text for ICS format
 */
function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

/**
 * Generates ICS file content for an event
 */
export function generateICS(event: Event): string {
  const startDate = parseEventDateTime(event.date, event.time)
  if (!startDate) {
    throw new Error("Unable to parse event date and time")
  }

  const durationMinutes = parseDuration(event.duration)
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)

  const now = new Date()
  const uid = `${event.id}-${now.getTime()}@event-hub`

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Event Hub//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description || event.summary || "")}`,
    `LOCATION:${escapeICS(event.location)}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ]

  return lines.join("\r\n")
}

/**
 * Downloads an ICS file
 * Works on both desktop and mobile browsers
 */
export function downloadICS(content: string, filename: string = "event.ics"): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  // Create a temporary anchor element
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.style.display = "none"

  // Append to body, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

