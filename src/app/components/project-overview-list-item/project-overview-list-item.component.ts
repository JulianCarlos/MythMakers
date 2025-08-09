import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Project } from '../../models/project';

@Component({
  selector: 'app-project-overview-list-item',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './project-overview-list-item.component.html',
  styleUrl: './project-overview-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectOverviewListItemComponent {
  @Input() project?: Project;

  @Output() open = new EventEmitter<Project>();
  @Output() rename = new EventEmitter<Project>();
  @Output() delete = new EventEmitter<Project>();

  protected onOpen() {
    this.open.emit(this.project);
  }

  protected onEdit() { 
    this.rename.emit(this.project); 
  }

  protected onDelete() { 
    this.delete.emit(this.project); 
  }
}
