export type Events = Event[]

export type Event = {
    title: string,
    expireDate: Date,
    description?: string,
    color?: "success" | "info" | "warn" | "danger" | "help"
  }

export type Notes = Note[]

export type Note = {
    title: string,
    lastEdit: Date,
    created: Date,
    content: string,
    color?: "success" | "info" | "warn" | "danger" | "help"
}


export function isEvent(e: Event | Note): e is Event{
    if(!e)
      return false
    return 'title' in e && 'expireDate' in e 
  }