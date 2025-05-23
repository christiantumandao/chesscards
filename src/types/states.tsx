export interface MoveVerbose {
    from: string,
    to: string,
    promotion?: string
}

export type Color = "white" | "black" | "both";
export type PlayModeType = "" | "flashcards" | "freestyle" | "arcade" | "timed";