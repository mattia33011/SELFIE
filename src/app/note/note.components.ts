import { EditorModule } from 'primeng/editor'; // npm install quill
import { Card, CardModule } from 'primeng/card';
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MessageService, TreeNode, TreeDragDropService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { Tree } from 'primeng/tree';
import { ApiService } from '../service/api.service';
import {  Note } from '../../types/events';
import { SessionService } from '../service/session.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { TimeMachineService } from '../service/time-machine.service';

@Component({
  selector: 'notes',
  imports: [
    EditorModule,
    CardModule,
    EditorModule,
    CardModule,
    FormsModule,
    TreeModule,
    ButtonModule,
    ButtonGroupModule,
    InputTextModule,
    CommonModule,
    Tree,
    TranslatePipe,
    ContextMenuModule,
  ],
  templateUrl: './note.components.html',
  styleUrls: ['./note.components.css'],
  providers: [
    MessageService,
    TreeDragDropService,
    TranslateService,
    ApiService,
  ],
})
export class NoteComponent {

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private readonly apiService: ApiService,
    protected readonly sessionService: SessionService,
    protected timeMachine: TimeMachineService
  ) {
    Tree.prototype.allowDrop = (
      dragNode: any,
      dropNode: any,
      dragNodeScope: any
    ): boolean => {
      return this._overrideAllowDrop(dragNode, dropNode, dragNodeScope);
    };
  }

  @ViewChild(Tree) tree: Tree | undefined;
  @ViewChild('cm') cm!: ContextMenu;
  text: string | undefined;
  value: string | undefined;
  selectedNote: any = null;
  selectedFiles!: TreeNode[];
  files: Note[] = [];
  items: any[] =[];

  ngOnInit(): void {
    this.apiService
      .getNotes(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (apiNotes: any[]) => {
          this.files = apiNotes.map((it) => {
            if (it.lastEdit) it.lastEdit = new Date(it.lastEdit);
            return it;
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load notes',
          });
        },
      });
    this.items= [
    {
      label: this.translateService.instant('note.deleteNote'),
      icon: 'pi pi-trash',
      command: () => this.deleteNote(),
    },
    {

      label: this.translateService.instant('note.duplicateNote'),
      icon: 'pi pi-copy',
      command: () => {
        if(this.selectedNote.type=="folder"){
          return;
        }
        this.duplicateNote(this.selectedNote);
      },
    },
  ];
  }

  screenWidth: number = window.innerWidth;

  recentNotes: string[] = [];

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.screenWidth = (event.target as Window).innerWidth;
  }

 

  private _overrideAllowDrop(
    dragNode: any,
    dropNode: any,
    dragNodeScope: any
  ): boolean {
    // Blocca sempre le folder
    if (dragNode?.type === 'folder') return false;

    // Consenti drop solo dentro folder
    return dropNode?.type === 'folder';
  }

  openNote(event: any) {
    let note: Note | undefined;

    const findChildNote = this.findChildNote(event.node._id);

    this.files.forEach((it) => {
      if (note) return;
      note = findChildNote(it);
    });
    this.selectedNote = note;

    this.text =
      this.selectedNote.type != 'folder' ? this.selectedNote.content : '';
  }

  findChildNote = (idToFind: any) => (note: any) => {
    if (note._id == idToFind) return note;

    if (note.children && note.children.length > 0)
      return note.children.find(this.findChildNote(idToFind));

    return undefined;
  };

  onHide() {
    this.selectedNote = null;
    this.text = '';
  }

  addFolder(parentNode: any = null) {
    if (!this.value || this.value.trim() === '') {
      alert('Il nome non può essere vuoto');
      return;
    }

    const newFolder: Note = {
      label: this.value,
      expanded: true,
      content: '',
      type: 'folder',
      icon: 'pi pi-folder',
      children: [],
      parent: null,
      droppableNode: true,
      draggableNode: false,
      lastEdit: this.timeMachine.today() ?? new Date(),
    };

    const targetArray = this.files;
    targetArray.push(newFolder);

    this.apiService
      .pushNote(
        this.sessionService.getSession()!.user.username!,
        [newFolder],
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response: any) => {
          if (response?.[0]?._id) {
            newFolder._id = response[0]._id;
          }
          if (newFolder.parent) {
            this.selectedNote.children.push(newFolder._id);
            this.updateNote(this.selectedNote);
          }
          this.syncronizeNote();
        },
        error: (error) => console.error(error),
      });

    this.value = '';
  }
  duplicateNote(note: Note) {
    if (!note) {
      console.error('No note selected for duplication');
      return;
    }
    const duplicatedNote: Note = {
      label: `${note.label} (Copy)`,
      expanded: note.expanded,
      content: note.content,
      icon: note.icon,
      children: note.children ? [...note.children] : [],
      type: note.type,
      parent: null,
      droppableNode: note.droppableNode,
      _id: undefined, // Rimuovi l'ID per creare un nuovo documento
      lastEdit: this.timeMachine.today() ?? new Date(), // Aggiorna la data dell'ultima modifica
    };
    if (note.type === 'folder') {
      duplicatedNote.children = note.children ? [...note.children] : [];
    } else {
      duplicatedNote.content = note.content;
    }
    this.files.push(duplicatedNote);
    this.apiService
      .pushNote(
        this.sessionService.getSession()!.user.username!,
        [duplicatedNote],
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response: any) => {
          // Usa 'any' per la risposta
          if (response?.[0]?._id) {
            duplicatedNote._id = response[0]._id;
            this.syncronizeNote();
          }
        },
        error: (error) => console.error(error),
      });
  }
  addNote(parentNode: any = null) {
    if (this.value == null || this.value.trim() === '') {
      alert('Inserire un nome per la nota');
      return;
    }
    if (this.selectedNote && this.selectedNote.type == 'folder') {
      parentNode = this.selectedNote._id;
    }
    const newNote: Note = {
      label: this.value,
      expanded: true,
      content: 'Scrivi qui...',
      type: 'note',
      icon: 'pi pi-clipboard',
      children: [],
      parent: parentNode ? parentNode : null,
      droppableNode: true,
      lastEdit: this.timeMachine.today() ?? new Date(),
    };
    if (this.selectedNote && this.selectedNote.type === 'folder') {
      if (!this.selectedNote.children) {
        this.selectedNote.children = [];
      }
      this.selectedNote.children.push(newNote);
      newNote.parent = this.selectedNote._id;
    } else {
      this.files.push(newNote);
    }

    this.apiService
      .pushNote(
        this.sessionService.getSession()!.user.username!,
        [newNote],
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          if (newNote.parent) {
            this.selectedNote.children.push(newNote._id);
            this.updateNote(this.selectedNote);
          }
          this.syncronizeNote();
        },
        error: (error) => {
          console.log(error);
        },
      });

    this.value = '';
  }
  syncronizeNote() {
    this.apiService
      .getNotes(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (apiNotes: any[]) => {
          this.files = apiNotes.map((it) => {
            if (it.type == 'folder') return { ...it, draggableNode: false };

            return it;
          });
          console.log('Notes loaded:', this.files);
        },
        error: (error) => {
          console.error('Error loading notes:', error);
        },
      });
  }

  updateNote(noteUpdates: Note) {
    this.apiService
      .pushNote(
        this.sessionService.getSession()!.user.username!,
        [noteUpdates],
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  saveNote() {
    if (!this.selectedNote || this.selectedNote.type == 'folder') return;

    this.selectedNote.content = this.text;
    this.selectedNote.lastEdit = this.timeMachine.today();

    if (this.recentNotes.length > 5) {
      this.recentNotes.shift();
    }

    this.apiService
      .saveNote(
        this.sessionService.getSession()!.user.username!,
        this.selectedNote._id,
        this.selectedNote.content,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          console.log('Note saved', response);
          this.syncronizeNote();
        },
        error: (error) => {
          this.syncronizeNote();
          console.error('Save error', error);
        },
      });
  }

  deleteNote(note: Note | null = null) {
    try {
      const noteToDelete = note || this.selectedNote;

      if (!noteToDelete) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'No note selected for deletion',
        });
        return;
      }

      if (!noteToDelete._id) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Note has no valid ID',
        });
        return;
      }

      // Delete from backend
      this.apiService
        .deleteNote(
          this.sessionService.getSession()!.user.username!,
          noteToDelete._id,
          this.sessionService.getSession()!.token!
        )
        .subscribe({
          next: (response) => {
            // Remove from frontend structure
            this.syncronizeNote();
            this.selectedNote = null;
            this.text = '';
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Note deleted successfully',
            });
          },
          error: (error) => {
            console.error('Delete error', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete note',
            });
          },
        });
    } catch (error) {
      console.error('Error in deleteNote:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred',
      });
    }
  }

  onContextMenu(event: any, note: Note) {
    if (!note?._id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Cannot select note - missing ID',
      });
      return;
    }
    this.selectedNote = note;
    this.cm.show(event);
  }

  private getChildNotes(parent: Note): Note[] {
    if (!parent.children) return [];

    return parent.children
      .map((childId) => this.findNoteById(childId))
      .filter((note) => note !== null) as Note[];
  }

  private findNoteById(id: any, notes: Note[] = this.files): Note | null {
    for (const note of notes) {
      if (note._id?.toString() === id?.toString()) return note;

      if (note.children && note.children.length > 0) {
        const childNotes = this.getChildNotes(note);
        const found = this.findNoteById(id, childNotes);
        if (found) return found;
      }
    }
    return null;
  }
  onNodeDrop(event: any): void {
    const dragNode = event.dragNode;
    const dropNode = event.dropNode;
    if (!dragNode || !dropNode) return;
    const isSameFile = dragNode._id == dropNode._id;
    console.log('draggable', event);
    console.log('folder', dropNode);
    if (dragNode.parent == undefined) console.log('si');
    console.log('event.dragNode.parent', dragNode.parent);
    console.log('found same', event.dropNode.children.includes(event.dragNode));
    if (!event.dropNode.children.includes(event.dragNode)) {
      event.dropNode.children.push(event.dragNode);
    }

    if (event.dragNode.type == 'folder') return;

    this.apiService
      .patchNote(
        this.sessionService.getSession()!.user.username!,
        event.dragNode._id,
        event.dropNode._id,
        this.sessionService.getSession()!.token!
      )
      .subscribe({
        next: (response) => {
          console.log('Node moved successfully', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Note moved successfully',
          });
        },
        error: (error) => {
          console.error('Move error', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to move note',
          });
        },
      });
  }
}
