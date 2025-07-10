export type Events = Event[]

export type Event = {
    title: string,
    expireDate: Date,
    description?: string,
    color?: "success" | "info" | "warn" | "danger" | "help"
  }

export type Notes = Note[]

export type Note = {
    label: string, 
    expanded: boolean,
    content: string,
    type: string,
    icon: string,
    children: Notes,
    parent: Note,
    droppableNode: boolean,
    lastEdit: Date,
    _id?: string
}


export function isEvent(e: Event | Note): e is Event{
    if(!e)
      return false
    return 'title' in e && 'expireDate' in e 
  }