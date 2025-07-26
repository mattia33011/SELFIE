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
    
    onContextMenu(event: any, Note: Note) {
        this.selectedNote = Note;
        this.cm.show(event);
    }
    onHide() {
        this.selectedNote = null;
        this.text = '';
    }


addFolder(parentNode: any = null) {  // Usa 'any' temporaneamente per evitare errori di tipo
    if (!this.value || this.value.trim() === '') {
        alert("Inserire un nome per la cartella");
        return;
    }

    const newFolder: Note = {
        label: this.value,
        author: this.sessionService.getSession()!.user.username!,
        members: [],
        expanded: true,
        content: '',
        type: 'folder',
        icon: 'pi pi-folder',
        children: [],
        parent: parentNode ? parentNode._id || parentNode.label : null, // Usa _id o label come fallback
        droppableNode: true,
        lastEdit: new Date(),
    };

    if (parentNode) {
        if (!Array.isArray(parentNode.children)) {
            parentNode.children = [];
        }
        parentNode.children.push(newFolder);
    } else {
        this.files.push(newFolder);
    }

    this.apiService.pushNote(
        this.sessionService.getSession()!.user.username!, 
        [newFolder], 
        this.sessionService.getSession()!.token!
    ).subscribe({
        next: (response: any) => {  // Usa 'any' per la risposta
            if (response?.[0]?._id) {
                newFolder._id = response[0]._id;
                // Aggiorna riferimento nell'albero
                const targetArray = parentNode ? parentNode.children : this.files;
                const index = targetArray.findIndex((item: any) => item.label === newFolder.label);
                if (index !== -1) {
                    targetArray[index]._id = response[0]._id;
                }
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
        author: note.author,
        members: [],
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
    addNote() {
        if (this.value == null || this.value.trim() === '') {
            alert("Inserire un nome per la nota");
            return;
        }
        const newNote: Note =    {
            label: this.value,
            author: this.sessionService.getSession()!.user.username!,
            members: [],
            expanded: true,
            content: 'Scrivi qui...',
            type: 'note',
            icon: 'pi pi-clipboard',
            children: [],
            parent: this.selectedNote ?? null,
            droppableNode: false,
            lastEdit: new Date(),
        };
        if (this.selectedNote && this.selectedNote.type === 'folder') {
            if (!this.selectedNote.children) {
                this.selectedNote.children = [];
            }
            this.selectedNote.children.push(newNote);
        } else {
            this.files.push(newNote);
        }
        //this.updateStructure();
        
        this.apiService.pushNote(this.sessionService.getSession()!.user.username!, [newNote], this.sessionService.getSession()!.token!).subscribe({
            next: (response) => {
                console.log(response);
            },
            error: (error) => { 
                console.log(error);
            },
        });
        this.value = ''; // Clear the input field after adding
    }
    updateStructure(){
        this.apiService.pushNote(this.sessionService.getSession()!.user.username!, this.files, this.sessionService.getSession()!.token!).subscribe({
            next: (response) => {
                console.log(response);
            },
            error: (error) => {
                console.log(error);
            } 
    }      );
    }

    saveNote() {
        if (this.selectedNote) {
            this.selectedNote.content = this.text;
            this.recentNotes.push(this.selectedNote.label);
            this.selectedNote.lastEdit = Date();
            if (this.recentNotes.length > 5) {
                this.recentNotes.shift(); // vogliamo al massimo 5 note
            }

            //this.updateStructure();
            
            this.apiService.pushNote(this.sessionService.getSession()!.user.username!, [this.selectedNote], this.sessionService.getSession()!.token!).subscribe({
                next: (response) => {
                    console.log(response);
                },
                error: (error) => {
                    console.log(error);
                },
            });
            
        }
    }

    deleteNote() {
        if (this.selectedNote) {
            const parent = this.selectedNote.parent;
            if (parent) {
                const index = parent.children.indexOf(this.selectedNote);
                if (index !== -1) {
                    parent.children.splice(index, 1);
                }
            } else {
                const index = this.files.indexOf(this.selectedNote);
                if (index !== -1) {
                    this.files.splice(index, 1);
                }
            }
            
            this.apiService.deleteNote(this.sessionService.getSession()!.user.username!, this.selectedNote, this.sessionService.getSession()!.token!).subscribe({
                next: (response) => {
                    console.log(response);
                },
                error: (error) => {
                    console.log(error);
                },
            });
            this.selectedNote = null;
            this.text = '';
            
        }
    }

onNodeDrop(event: any): void {
    
}



}