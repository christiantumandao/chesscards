import { useContext, useEffect, useMemo, useState } from "react";
import "./toolbar.css";

import { Flashcard, Folder } from "../../types/db";
import { TabContext, ToolbarContext } from "../../util/contexts";
import { ToolbarTab } from "./types";

import ToolbarFooter from "../ToolbarFooter/ToolbarFooter";
import ToolbarBody from "../ToolbarBody/ToolbarBody";
import ToolbarHeader from "../ToolbarHeader/ToolbarHeader";
import { ToolbarContextType } from "../../types/contexts";

interface ToolbarProps {
    undo: () => void,
    redo: () => void,
    restart: () => void, 
    currentFolder: Folder | null,
    setCurrentFolder: (val: Folder | null) => void
}

const Toolbar = (props: ToolbarProps) => {

    const { undo, redo, restart,
            currentFolder, setCurrentFolder
    } = props;

    const { tab } = useContext(TabContext);

    const [toolbarTab, setToolbarTab] = useState<ToolbarTab>("Flashcards");
    const [searchResults, setSearchResults] = useState<Flashcard[]>([]);

    const [editFolderMode, setEditFolderMode] = useState<boolean>(false);
    const [editFlashcardsMode, setEditFlashcardsMode] = useState<boolean>(false);
    const [addOpeningsToFolder, setAddOpeningsToFolder] = useState<boolean>(false);

    const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

    const toolbarContextProviderValue = useMemo(()=> {

        const toolbarValue: ToolbarContextType = {
            toolbarTab,
            setToolbarTab,
            currentFolder, 
            setCurrentFolder,
    
            editFolderMode,
            setEditFolderMode,
            editFlashcardsMode,
            setEditFlashcardsMode,
            addOpeningsToFolder,
            setAddOpeningsToFolder,
        }
        return toolbarValue;

    },[toolbarTab, currentFolder, editFolderMode, editFlashcardsMode, addOpeningsToFolder]);

    // whenever the component is mounted or login changes, we get the user's cards
    // TO DO: 
    // TODO - non urgent: remove setFlashcard from dependency array
    useEffect(()=> {
        return () => {
            setSearchResults([]);
        }
    },[]);

    useEffect(()=>{
        setToolbarTab("Flashcards");
    },[tab]);



    return (
        <ToolbarContext.Provider value = { toolbarContextProviderValue }>
        <div className="toolbar-wrapper">
            <div className="toolbar-container">

                {/**Header */}

                <ToolbarHeader 
                    setSearchResults = { setSearchResults }
                    setIsSearchLoading = { setIsSearchLoading }
                />

                {/** Toolbar Body */}
                <ToolbarBody
                    searchResults = { searchResults }
                    setSearchResults = { setSearchResults }
                    isSearchLoading = { isSearchLoading }
                />
                

                {/** Footer */}
                <ToolbarFooter 
                    restart = { restart }
                    redo = { redo }
                    undo = { undo }
                />
            </div>

            
        </div>
        </ToolbarContext.Provider>
    )
}

export default Toolbar;