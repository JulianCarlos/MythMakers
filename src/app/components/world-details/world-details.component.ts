import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-world-details',
  standalone: true,
  imports: [],
  templateUrl: './world-details.component.html',
  styleUrl: './world-details.component.scss',
})
export class WorldDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute)

  worldId = this.route.snapshot.paramMap.get('worldId');
  projectId = this.route.snapshot.paramMap.get('projectId');

  ngOnInit(): void {
    console.log('World ID:', this.worldId);
    console.log('Project ID:', this.projectId);
  }
}
