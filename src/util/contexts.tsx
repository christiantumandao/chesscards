import { createContext } from "react";
import { AutoPlayContextType, BoardStateContextType, CardsContextType, PlayContextType, TabContextType, ToolbarContextType, UserContextType } from "../types/contexts";
import { Chess } from "chess.js";
import { Trie } from "./Trie";

export const TabContext = createContext<TabContextType>({
    tab: "explore",
    setTab: () => {}
});

export const CardsContext = createContext<CardsContextType>({ 
    flashcards: [], 
    setFlashcards: () => {},
    folders: [],
    setFolders: () => {},
});

export const UserContext = createContext<UserContextType>({
    userData: null,
    user: null,
    setUserData: () => {},
    setUser: () => {}
})

export const BoardStateContext = createContext<BoardStateContextType>({
    game: new Chess(),
    history: [],
    moveHistory: [],
    currMove: 0,
    currOpening: null,
    color: "white",
    
    setGame: () => {},
    setHistory: () => {},
    setMoveHistory: () => {},
    setCurrMove: () => {},
    setCurrOpening: () => {},
    setColor: () => {}
})

export const PlayContext = createContext<PlayContextType>({
    playMode: "",
    testingFlashcards: [],
    flashcardIdx: 0,
    flashcardMoves: [],
    playerMoveIdx: 0,
    flash: "",

    localFlashcardsHighscore: -1, 
    localFreestyleHighscore: 0,
    setLocalFlashcardsHighscore: () => {}, 
    setLocalFreestyleHighscore: () => {},


    trieHead: new Trie(),
    currTrie: new Trie(),

    inGameCorrects: 0,
    setInGameCorrects: () => {},

    time: 0,
    setTime: () => {},

    testingSetName: 0,
    setTestingSetName: () => {},

    setPlayMode: () => {},
    setTestingFlashcards: () => {},
    setFlashcardIdx: () => {},
    setFlashcardMoves: () => {},
    setPlayerMoveIdx: () => {},
    setFlash: () => {},

    setTrieHead: () => {},
    setCurrTrie: () => {},
    onFinishFlashcards: () => {},
    onFinishFreestyle: () => {},
    setHasSkippedFlashcard: () => {}
})

export const startingFen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const AutoPlayContext = createContext<AutoPlayContextType>({
    autoPlay: false,
    autoPlayIdx: 0,
    autoPlayMoves: [],

    autoPlayOpening: () => {},
    setAutoPlay: () => {},
    setAutoPlayIdx: () => {},
    setAutoPlayMoves: () => {}
});

export const ToolbarContext = createContext<ToolbarContextType>({
    toolbarTab: "Flashcards",
    setToolbarTab: () => {},
    currentFolder: null,
    setCurrentFolder: () => {},

    editFolderMode: false,
    setEditFolderMode: () => {},
    editFlashcardsMode: false,
    setEditFlashcardsMode: () => {},
    addOpeningsToFolder: false,
    setAddOpeningsToFolder: () => {},
});

