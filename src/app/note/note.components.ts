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
    files: {
        "folders": [
            {
                "label": "Progetti",
                "expanded": true,
                "children": [
                    {
                        "label": "App Idea",
                        "content": "Scrivi qui...",
                        "type": "note",
                        "color": "red"
                    },
                    {
                        "label": "ToDo List",
                        "content": "Task da completare...",
                        "type": "note",
                        "color": "blue"
                    }
                ],
                "type": "folder",
                "parent": null
            },
            {
                "label": "Personale",
                "expanded": true,
                "children": [
                    {
                        "label": "Diario",
                        "content": "Oggi è stata una bella giornata...",
                        "type": "note",
                        "color": "green"
                    }
                ],
                "type": "folder",
                "parent": null
            }
        ]
    } | undefined;

    openNote(event: any) {
        if (event.node.type === 'note') {
            this.selectedNote = event.node;
            this.text = this.selectedNote.content;
        } else {
            this.selectedNote = null;
            this.text = '';
        }
    }

    addFolder(){
        return;
    }

    addNote(){
        return;
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
            }
            this.selectedNote = null;
            this.text = '';
        }
    }
 
}