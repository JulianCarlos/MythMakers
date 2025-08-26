import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ModalService } from '../../core/modal/modal.service';
import { ViewListComponent } from '../../core/view-list/view-list.component';
import { CountryDto, ProjectDto } from '@api/models';

@Component({
  selector: 'app-countries-view',
  standalone: true,
  imports: [ViewListComponent],
  templateUrl: './countries-view.component.html',
  styleUrl: './countries-view.component.scss',
})
export class CountriesViewComponent {
  private modal = inject(ModalService);

  @Input() project?: ProjectDto;
  @Input() searchInput?: string;

  @Output() openCountry = new EventEmitter<number>();
  @Output() addCountryName = new EventEmitter<string>();
  @Output() removeCountryId = new EventEmitter<number>();

  get countries(): readonly CountryDto[] {
    return this.project?.countries ?? [];
  }

  get filteredCountries(): readonly CountryDto[] {
    const q = (this.searchInput ?? '').trim();
    if (!q) return this.countries;

    const needle = normalize(q);
    return this.countries.filter((w) =>
      normalize(w.name ?? '').includes(needle),
    );
  }

  idOf = (w: CountryDto) => w.id;
  labelOf = (w: CountryDto) => w.name ?? '';
  onSelectCountry = (id: number) => this.openCountry.emit(id);
  onRemoveCountry = (id: number) => this.removeCountryId.emit(id);
  onAddCountry = () => {
    this.modal
      .openTextPrompt({
        title: 'New country',
        placeholder: 'Enter country name',
      })
      .subscribe((value) => {
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
