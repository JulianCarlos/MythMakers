import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ModalService } from '../../core/modal/modal.service';
import { ViewListComponent } from '../../core/view-list/view-list.component';
import { CityDto, ProjectDto } from '@api/models';
import { first } from 'rxjs';

@Component({
  selector: 'app-cities-view',
  standalone: true,
  imports: [CommonModule, ViewListComponent],
  templateUrl: './cities-view.component.html',
  styleUrls: ['./cities-view.component.scss'],
})
export class CitiesViewComponent {
  private modal = inject(ModalService);

  @Input() project?: ProjectDto;
  @Input() searchInput?: string;

  @Output() openCity = new EventEmitter<number>();
  @Output() addCityName = new EventEmitter<string>();
  @Output() removeCityId = new EventEmitter<number>();

  get cities(): readonly CityDto[] {
    return this.project?.cities ?? [];
  }

  get filteredCities(): readonly CityDto[] {
    const q = (this.searchInput ?? '').trim();
    if (!q) return this.cities;

    const needle = normalize(q);
    return this.cities.filter((w) => normalize(w.name ?? '').includes(needle));
  }

  idOf = (c: CityDto) => c.id;
  labelOf = (c: CityDto) => c.name ?? '';
  onSelectCity = (id: number) => this.openCity.emit(id);
  onRemoveCity = (id: number) => {
      this.modal
        .openConfirm({
          title: 'Delete project?',
          message: `This will permanently remove the city.`,
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
          danger: true,
        })
        .pipe(first())
        .subscribe((confirmed) => {
          if (confirmed){
            this.removeCityId.emit(id);
          }
        });
    };
  onAddCity = () => {
    this.modal
      .openTextPrompt({ title: 'New city', placeholder: 'Enter city name' })
      .subscribe((value) => {
        const trimmed = value?.trim();
        if (trimmed) this.addCityName.emit(trimmed);
      });
  };
}

function normalize(s: string): string {
  return (s ?? '')
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
