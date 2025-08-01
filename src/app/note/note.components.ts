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
import {ApiService} from '../service/api.service';
import { Notes, Note} from '../../types/events';
import {SessionService} from '../service/session.service';
import {forkJoin, Observable} from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {stringToDate} from '../../utils/timeConverter';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';

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
        ContextMenuModule
    ],
    templateUrl: './note.components.html',
    styleUrls: ['./note.components.css'],
    providers: [MessageService, TreeDragDropService, TranslateService, ApiService],
})
export class NoteComponent {
    @ViewChild(Tree) tree: Tree | undefined;   
    @ViewChild('cm') cm!: ContextMenu;
    text: string | undefined;
    value: string | undefined;
    selectedNote: any = null;
    selectedFiles!: TreeNode[];
    files: Note[] = [];
    items: any[] = [
        {
            label: 'Delete Note',
            icon: 'pi pi-trash',
            command: () => this.deleteNote()
        },{
            label: 'duplicate Note',
            icon: 'pi pi-copy',
            command: () => {this.duplicateNote(this.selectedNote);
            }
        }        
    ];

ngOnInit(): void {
    
    this.apiService.getNotes(
        this.sessionService.getSession()!.user.username!,
        this.sessionService.getSession()!.token!
    ).subscribe({
        next: (apiNotes: any[]) => {
            this.files = apiNotes;
            console.log('Notes loaded:', this.files);
        },
        error: (error) => {
            console.error('Error loading notes:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load notes'
            });
        }
    });
}



    screenWidth: number = window.innerWidth;
    
    recentNotes: string[] = [];


    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.screenWidth = (event.target as Window).innerWidth;
    }

    constructor(private messageService: MessageService, private readonly apiService: ApiService, protected readonly sessionService: SessionService) {
        Tree.prototype.allowDrop = (dragNode: any, dropNode: any, dragNodeScope: any): boolean => {
            return this._overrideAllowDrop(dragNode, dropNode, dragNodeScope);
        }; 
    }

    private _overrideAllowDrop(dragNode: any, dropNode: any, dragNodeScope: any): boolean {
        if (!dropNode) {
            return true; 
        }
        return dropNode.type === 'folder';
    }
    



    openNote(event: any) {
        if (event.node.type === 'note') {
            this.selectedNote = event.node;
            this.text = this.selectedNote.content;
        } else {
            this.selectedNote = event.node;
            this.text = '';
        }
    }
    /*
    onContextMenu(event: any, Note: Note) {
        this.selectedNote = Note;
        this.cm.show(event);
    }
        */
    onHide() {
        this.selectedNote = null;
        this.text = '';
    }


addFolder(parentNode: any = null) {
    if (!this.value || this.value.trim() === '') {
        alert("name cannot be empty");
        return;
    }
    if(this.selectedNote && this.selectedNote.type == 'folder') {
        parentNode = this.selectedNote;
    }

    const newFolder: Note = {
        label: this.value,
        expanded: true,
        content: '',
        type: 'folder',
        icon: 'pi pi-folder',
        children: [],
        parent: parentNode ? parentNode._id : null,
        droppableNode: true,
        lastEdit: new Date(),
    };

    // Add to the appropriate parent or root
    const targetArray = parentNode ? parentNode.children : this.files;
    targetArray.push(newFolder);

    this.apiService.pushNote(
        this.sessionService.getSession()!.user.username!, 
        [newFolder], 
        this.sessionService.getSession()!.token!
    ).subscribe({
        next: (response: any) => {
            if (response?.[0]?._id) {
                newFolder._id = response[0]._id;
            }
            if(newFolder.parent){
                this.selectedNote.children.push(newFolder._id);
                this.updateNote(this.selectedNote);
            }
            
        },
        error: (error) => console.error(error)
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
        parent: note.parent,
        droppableNode: note.droppableNode,
        _id: undefined, // Rimuovi l'ID per creare un nuovo documento
        lastEdit: new Date() // Aggiorna la data dell'ultima modifica
    };
    if (note.type === 'folder') {
        duplicatedNote.children = note.children ? [...note.children] : [];
    } else {
        duplicatedNote.content = note.content;
    }
    this.files.push(duplicatedNote);
    this.apiService.pushNote(
        this.sessionService.getSession()!.user.username!, 
        [duplicatedNote], 
        this.sessionService.getSession()!.token!
    ).subscribe({
        next: (response: any) => {  // Usa 'any' per la risposta
            if (response?.[0]?._id) {
                duplicatedNote._id = response[0]._id;
                
            }
        },
        error: (error) => console.error(error)
    });
}
    addNote(parentNode: any = null) {
        if (this.value == null || this.value.trim() === '') {
            alert("Inserire un nome per la nota");
            return;
        }
         if(this.selectedNote && this.selectedNote.type == 'folder') {
             parentNode = this.selectedNote;
        }
        const newNote: Note =    {
            label: this.value,
            expanded: true,
            content: 'Scrivi qui...',
            type: 'note',
            icon: 'pi pi-clipboard',
            children: [],
            parent: parentNode ? parentNode._id : null,
            droppableNode: false,
            lastEdit: new Date(),
        };
        if (this.selectedNote && this.selectedNote.type === 'folder') {
            if (!this.selectedNote.children) {
                this.selectedNote.children = [];
            }
            this.selectedNote.children.push(newNote);
            newNote.parent= this.selectedNote._id;
        } else {
            this.files.push(newNote);
        }

        this.apiService.pushNote(
            this.sessionService.getSession()!.user.username!, 
            [newNote], 
            this.sessionService.getSession()!.token!
        ).subscribe({
            next: (response) => {
                console.log(response);
                if(newNote.parent){
                    this.selectedNote.children.push(newNote._id);
                    this.updateNote(this.selectedNote);
                }
                

            },
            error: (error) => { 
                console.log(error);
            },
        });
        this.value = ''; // Clear the input field after adding
    }
    updateNote(noteUpdates: Note){
        this.apiService.pushNote(this.sessionService.getSession()!.user.username!, [noteUpdates], this.sessionService.getSession()!.token!).subscribe({
            next: (response) => {
                console.log(response);
            },
            error: (error) => {
                console.log(error);
            } 
    }      );
    }

saveNote() {
    if (!this.selectedNote) return;

    this.selectedNote.content = this.text;
    this.selectedNote.lastEdit = new Date();
    
    if (this.recentNotes.length > 5) {
        this.recentNotes.shift();
    }

    this.apiService.pushNote(
        this.sessionService.getSession()!.user.username!, 
        [this.selectedNote], 
        this.sessionService.getSession()!.token!
    ).subscribe({
        next: (response) => console.log('Note saved', response),
        error: (error) => console.error('Save error', error)
    });
}



deleteNote(note: Note | null = null) {
    try {
        // Get the note to delete
        const noteToDelete = note || this.selectedNote;
        
        // Validate the note and its ID
        if (!noteToDelete) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'No note selected for deletion'
            });
            return;
        }

        if (!noteToDelete._id) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Note has no valid ID'
            });
            return;
        }


        // Delete from backend
        this.apiService.deleteNote(
            this.sessionService.getSession()!.user.username!, 
            noteToDelete._id, 
            this.sessionService.getSession()!.token!
        ).subscribe({
            next: (response) => {
                // Remove from frontend structure
                this.removeNoteFromStructure(noteToDelete);
                this.selectedNote = null;
                this.text = '';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Note deleted successfully'
                });
            },
            error: (error) => {
                console.error('Delete error', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete note'
                });
            }
        });
    } catch (error) {
        console.error('Error in deleteNote:', error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An unexpected error occurred'
        });
    }
}

// Update the context menu handler
onContextMenu(event: any, note: Note) {
    if (!note?._id) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Cannot select note - missing ID'
        });
        return;
    }
    this.selectedNote = note;
    this.cm.show(event);
}


private removeNoteFromStructure(note: Note) {
    const removeFromParent = (nodes: Note[], parent: Note | null = null): boolean => {
        for (let i = 0; i < nodes.length; i++) {
            // Check if current node is the one to remove
            if (nodes[i]._id === note._id) {
                if (parent) {
                    // Remove from parent's children array (which contains IDs)
                    parent.children = parent.children.filter(childId => childId !== note._id);
                } else {
                    // Remove from root files array
                    this.files = this.files.filter(file => file._id !== note._id);
                }
                return true;
            }

            // If current node has children (array of IDs), we need to find the actual child notes
            if (nodes[i].children && nodes[i].children.length > 0) {
                // Get the actual child note objects (not just IDs)
                const childNotes = this.getChildNotes(nodes[i]);
                
                // Recursively check the child notes
                if (removeFromParent(childNotes, nodes[i])) {
                    return true;
                }
            }
        }
        return false;
    };

    removeFromParent(this.files);
}

    // Helper method to get actual note objects from child IDs
    private getChildNotes(parent: Note): Note[] {
        if (!parent.children) return [];
        
        return parent.children
            .map(childId => this.findNoteById(childId))
            .filter(note => note !== null) as Note[];
    }

    // Existing findNoteById method (updated to work with new structure)
    private findNoteById(id: any, notes: Note[] = this.files): Note | null {
        for (const note of notes) {
            if (note._id?.toString() === id?.toString()) return note;
            
            // Check children if they exist as objects (shouldn't happen in new structure)
            if (note.children && note.children.length > 0) {
                const childNotes = this.getChildNotes(note);
                const found = this.findNoteById(id, childNotes);
                if (found) return found;
            }
        }
        return null;
    }
// Update the onNodeDrop method
onNodeDrop(event: any): void {
    if (!event.dragNode || !event.dropNode) return;

    // Update parent reference
    event.dragNode.parent = event.dropNode.type === 'folder' ? event.dropNode._id : null;
    
    // Save the updated note
    this.apiService.pushNote(
        this.sessionService.getSession()!.user.username!,
        [event.dragNode],
        this.sessionService.getSession()!.token!
    ).subscribe({
        next: (response) => {
            console.log('Node moved successfully', response);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Note moved successfully'
            });
        },
        error: (error) => {
            console.error('Move error', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to move note'
            });
        }
    });
}

}