import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ModalService } from '../../core/modal/modal.service';
import { Project } from '../../models/project';
import { Country } from '../../models/country';
import { ViewListComponent } from '../../core/view-list/view-list.component';

@Component({
  selector: 'app-countries-view',
  standalone: true,
  imports: [ViewListComponent],
  templateUrl: './countries-view.component.html',
  styleUrl: './countries-view.component.scss'
})
export class CountriesViewComponent {
  private modal = inject(ModalService);

  @Input() project?: Project;
  @Input() searchInput?: string;

  @Output() openCountry = new EventEmitter<string>();
  @Output() addCountryName = new EventEmitter<string>();
  @Output() removeCountryId = new EventEmitter<string>();

  get countries(): readonly Country[] {
    return this.project?.countries ?? [];
  }

  get filteredCountries(): readonly Country[] {
    const q = (this.searchInput ?? '').trim();
    if (!q) return this.countries;

    const needle = normalize(q);
    return this.countries.filter(w => normalize(w.name ?? '').includes(needle));
  }

  idOf = (w: Country) => w.id;
  labelOf = (w: Country) => w.name ?? '';
  onSelectCountry = (id: string) => this.openCountry.emit(id);
  onRemoveCountry = (id: string) => this.removeCountryId.emit(id);
  onAddCountry = () => {
    this.modal.openTextPrompt({ title: 'New country', placeholder: 'Enter country name' })
      .subscribe(value => {
        const trimmed = value?.trim();
        if (trimmed) this.addCountryName.emit(trimmed);
      });
  };
}

function normalize(s: string): string {
  return (s ?? '')
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}