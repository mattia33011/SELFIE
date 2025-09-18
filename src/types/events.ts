export  type CalendarEvent = {
  title: string;
  color?: string;
  start?: Date | string;
  end?: Date | string;
  allDay?: boolean;
  _id: string;
  extendedProps?: {
    luogo?: string;
    tipo?: 'attività' | 'evento';
    stato?: 'da_fare' | 'in_corso' | 'completata';
  };
}

export type Events = CalendarEvent[];



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
export function isEvent(e: CalendarEvent | Note): e is CalendarEvent{
    if(!e)
      return false
    return 'title' in e && 'end' in e 
  }