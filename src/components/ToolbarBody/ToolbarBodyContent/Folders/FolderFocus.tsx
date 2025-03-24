import { useState, useEffect, useContext } from "react";
import { FaPlusCircle } from "react-icons/fa";
import Flashcard  from "../Flashcard/Flashcard";
import SelectOpeningsInFolder from "./SelectOpenings/SelectOpeningsInFolder";
import { useNavigate } from "react-router-dom";
import { PlayContext, ToolbarContext, UserContext } from "../../../../contexts";
import { Flashcard as FlashcardType } from "../../../../types/db";

interface FolderFocusProps {
    deleteFlashcard: (fc: FlashcardType) => void
}

const FolderFocus = ({deleteFlashcard}: FolderFocusProps) => {

    const { currentFolder, addOpeningsToFolder, setAddOpeningsToFolder, toolbarTab, editFolderMode } = useContext(ToolbarContext); 
    const { testMode, freestyle } = useContext(PlayContext);
    const { user } = useContext(UserContext);

    const [showSignInMsg, setShowSignInMsg] = useState(false);
    const nav = useNavigate();  
    
    useEffect(()=>{
        setShowSignInMsg(false);

        return ()=>{
            setShowSignInMsg(false);
        }
    },[toolbarTab]);

    const getAddToFolderElement = () => {
        return (
            (addOpeningsToFolder || editFolderMode || testMode || freestyle) ? null :
            <button 
                onClick = { ()=> (user) ? setAddOpeningsToFolder(true) : setShowSignInMsg(true) }
                className="add-folder-wrapper">
                    <FaPlusCircle />
                    <h4>Add Openings</h4>
            </button>
        )
    }

    const getSignInMessage = () => {
        return (
            <div className="add-folder-input-wrapper">
                <div>
                    You must be signed in to edit this folder!
                </div>

                <button 
                    className="add-folder-sign-in-msg"
                    onClick = { () => nav("/log-in") }>
                    Sign in here
                </button>
            </div>
        )
    }

    const showFolderOpenings = () => {
        return (

            currentFolder?.openings.map((opening, idx)=>(
                <Flashcard 
                    key = { opening.moves + idx }
                    idx = { idx }
                    flashcard = { opening }
                    editFlashcard = { editFolderMode }
                    deleteFlashcard={ () => {} }
                />
            ))

        );
    }

    const showEditFolderOpenings = () => {
        return (

            currentFolder?.openings.map((opening, idx)=>(
                <Flashcard 
                    key = { opening.moves + idx }
                    idx = { idx }
                    flashcard = { opening }
                    editFlashcard = { true }
                    deleteFlashcard = { deleteFlashcard }

                />
            ))

        );
    }

    return (
        
        (addOpeningsToFolder && currentFolder) ? 
            <SelectOpeningsInFolder /> 
        :
        (editFolderMode && currentFolder) ? 
            showEditFolderOpenings()
        :
            <div className="flashcards-container">
                { (showSignInMsg) ? getSignInMessage() : getAddToFolderElement() }
                { showFolderOpenings() }
            </div>
        
    )
}

export default FolderFocus;