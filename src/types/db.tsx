export interface Flashcard {
    id: string,
    name: string,
    moves: string,
    eco: string,
    fen: string
}

export interface Folder {
    name: string,
    flashcards: Flashcard[]
}

export interface UserData {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    added: number,
    incorrect: number,
    correct: number,
}
