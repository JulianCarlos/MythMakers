import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Project } from '../../models/project';
import { City } from '../../models/city';
import { ModalService } from '../../core/modal/modal.service';
import { ViewListComponent } from '../../core/view-list/view-list.component';

@Component({
  selector: 'app-cities-view',
  standalone: true,
  imports: [CommonModule, ViewListComponent],
  templateUrl: './cities-view.component.html',
  styleUrls: ['./cities-view.component.scss'],
})
export class CitiesViewComponent {
  private modal = inject(ModalService);

  @Input() project?: Project;
  @Input() searchInput?: string;

  @Output() openCity = new EventEmitter<string>();
  @Output() addCityName = new EventEmitter<string>();
  @Output() removeCityId = new EventEmitter<string>();

  get cities(): readonly City[] {
    return this.project?.cities ?? [];
  }

  get filteredCities(): readonly City[] {
    const q = (this.searchInput ?? '').trim();
    if (!q) return this.cities;

    const needle = normalize(q);
    return this.cities.filter((w) => normalize(w.name ?? '').includes(needle));
  }

  idOf = (c: City) => c.id;
  labelOf = (c: City) => c.name ?? '';
  onSelectCity = (id: string) => this.openCity.emit(id);
  onRemoveCity = (id: string) => this.removeCityId.emit(id);
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
