import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ProjectDto } from '@api/models';

@Component({
  selector: 'app-project-overview-list-item',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './project-overview-list-item.component.html',
  styleUrl: './project-overview-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectOverviewListItemComponent {
  @Input() project?: ProjectDto;

  @Output() open = new EventEmitter<ProjectDto>();
  @Output() rename = new EventEmitter<ProjectDto>();
  @Output() delete = new EventEmitter<ProjectDto>();

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
