import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, ParamMap, Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, filter, first, map, startWith, switchMap, take } from 'rxjs/operators';
import { ProjectDto } from '../../api/models/project-dto';
import { ProjectOverviewListItemComponent } from '../../components/project-overview-list-item/project-overview-list-item.component';
import { ModalService } from '../../core/modal/modal.service';

import * as fromActions from 'store/actions/project.action';
import * as fromSelectors from 'store/selectors/project.selector';
import { Actions, ofType } from '@ngrx/effects';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
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
  private actions$ = inject(Actions)

  projects$: Observable<ProjectDto[]> = this.store.select(fromSelectors.getProjectsStateProjects);
  private projects: ProjectDto[] = [];

  ngOnInit() {
    this.store.dispatch(fromActions.LoadAllProjects());

    this.projects$.pipe().subscribe(projects => {
      this.projects = projects ?? [];
    });

    this.actions$.pipe(
      ofType(fromActions.CreateProjectSuccessful),
    ).subscribe(({ project }) => {
      this.router.navigate(['project', project.id], { relativeTo: this.route });
    });

    this.actions$.pipe(
      ofType(fromActions.DeleteProjectByIdSuccess)
    ).subscribe(({ projectId }) => {
      const currentId = Number(this.route.snapshot.firstChild?.paramMap.get('projectId'));
      if (projectId !== currentId) return;
      this.router.navigate(['project', this.projects[0]?.id ?? 0], { relativeTo: this.route });
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

        this.store.dispatch(fromActions.CreateProject({ project: newProject }));
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

      this.store.dispatch(fromActions.UpdateProject({ project: newProject }));
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
  }

  drop(event: CdkDragDrop<ProjectDto[]>) {
    const ids = (event.container.data ?? []).map(p => p.id);
    const [moved] = ids.splice(event.previousIndex, 1);
    ids.splice(event.currentIndex, 0, moved);
  }
}