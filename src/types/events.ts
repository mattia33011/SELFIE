export type Events = Event[]

export type Event = {
    title: string,
    expireDate: Date,
    description?: string,
    color?: "success" | "info" | "warn" | "danger" | "help"
  }

export type Notes = Note[]

export type Note = {
    label: string;
    author: string;
    members: string[];
    expanded: boolean;
    content: string;
    icon: string;
    children: Note[];
    type: 'note' | 'folder';
    parent: Note | string | null;
    droppableNode: boolean;
    lastEdit: Date;
    _id?: string; // Riceveremo stringa dal backend
    data?: string; // Per PrimeNG Tree
};

export function isEvent(e: Event | Note): e is Event{
    if(!e)
      return false
    return 'title' in e && 'expireDate' in e 
  }