import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { TASK_STATUS, Task, TaskStatus, taskStatusToString } from '../../../../types/project';
import { TreeNode } from 'primeng/api';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list',
  imports: [TreeTableModule, TranslatePipe, ButtonModule, SelectModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  @Input() tasks!: Task[];
  @Output() deleteAction: EventEmitter<Task> = new EventEmitter()
  @Output() changeStatus: EventEmitter<Task> = new EventEmitter()
  @Output() inputAction: EventEmitter<Task> = new EventEmitter()
  @Output() outputAction: EventEmitter<Task> = new EventEmitter()
  @Output() addSubTaskAction: EventEmitter<Task> = new EventEmitter()
  @Output() addTaskAction: EventEmitter<void> = new EventEmitter()
  
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

  statusOptions = TASK_STATUS

  t(id: string){
    return this.tasks.find(it => it.id == id)
  }

  ngOnInit() {
    this.treeNodes = this.tasks.map(this.mapTaskIntoTreeNode);
  }
  mapTaskIntoTreeNode(task: Task): TreeNode {
    return {
      data: {
        ...task,
        expire: task.expire.toLocaleDateString(),
        start: task.expire.toLocaleDateString(),
        isMilestone: task.isMilestone ? 'yes' : 'no',
        status: taskStatusToString(task.status)
      },
    };
  }
  isStatusDisabled(status: TaskStatus){
    if(status == TaskStatus.Overdue)
      return true
    return false
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
