import { supabase } from "@/lib/supabase"

/**
 * Check if an event is favorited by the current user
 */
export async function isEventFavorited(eventId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" which is expected
    console.error("Error checking favorite:", error)
    return false
  }

  return !!data
}

/**
 * Toggle favorite status for an event
 * Returns the new favorite state (true if favorited, false if unfavorited)
 */
export async function toggleFavorite(eventId: string, userId: string): Promise<boolean> {
  // Check if already favorited
  const isFavorited = await isEventFavorited(eventId, userId)

  if (isFavorited) {
    // Remove from favorites
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error removing favorite:", error)
      throw error
    }

    return false
  } else {
    // Add to favorites
    const { error } = await supabase.from("favorites").insert({
      event_id: eventId,
      user_id: userId,
    })

    if (error) {
      console.error("Error adding favorite:", error)
      throw error
    }

    return true
  }
}

/**
 * Get all favorited event IDs for a user
 */
export async function getFavoritedEventIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("event_id")
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching favorites:", error)
    return []
  }

  return data.map((row) => row.event_id.toString())
}

