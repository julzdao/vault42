import { GardenIndex } from "./garden.types";


export abstract class GardenContentSource {
    abstract loadGardenIndex(): Promise<GardenIndex>;
}

