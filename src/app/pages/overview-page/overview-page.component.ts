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
import { BehaviorSubject } from 'rxjs';
import { first, switchMap, take } from 'rxjs/operators';
import { ProjectDto } from '../../api/models/project-dto';
import { ProjectsService } from '../../api/services/projects.service';
import { ProjectOverviewListItemComponent } from '../../components/project-overview-list-item/project-overview-list-item.component';
import { ModalService } from '../../core/modal/modal.service';

import { Store } from '@ngrx/store';
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
  private projectsService = inject(ProjectsService);
  private store = inject(Store);

  private _projects$ = new BehaviorSubject<ProjectDto[]>([]);
  projects$ = this._projects$.asObservable();

  ngOnInit() {
    this.store.dispatch(fromActions.LoadAllProjects());

    this.store.select(fromSelectors.getProjectsStateProjects).subscribe(projects => {
      this._projects$.next(projects);
      if (!this.route.firstChild && projects.length > 0) {
        this.router.navigate(['project', projects[0].id], {
          relativeTo: this.route,
        });
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
        this.projectsService.apiProjectsPost({ body: newProject }).subscribe(project => {
          // this.loadProjects();
          this.router.navigate(['project', project.id], {
            relativeTo: this.route,
          });
        });
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

    this.projectsService.apiProjectsIdGet({ id: project.id }).pipe(
      take(1),
      switchMap(full => this.projectsService.apiProjectsPost({ body: { ...full, name } }))
    ).subscribe(() => {
      // this.loadProjects();
      this.router.navigate(['project', project.id], {
        relativeTo: this.route,
        queryParams: { refresh: Date.now() },
        queryParamsHandling: 'merge',
      });
    });
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
        if (!confirmed) return;

        this.projectsService.apiProjectsIdDelete({ id: project.id }).subscribe(() => {
          // this.loadProjects();
          const remaining = this._projects$.value;
          if (remaining.length > 0) {
            this.router.navigate(['project', remaining[0].id], {
              relativeTo: this.route,
            });
          } else {
            this.router.navigate(['./'], { relativeTo: this.route });
          }
        });
      });
  }

  onProjectSelected(project: ProjectDto) {
    this.router.navigate(['project', project.id], { relativeTo: this.route });
  }

  drop(event: CdkDragDrop<ProjectDto[]>) {
    const copy = [...this._projects$.value];
    const [moved] = copy.splice(event.previousIndex, 1);
    copy.splice(event.currentIndex, 0, moved);
    this._projects$.next(copy);
  }
}