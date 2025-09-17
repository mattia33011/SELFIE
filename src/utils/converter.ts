export const mapNote = (note: any) => ({
    ...note,
    children: note.children.map(mapNote),
    parent: Array.isArray(note.parent) ? note[0]._id : null,
    lastEdit: note.lastEdit ? new Date(note.lastEdit) : note.lastEdit,
  })