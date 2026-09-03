import { InjectionToken } from "@angular/core";


export interface Vault42GardenConfig {
    brandName: string; 
    featuredNotesMax: number;
    defaultCover: string;
    folders: FoldersConfig[];
}

export interface FoldersConfig {
  id: string;
  fundamental: string;
}

export const V42_GARDEN_CONFIG = new InjectionToken<Vault42GardenConfig>('V42_GARDEN_CONFIG');