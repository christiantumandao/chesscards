import { useContext, useEffect, useMemo, useState } from "react";
import "./toolbar.css";


import buildTrie, { Trie } from "../../util/Trie";
import { Flashcard, Folder } from "../../types/db";
import { BoardStateContext, CardsContext, PlayContext, TabContext, ToolbarContext } from "../../util/contexts";
import { Color } from "../../types/states";
import { ToolbarTab } from "./types";

import ToolbarFooter from "../ToolbarFooter/ToolbarFooter";
import ToolbarBody from "../ToolbarBody/ToolbarBody";
import ToolbarHeader from "../ToolbarHeader/ToolbarHeader";

interface ToolbarProps {
    undo: () => void,
    redo: () => void,
    restart: () => void, 
    handleSkip: () => void,
    beginFreestyle: (color: Color, head: Trie) => void,
    testFlashcards: (color: Color, flashcardsToTest: Flashcard[]) => void,
    onFinishFlashcards: () => void
}

const Toolbar = (props: ToolbarProps) => {

    const { undo, redo, restart,
            handleSkip,

            beginFreestyle, testFlashcards, onFinishFlashcards,
    } = props;

    const { color } = useContext(BoardStateContext);
    const { tab } = useContext(TabContext);
    const { flashcards } = useContext(CardsContext);
    const { setTrieHead } = useContext(PlayContext)

    const [searchResults, setSearchResults] = useState<Flashcard[]>([]);

    const [toolbarTab, setToolbarTab] = useState<ToolbarTab>("Flashcards");

    const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);

    const [editFolderMode, setEditFolderMode] = useState<boolean>(false);
    const [editFlashcardsMode, setEditFlashcardsMode] = useState<boolean>(false);
    const [addOpeningsToFolder, setAddOpeningsToFolder] = useState<boolean>(false);

    const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

    const toolbarContextProviderValue = useMemo(()=> ({
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
    }),[toolbarTab, currentFolder, editFolderMode, editFlashcardsMode, addOpeningsToFolder]);

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


    const handleFreestyle = () => {
        let head = new Trie();

        if (toolbarTab === "FolderFocus" && (!currentFolder || currentFolder.openings.length === 0)) return;
        if (toolbarTab === "FolderFocus" && currentFolder && currentFolder.openings.length > 0) head = buildTrie(currentFolder?.openings);
        else head = buildTrie(flashcards);  
        setTrieHead(head);
        beginFreestyle(color, head);

    }



    const handleBegin = () => {
        if (toolbarTab === "FolderFocus" && (!currentFolder || currentFolder.openings.length === 0)) return;
        if (toolbarTab === "FolderFocus" && currentFolder && currentFolder.openings.length > 0) testFlashcards(color, currentFolder.openings);
        else testFlashcards(color, flashcards);
    }


    return (
        <ToolbarContext.Provider value = { toolbarContextProviderValue }>
        <div className="toolbar-wrapper">
            <div className="toolbar-container">

                {/**Header */}

                <ToolbarHeader 
                    setSearchResults = { setSearchResults }
                    handleBegin = { handleBegin }
                    onFinishFlashcards = { onFinishFlashcards }
                    handleFreestyle = { handleFreestyle }
                    handleSkip = { handleSkip }
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