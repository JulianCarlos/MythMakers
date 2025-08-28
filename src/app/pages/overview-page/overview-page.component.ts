import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { first, take } from 'rxjs/operators';
import { ProjectDto } from '../../api/models/project-dto';
import { ProjectOverviewListItemComponent } from '../../components/project-overview-list-item/project-overview-list-item.component';
import { ModalService } from '../../core/modal/modal.service';

import * as fromActions from 'store/actions/project.action';
import * as fromSelectors from 'store/selectors/project.selector';

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [
    ProjectOverviewListItemComponent,
    MatIconModule,
    MatButtonModule,
    RouterOutlet,
    AsyncPipe,
    CdkDropList,
    CdkDrag,
  ],
  templateUrl: './overview-page.component.html',
  styleUrl: './overview-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPageComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modal = inject(ModalService);
  private store = inject(Store);

  projects$ = this.store.select(fromSelectors.getProjectsStateProjects);

  private selectedProject: ProjectDto | null = null;

  ngOnInit() {
    this.store.dispatch(fromActions.LoadAllProjects());

    this.store.select(fromSelectors.getProjectsStateProjects).subscribe(projects => {
      if (projects.length > 0 && projects.find(p => p.id === this.selectedProject?.id) == null) {
        this.selectedProject = projects[0];

        this.router.navigate(['project', projects[0].id], {
          relativeTo: this.route,
          queryParams: { refresh: Date.now() },
          queryParamsHandling: 'merge',
        });
      }
      else {
        this.selectedProject = null;
      }
    });
  }

  onAddProject() {
    this.modal
      .openTextPrompt({
        title: 'New project',
        placeholder: 'Enter project name',
      })
      .pipe(take(1))
      .subscribe((value) => {
        const name = value?.trim();
        if (!name) return;

        const newProject: ProjectDto = { id: 0, name };

        this.store.dispatch(fromActions.CreateOrUpdateProject({ project: newProject }));
      });
  }

  onEditProject(project: ProjectDto) {
    this.modal.openTextPrompt({
      title: `Rename "${project.name}"`,
      placeholder: 'Enter new name',
      initialValue: project.name,
    })
    .pipe(take(1))
    .subscribe(nameRaw => {
      const name = nameRaw?.trim();
      if (!name) return;

      const newProject: ProjectDto = { ...project, name };

      this.store.dispatch(fromActions.CreateOrUpdateProject({ project: newProject }));
    });
  } 

  onDeleteProject(project: ProjectDto) {
    this.modal
      .openConfirm({
        title: 'Delete project?',
        message: `This will permanently remove "${project.name}".`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        danger: true,
      })
      .pipe(first())
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.store.dispatch(fromActions.DeleteProjectById({ projectId: project.id }));
      });
  }

  onProjectSelected(project: ProjectDto) {
    this.router.navigate(['project', project.id], { relativeTo: this.route });

    this.selectedProject = project;
  }

  drop(event: CdkDragDrop<ProjectDto[]>) {
    const ids = (event.container.data ?? []).map(p => p.id);
    const [moved] = ids.splice(event.previousIndex, 1);
    ids.splice(event.currentIndex, 0, moved);
  }
}