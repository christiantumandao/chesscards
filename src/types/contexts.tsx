import { User } from "firebase/auth"
import { TabType } from "../components/NavBar/types"
import { Flashcard, Folder, UserData } from "./db"
import { Chess } from "chess.js"
import { Trie } from "../util/Trie"
import { Color, PlayModeType } from "./states"
import { ToolbarTab } from "../components/Toolbar/types"
import Engine from "../services/Engine/engine"

export interface CardsContextType {
    flashcards: Flashcard[],
    setFlashcards: (newFlashcards: Flashcard[]) => void,
    folders: Folder[],
    setFolders: (newFolders: Folder[]) => void
  }
export interface TabContextType {
    tab: TabType,
    setTab: (newTab: TabType) => void
}

export interface UserContextType {
    userData: UserData | null,
    user: User | null,
    setUserData: (newUserData: UserData | null) => void,
    setUser: (newUser: User | null) => void 
}

export interface BoardStateContextType {
    game: Chess,
    currOpening: Flashcard | null,
    history: string[],
    moveHistory: string[],
    currMove: number,
    color: Color,

    setGame: (newGame: Chess) => void,
    setCurrOpening: (newCurrOpening: Flashcard | null) => void,
    setHistory: (newHistory: string[]) => void,
    setMoveHistory: (newMoveHistory: string[]) => void,
    setCurrMove: (newCurrMove: number) => void
    setColor: (newColor: Color) => void
}

export interface PlayContextType {
    playMode: PlayModeType,
    testingFlashcards: Flashcard[],
    flashcardIdx: number,
    flashcardMoves: string[],
    playerMoveIdx: number,

    trieHead: Trie,
    currTrie: Trie,

    testingSetName: 0 | string,
    setTestingSetName: (val: 0 | string) => void,

    localFlashcardsHighscore: number, 
    localFreestyleHighscore: number,
    setLocalFlashcardsHighscore: (val: number) => void, 
    setLocalFreestyleHighscore: (val: number) => void,
    localTimedHighscore: number,
    setLocalTimedHighscore: (val: number) => void,

    setPlayMode: (newVal: PlayModeType) => void,
    inGameCorrects: number,
    setInGameCorrects: (newVal: number) => void,
    setTestingFlashcards: (newVal: Flashcard[]) => void,
    setFlashcardIdx: (newVal: number) => void,
    setFlashcardMoves: (newVal: string[]) => void,
    setPlayerMoveIdx: (newVal: number) => void,

    setHasSkippedFlashcard: (newVal: boolean) => void,
    setTrieHead: (newVal: Trie) => void,
    setCurrTrie: (newVal: Trie) => void,
    onFinishFlashcards: () => void,
    onFinishFreestyle: () => void,
    time: number,
    setTime: (newVal: any) => void,
    resetVariables: () => void,
    beginFlashcards: (mode: "flashcards" | "timed",color: Color, flashcardsToTest: Flashcard[], setName: string | 0) => void,
    beginFreestyle: (mode: "freestyle" | "arcade", color: Color, head: Trie, folderName: 0 | string) => void

}

export interface AutoPlayContextType {
    autoPlay: boolean,
    autoPlayIdx: number,
    autoPlayMoves: string[],

    autoPlayOpening: (flashcard: Flashcard) => void,
    setAutoPlay: (newVal: boolean) => void,
    setAutoPlayIdx: (newVal: number) => void,
    setAutoPlayMoves: (newVal: string[]) => void
}

export interface ToolbarContextType {
    toolbarTab: ToolbarTab,
    setToolbarTab: (newVal: ToolbarTab) => void,
    currentFolder: Folder | null,
    setCurrentFolder: (newVal: Folder | null) => void,

    editFolderMode: boolean
    setEditFolderMode: (newVal: boolean) => void,
    editFlashcardsMode: boolean,
    setEditFlashcardsMode: (newVal: boolean) => void,
    addOpeningsToFolder: boolean
    setAddOpeningsToFolder: (newVal: boolean) => void,
}

export interface EngineContextType {
    positionEvaluation: number,
    setPositionEvaluation: (newVal: number) => void,
    depth: number,
    setDepth: (newVal: number) => void,
    bestLine: string,
    setBestLine: (newVal: string) => void,
    possibleMate: string,
    setPossibleMate: (newVal: string) => void,
    engine: null | Engine
}