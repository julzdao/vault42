import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// import { NoteRecord } from '../types/garden.types';
import { GardenContentSource, getNoteContext, getNotesByTag } from '@vault42/core';
import { NoteRecord } from '@vault42/core';

@Component({
  selector: 'app-tag-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag-page.component.html',
  styleUrl: './tag-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class V42TagLayoutComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contentService = inject(GardenContentSource);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly subscriptions = new Subscription();

  tag = '';
  resolvedTag = '';
  matches: NoteRecord[] = [];

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.paramMap.subscribe((params) => {
        this.loadTag(params.get('tag') ?? '');
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private async loadTag(rawTag: string): Promise<void> {
    this.tag = decodeURIComponent(rawTag);

    const index = await this.contentService.loadGardenIndex();

    this.matches = getNotesByTag(index.notes, this.tag);

    this.resolvedTag =
      this.matches
        .flatMap((note) => note.tags ?? [])
        .find((tag) => tag.toLowerCase() === this.tag.toLowerCase()) ??
      this.tag;

    this.cdr.markForCheck();
  }

  context(note: NoteRecord): string {
    return getNoteContext(note);
  }

  openNote(slug: string): Promise<boolean> {
    return this.router.navigate(['/'], {
      queryParams: { note: slug },
    });
  }

  backToGarden(): Promise<boolean> {
    return this.router.navigate(['/']);
  }
}