export type Events = Event[]

export type Event = {
    title: string,
    expireDate: Date,
    description?: string,
    color?: "success" | "info" | "warn" | "danger" | "help"
  }