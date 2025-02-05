import { EditorModule } from 'primeng/editor'; // npm install quill
import { Card, CardModule } from 'primeng/card';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'notes',
    imports: [
        EditorModule,
        CardModule,
        FormsModule,
        TreeModule,
        ButtonModule,
        ButtonGroupModule,
        InputTextModule
    ],
    templateUrl: './note.components.html',
    styleUrl: './note.components.css',
    providers: [MessageService]
})
export class NoteComponent{
    text: string | undefined;
    value: string | undefined;
    selectedNote: any = null;

    folders: any[] = [
        {
            label: 'Progetti',
            expanded: true,
            children: [
              { label: 'App Idea', content: 'Scrivi qui...', type: 'note' },
              { label: 'ToDo List', content: 'Task da completare...', type: 'note' }
            ],
            type: 'folder',
            parent: null
          },
          {
            label: 'Personale',
            expanded: true,
            children: [
              { label: 'Diario', content: 'Oggi è stata una bella giornata...', type: 'note' }
            ],
            type: 'folder',
            parent: null
          }
      ];

      openNote(event: any){
        if (event.node.type === 'note') {
            this.selectedNote = event.node;
            this.text=this.selectedNote.content;
          } else {
            this.selectedNote = null;
            this.text='';
          }
      }

      addFolder() {
        if (this.value?.trim()) {
            this.folders.push({
                label: this.value,
                expanded: true,
                children: [],
                type: 'folder',
                parent: this.selectedNote.parent
            });
            this.value = '';
        }
    }

      addNote(){
        if(!this.selectedNote || this.selectedNote.type !== 'folder'){
            alert("seleziona una cartella per aggiungere una nota");
            return;
        }
        if (this.value?.trim()) {
          this.selectedNote.children.push({
              label: this.value,
              content: '',
              type: 'note',
              parent: this.selectedNote.parent
          });
          this.value = '';
      }
  }
        saveNote(){
            this.selectedNote.content=this.text;
        }
    }