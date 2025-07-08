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
    ],
    templateUrl: './note.components.html',
    styleUrls: ['./note.components.css'],
    providers: [MessageService, TreeDragDropService, TranslateService, ApiService],
})
export class NoteComponent {
    @ViewChild(Tree) tree: Tree | undefined;   
    text: string | undefined;
    value: string | undefined;
    selectedNote: any = null;
    selectedFiles!: TreeNode[];
    files: any[] = [];

    ngOnInit(): void {
        forkJoin([
            this.apiService.getNotes(this.sessionService.getSession()!.user.username!, this.sessionService.getSession()!.token!)
            ]).subscribe({
            next: (response) => {
                if (response[0]) {
                    this.files.push(...response[0].map(it => ({
                        ...it,
                        lastEdit: stringToDate(it.lastEdit.toString())
                    })));
                }
            },
            error: (error) => {
                console.log(error)
            },
            })
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
        return dropNode.type === 'folder'; // Example: Only allow dropping on folders
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


    addFolder(parentNode: TreeNode | null = null) {
        if (this.value == null) {
            alert("Inserire un nome per la cartella");
            return;
        }
        const newFolder: Note = {
            label: this.value,
            expanded: true,
            content: '',
            type: 'folder',
            icon: 'pi pi-folder',
            children: [],
            parent: parentNode as Note,
            droppableNode: true,
            lastEdit: new Date(),
        };

        if (parentNode) {
            if (!parentNode.children) {
                parentNode.children = [];
            }
            parentNode.children.push(newFolder);
        } else {
            this.files.push(newFolder);
        }
        this.updateStructure();
        /*
        this.apiService.pushNote(
                    this.sessionService.getSession()!.user.username!, 
                    [newFolder], 
                    this.sessionService.getSession()!.token!)
                .subscribe({
            next: (response) => {
                console.log(response);
            },
            error: (error) => { 
                console.log(error);
            },
        });
        */
    }

    addNote() {
        if (this.value == null) {
            alert("Inserire un nome per la nota");
            return;
        }
        const newNote: Note =    {
            label: this.value, 
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
        this.updateStructure();
        /*
        this.apiService.pushNote(this.sessionService.getSession()!.user.username!, [newNote], this.sessionService.getSession()!.token!).subscribe({
            next: (response) => {
                console.log(response);
            },
            error: (error) => { 
                console.log(error);
            },
        });
        */
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
            this.selectedNote.lastEdit = new Date();
            if (this.recentNotes.length > 5) {
                this.recentNotes.shift(); // vogliamo al massimo 5 note
            }
            this.updateStructure();
            /*
            this.apiService.putNote(this.sessionService.getSession()!.user.username!, this.selectedNote, this.sessionService.getSession()!.token!).subscribe({
                next: (response) => {
                    console.log(response);
                },
                error: (error) => {
                    console.log(error);
                },
            });
            */
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
            this.selectedNote = null;
            this.text = '';
            this.updateStructure();
            /*
            this.apiService.deleteNote(this.sessionService.getSession()!.user.username!, this.selectedNote, this.sessionService.getSession()!.token!).subscribe({
                next: (response) => {
                    console.log(response);
                },
                error: (error) => {
                    console.log(error);
                },
            });
            */
        }
    }
}