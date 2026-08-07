export type BacklinkEntry = {
  fromSlug: string;
  fromTitle: string;
  context: string;
  hoverContext?: string;
};

export type NoteRecord = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type?: string;
  createdAt?: string;
  tags?: string[];
  stage?: string[];
  notebook: string;
  relativePath: string;
  links: string[];
  backlinks: BacklinkEntry[];
  rawContent: string;
  htmlContent: string;
  coverImage?: string;
  coverUpdatedAt?: string;
};

export type GardenIndex = {
  generatedAt: string;
  notebooks: string[];
  notes: NoteRecord[];
};

export type SearchCandidate = {
  slug: string;
  title: string;
  notebook: string;
  relativePath: string;
  tags: string[];
  excerpt?: string;
};

export type SubfolderTreeItem = {
  name: string;
  children: string[];
};
