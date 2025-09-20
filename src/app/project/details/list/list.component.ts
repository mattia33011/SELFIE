import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import {
  TASK_STATUS,
  Task,
  TaskStatus,
  stringToTaskStatus,
  taskStatusToString,
} from '../../../../types/project';
import { TreeNode } from 'primeng/api';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-list',
  imports: [
    TreeTableModule,
    TranslatePipe,
    ButtonModule,
    SelectModule,
    FormsModule,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  @Input() isAuthor!: boolean
  @Input() taskObservable!: Observable<Task[]>
  tasks: Task[] = []; 
  @Input() updatedTasks!: Task[]
  @Output() deleteAction: EventEmitter<{task: Task, clickEvent: Event}> = new EventEmitter();
  @Output() changeStatus: EventEmitter<Task> = new EventEmitter();
  @Output() inputAction: EventEmitter<Task> = new EventEmitter();
  @Output() outputAction: EventEmitter<Task> = new EventEmitter();
  @Output() addSubTaskAction: EventEmitter<Task> = new EventEmitter();
  @Output() addTaskAction: EventEmitter<void> = new EventEmitter();
  @Output() saveActions: EventEmitter<Task> = new EventEmitter();

  treeNodes!: TreeNode[];

  cols = [
    { field: 'id', header: 'id' },
    { field: 'name', header: 'name' },
    { field: 'input', header: 'input' },
    { field: 'output', header: 'output' },
    { field: 'start', header: 'start' },
    { field: 'expire', header: 'expire' },
    { field: 'status', header: 'status' },
    { field: 'actions', header: 'actions' },
  ];

  statusOptions = TASK_STATUS;

  t(id: string) {
    return this.tasks.find((it) => it.id == id);
  }
  onChange(status: string, data?: Task){
    if(data){      
      this.changeStatus.emit({
        ...data,
        status: stringToTaskStatus(status)
      })
    }
      
  }
  openDeletePopup(task: Task, clickEvent: Event){
    this.deleteAction.emit({task: task, clickEvent: clickEvent})
  }
  isUpdated(id:string){
    return this.updatedTasks.find(it => it.id == id) == undefined
  }
  ngOnInit() {
    this.taskObservable.subscribe(tasks => {
      this.tasks = tasks
      this.treeNodes = this.tasks.length == 0 ? [] : this.tasks.map(this.mapTaskIntoTreeNode);
    })

  }
  
  mapTaskIntoTreeNode(task: Task): TreeNode {
    return {
      data: {
        ...task,
        expire: task.expire.toLocaleDateString(),
        start: task.start.toLocaleDateString(),
        isMilestone: task.isMilestone ? 'yes' : 'no',
        status: taskStatusToString(task.status),
      },
    };
  }
  isStatusDisabled(status: TaskStatus) {
    if (status == TaskStatus.Overdue) return true;
    return false;
  }

  /*
  mapTasksIntoTreeNodes(tasks: Task[]): TreeNode[] {
    const roots = tasks.filter((it) => it.linkedTask.length > 0);
    const leaves = tasks.filter((it) => it.linkedTask.length == 0);
    const result: TreeNode[] = [];
    const linkedLeaves: string[] = [];
    roots.forEach((root) => {
      const tree: TreeNode = this.mapTaskIntoTreeNode(root);

      tree.children = root.linkedTask.map((it) => {
        const leaf = leaves.find((leaf) => leaf.id == it);
        if (leaf && !linkedLeaves.includes(leaf.id)) linkedLeaves.push(leaf.id);

        return { data: { ...leaf } };
      });

      result.push(tree);
    });

    leaves.forEach((it) => {
      if (linkedLeaves.includes(it.id)) return;

      result.push({ data: { ...it } });
    });

    return result.sort();
  }
  */
}
