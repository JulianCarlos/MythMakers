import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { World } from '../../models/world';
import { ModalService } from '../../core/modal/modal.service';
import { Project } from '../../models/project';

@Component({
  selector: 'app-worlds-view',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './worlds-view.component.html',
  styleUrls: ['./worlds-view.component.scss']
})
export class WorldsViewComponent {
  @Input() project?: Project;

  @Output() openWorld = new EventEmitter<string>();
  @Output() addWorldName = new EventEmitter<string>();

  get worlds(): World[] {
    return this.project?.worlds ?? [];
  }

  constructor(private modal: ModalService) {}

  onClickWorld(world: World) {
    this.openWorld.emit(world.id);
  }

  onAddWorldItem(): void {
    if (!this.project) return;
    this.modal.openTextPrompt({ title: 'New world', placeholder: 'Enter world name' })
      .subscribe(value => {
        if (!value?.trim()) return;
        this.addWorldName.emit(value.trim());
      });
  }
}
