import type mongoose from "mongoose"

declare global {
  var _mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

declare module "*.css" {
  const content: Record<string, string>
  export default content
}
