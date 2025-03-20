import { createContext } from "react";
import { AppContextType, TabContextType, UserContextType } from "./types/contexts";

export const TabContext = createContext<TabContextType>({
    tab: "explore",
    setTab: () => {}
});

export const AppContext = createContext<AppContextType>({ 
    flashcards: null, 
    setFlashcards: () => {},
    folders: null,
    setFolders: () => {},
});

export const UserContext = createContext<UserContextType>({
    userData: null,
    user: null,
    setUserData: () => {},
    setUser: () => {}
})