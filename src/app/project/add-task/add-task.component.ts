import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Task } from '../../../types/project';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-add-task',
  imports: [
    ListboxModule,
    ReactiveFormsModule,
    ButtonModule,
    TranslatePipe,
    ToggleButtonModule,
    DatePickerModule,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
})
export class AddTaskComponent {
  @Input() taskFormGroup!: FormGroup;
  @Input() members!: string[];
  @Input() tasks!: Task[];
  @Input() loading!: boolean;
  @Output() confirmAction = new EventEmitter<void>();

  today = new Date();
}
