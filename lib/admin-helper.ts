import mongoose from "mongoose"

/**
 * Converts a user ID to a valid MongoDB ObjectId.
 * Handles the special case of "admin-user" by creating a consistent ObjectId.
 */
export function getUserObjectId(userId: string): mongoose.Types.ObjectId {
  // If it's the special admin-user string, create a consistent ObjectId from it
  if (userId === "admin-user") {
    // Create a deterministic ObjectId for admin-user
    // Using a fixed 24-character hex string
    return new mongoose.Types.ObjectId("000000000000000000000001")
  }

  // For regular users, convert their ID string to ObjectId
  try {
    return new mongoose.Types.ObjectId(userId)
  } catch (error) {
    // If conversion fails, throw a descriptive error
    throw new Error(`Invalid user ID format: ${userId}`)
  }
}
