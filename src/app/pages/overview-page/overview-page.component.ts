import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ProjectOverviewListItemComponent } from "../../components/project-overview-list-item/project-overview-list-item.component";
import { Project } from '../../models/project';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ModalService } from '../../core/modal/modal.service';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { ProjectsStateService } from '../../services/projects-state.service';
import { AsyncPipe } from '@angular/common';
import { first, take } from 'rxjs/operators';

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [ProjectOverviewListItemComponent, MatIconModule, MatButtonModule, RouterOutlet, AsyncPipe],
  templateUrl: './overview-page.component.html',
  styleUrl: './overview-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewPageComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private state = inject(ProjectsStateService);

  projects$ = this.state.projects$;

  constructor(private modal: ModalService) {}

  ngOnInit() {
    this.state.seedDemoIfEmpty();

    const current = this.state.getSnapshot();
    if (!this.route.firstChild && current.length > 0) {
      this.router.navigate(['project', current[0].id], { relativeTo: this.route });
    }
  }

  onAddProject() {
    this.modal.openTextPrompt({ title: 'New project', placeholder: 'Enter project name' })
      .pipe(take(1))
      .subscribe(value => {
        const name = value?.trim();
        if (!name) return;

        const project = this.state.addProject(name);
        this.router.navigate(['project', project.id], { relativeTo: this.route });
      });
  }

  onEditProject(project: Project) {
    this.modal.openTextPrompt({
      title: `Rename "${project.name}"`,
      placeholder: 'Enter new name',
      initialValue: project.name
    })
    .pipe(take(1))
    .subscribe(value => {
      const name = value?.trim();
      if (!name) return;
      this.state.renameProject(project.id, name);
    });
  }

  onDeleteProject(project: Project) {
    this.modal.openConfirm({
      title: 'Delete project?',
      message: `This will permanently remove "${project.name}".`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      danger: true
    })
    .pipe(first())
    .subscribe(confirmed => {
      if (!confirmed) return;

      this.state.deleteProject(project.id);

      const remaining = this.state.getSnapshot();
      if (remaining.length > 0) {
        this.router.navigate(['project', remaining[0].id], { relativeTo: this.route });
      } else {
        this.router.navigate(['./'], { relativeTo: this.route });
      }
    });
  }

  onProjectSelected(project: Project) {
    this.router.navigate(['project', project.id], { relativeTo: this.route });
  }
}
