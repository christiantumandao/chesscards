export interface Flashcard {
    id: string,
    name: string,
    moves: string,
    eco: string,
    fen: string
}

export interface Folder {
    name: string,
    openings: Flashcard[],
    arcadeHighscore: number,
    flashcardsHighscore: number,
    timedHighscore: number
}

export interface UserData {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    added: number,
    incorrect: number,
    correct: number,
    flashcardsHighscore: number,
    timedHighscore: number,
    arcadeHighscore: number,
}
