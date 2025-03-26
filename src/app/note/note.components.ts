import { EditorModule } from 'primeng/editor'; // npm install quill
import { Card, CardModule } from 'primeng/card';
import { Component, OnInit } from '@angular/core';
import { MessageService, TreeNode, TreeDragDropService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { Tree } from 'primeng/tree';

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
        Tree
    ],
    templateUrl: './note.components.html',
    styleUrls: ['./note.components.css'],
    providers: [MessageService, TreeDragDropService]
})
export class NoteComponent {
    text: string | undefined;
    value: string | undefined;
    selectedNote: any = null;
    selectedFiles!: TreeNode[];
    files: any[] = [
        {
            label: 'Progetti',
            expanded: true,
            icon: 'pi pi-folder',
            children: [
              { label: 'App Idea', content: 'Scrivi qui...', type: 'note', icon: 'pi pi-clipboard' },
              { label: 'ToDo List', content: 'Task da completare...', type: 'note', icon: 'pi pi-clipboard' }
            ],
            type: 'folder',
            parent: null
          },
          {
            label: 'Personale',
            expanded: true,
            icon: 'pi pi-folder',
            children: [
              { label: 'Diario', content: 'Oggi è stata una bella giornata...', type: 'note', icon: 'pi pi-clipboard' }
            ],
            type: 'folder',
            parent: null
          }
      ];

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
        const newFolder = {
            label: this.value,
            expanded: true,
            children: [],
            type: 'folder',
            icon: 'pi pi-folder',
            parent: parentNode ?? undefined
        };

        if (parentNode) {
            if (!parentNode.children) {
                parentNode.children = [];
            }
            parentNode.children.push(newFolder);
        } else {
            this.files.push(newFolder);
        }
    }

    addNote() {
        if (this.value == null) {
            alert("Inserire un nome per la nota");
            return;
        }
        const newNote = {
            label: this.value,
            content: 'Scrivi qui...',
            type: 'note',
            icon: 'pi pi-clipboard',
            parent: this.selectedNote ?? null
        };
        if (this.selectedNote && this.selectedNote.type === 'folder') {
            if (!this.selectedNote.children) {
                this.selectedNote.children = [];
            }
            this.selectedNote.children.push(newNote);
        } else {
            this.files.push(newNote);
        }
    }

    saveNote() {
        if (this.selectedNote) {
            this.selectedNote.content = this.text;
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
        }
    }
}