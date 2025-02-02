import { EditorModule } from 'primeng/editor'; // npm install quill
import { Card, CardModule } from 'primeng/card';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'notes',
    imports: [
        EditorModule,
        CardModule,
        FormsModule
    ],
    templateUrl: './note.components.html',
    styleUrl: './note.components.css',
    providers: [MessageService]
})
export class NoteComponent{
    text: string | undefined;
}