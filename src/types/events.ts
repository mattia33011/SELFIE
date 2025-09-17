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
    expanded: boolean;
    content: string;
    icon: string;
    children: string[] | Object[];
    type: 'note' | 'folder';
    parent: string | null;
    droppableNode: boolean;
    draggableNode?: boolean
    lastEdit: Date;
    _id?: string;
    data?: string;
};
export function isEvent(e: Event | Note): e is Event{
    if(!e)
      return false
    return 'title' in e && 'expireDate' in e 
  }