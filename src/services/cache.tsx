import { Flashcard } from "../types/db";

// key is the numbered moveset of the opening
const openingsCache = new Map<string, Flashcard>();

export function getCachedOpening(moveSet: string) {
    if (!openingsCache.has(moveSet)) return null;
    else return openingsCache.get(moveSet);
}

export function setCachedOpening(moveSet: string, fc: Flashcard) {
    openingsCache.set(moveSet, fc);
}