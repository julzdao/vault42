import { NoteRecord } from "./garden.types";


export function createMockNote(
  overrides: Partial<NoteRecord> = {}
): NoteRecord {
  return {
    id: 'note-angular-001',
    slug: 'getting-started-with-angular',
    title: 'Getting Started with Angular',
    description:
      'Learn the fundamentals of Angular, standalone components, dependency injection, and routing through practical examples.',
    type: 'doc',
    notebook: 'Software Engineering',
    tags: [
      'angular',
      'typescript',
      'frontend',
      'clean-code'
    ],
    relativePath: 'software-engineering/angular/getting-started.md',
    links: [
      'dependency-injection',
      'standalone-components',
      'routing'
    ],
    backlinks: [ ],
    rawContent: '# Getting Started with Angular',
    htmlContent: '<h1>Getting Started with Angular</h1>',

    ...overrides
  };
}