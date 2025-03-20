import { User } from "firebase/auth"
import { TabType } from "../components/NavBar/types"
import { Flashcard, Folder, UserData } from "./db"

export interface AppContextType {
    flashcards: Flashcard[] | null,
    setFlashcards: (newFlashcards: Flashcard[]) => void,
    folders: Folder[] | null,
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