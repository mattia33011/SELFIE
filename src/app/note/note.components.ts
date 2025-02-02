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

    folders: any[] = [
        {
            label: 'Progetti',
            expanded: true,
            children: [
              { label: 'App Idea', content: 'Scrivi qui...', type: 'note' },
              { label: 'ToDo List', content: 'Task da completare...', type: 'note' }
            ],
            type: 'folder'
          },
          {
            label: 'Personale',
            expanded: true,
            children: [
              { label: 'Diario', content: 'Oggi è stata una bella giornata...', type: 'note' }
            ],
            type: 'folder'
          }
      ];

      selectedNote: any = null;

      openNote(event: any){
        if (event.node.type === 'note') {
            this.selectedNote = event.node;
          } else {
            this.selectedNote = null;
          }
      }

      addFolder(){
        const folderName=this.value;
        if(folderName){
            this.folders.push({
                label: folderName,
                expanded: true,
                children:[],
                type: 'folder'
            });
            this.value='';
        }
      }

      addNote(){
        if(!this.selectedNote || this.selectedNote.type !== 'folder'){
            alert("seleziona una cartella per aggiungere una nota");
            return;
        }
        const noteName=this.value;
        if(noteName){
            this.selectedNote.children.push({
                label: noteName,
                content: '',
                type: 'note'
            });
        }
        this.value='';
        }

        saveNote(){
            this.selectedNote.content=this.text;
        }
    }