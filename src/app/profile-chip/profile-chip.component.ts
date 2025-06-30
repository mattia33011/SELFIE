import { Component, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-profile-chip',
  imports: [AvatarModule],
  templateUrl: './profile-chip.component.html',
  styleUrl: './profile-chip.component.css'
})
export class ProfileChipComponent {
  @Input()label?: string
  @Input() imageUrl?: string
  @Input() name!: string
}
