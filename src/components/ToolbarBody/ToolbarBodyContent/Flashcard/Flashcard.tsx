import React, { useContext, useEffect, useState } from "react";
import "./flashcard.css";
import "./../../../../styles/loading.css";

import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { db } from "../../../../firebase.config";
import { doc, setDoc } from "@firebase/firestore";
import { AutoPlayContext, CardsContext, PlayContext, ToolbarContext, UserContext } from "../../../../contexts";
import { Flashcard as FlashcardType } from "../../../../types/db";

interface FlashcardProps {
    flashcard: FlashcardType,
    idx: number,
    editFlashcard: boolean,
    deleteFlashcard: (val: FlashcardType) => void
}

const Flashcard = (props: FlashcardProps) => {
    const { flashcard,
            idx, 
            deleteFlashcard, 
            editFlashcard } = props;

    const { flashcards, setFlashcards, folders, setFolders } = useContext(CardsContext);
    const { freestyle, testMode, flashcardIdx } = useContext(PlayContext);
    const { autoPlayOpening } = useContext(AutoPlayContext);
    const { currentFolder, setCurrentFolder, toolbarTab } = useContext(ToolbarContext);
    const { user } = useContext(UserContext);

    const [editName, setEditName] = useState(false);
    const [newName, setNewName] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(()=>{
        setNewName("");
    },[editName])

    const handleDeleteFlashcard = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        try {
            if (toolbarTab === "Flashcards") await deleteFlashcard(flashcard);
            else if (toolbarTab === "FolderFocus" && currentFolder) await deleteFlashcard(flashcard);
            else {
                console.error("Error resolving flashcard/folder for deletion");
            }
            setIsLoading(true);

        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const getFlashcardContent = () => {
        return(
            <>
                <h4 className="flashcard-title">
                    { (flashcard) ? parseName() : null}
                </h4>
                <p>
                    {(testMode || freestyle) ? null : flashcard.moves }
                </p>
            </>
        )
    }

    const getEditFlashcard = () => {
        return (
            <form 
                className="edit-flashcard-name-form"
                onSubmit = { handleEditFlashcardName }>
                    
                <input 
                    placeholder={(flashcard) ? parseName() : undefined }
                    value = { newName }
                    onChange = { (e) => setNewName(e.target.value)}
                    onClick = { (e) => e.stopPropagation()}
                    required
                />
                <button 
                    onClick = { (e) => e.stopPropagation()}
                    className= "edit-flashcard-btn green-btn" type="submit">
                    Change
                </button>

            </form>
        )
    }

    const getFlashcardButtons = () => {
        if (user && !editName && editFlashcard) {
        return (
            <button 
                onClick = { (e)=> {
                    setEditName(true); 
                    e.stopPropagation()
                }}
                className={(isLoading) ? "hidden" : "flashcard-button-container edit-flashcard-button"}>
                <FaRegEdit />
            </button>
        )}
        else return null;
    }


    const handleEditFlashcardName = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;
       
        setIsLoading(true); // set false at end of both function
        (currentFolder && toolbarTab === "FolderFocus") ? handleEditInFolder() : handleEditFlashcard();
    }

    const handleEditInFolder = async () => {
        if (!currentFolder || !user) {
            console.error("Could not resolve folder.");
            return;
        }
        try {
            const ref = doc(db, "userData", user.uid, "folders", currentFolder.name);


            const newFolder = {
                name: currentFolder.name,
                openings: currentFolder.openings.map((opening) => {
                if (opening.moves === flashcard.moves) {
                    return {...opening, name: newName};
                } else return opening;
            })}

            await setDoc(ref, newFolder)

            const newFolders = folders.map((folder)=> {
                if (folder.name === currentFolder.name) {
                    return newFolder;
                } else return folder;
            })
            setFolders(newFolders);
            setCurrentFolder(newFolder);
            setEditName(false);
            setNewName("");

        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const handleEditFlashcard = async () => {
        if (!user) {
            console.error("Could not resolve user");
            return;
        }
        try {
            const ref = doc(db, "userData", user.uid, "flashcards", flashcard.id);
            const newFlashcard = {...flashcard, name: newName};
            const newFlashcards = flashcards.map((f)=> {
                if (f.id === flashcard.id) {
                    return newFlashcard;
                } else return f;
            })
            await setDoc(ref, newFlashcard)

            setNewName("");
            setFlashcards(newFlashcards);
            setEditName(false);     

        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const getEditFlashcardButton = () => {
        return (
            <button 
                onClick = { (e)=> { 
                    setEditName(false); 
                    e.stopPropagation()
                }}
                className=  {(isLoading) ? "hidden" : "edit-flashcard-button"}>
                Cancel
            </button>
        )
    }

    const parseName = () => {
        return "["+flashcard.eco+"] "+flashcard.name;
    }


    return (
        <div 
            className={(isLoading) ? "shimmer flashcard-wrapper" : (testMode && idx === flashcardIdx) ? "flashcard-wrapper flashcard-highlight" : "flashcard-wrapper"} 
            onClick ={ () => {
                if (!testMode && !freestyle) autoPlayOpening(flashcard)
            }}>
          
            

            <div className={ (isLoading) ? "hidden" : "flashcard-body" }>
            {
                (!editName) ?  
                    getFlashcardContent() :
                    getEditFlashcard()
            }
            </div>

            {
                (editName) ?
                    getEditFlashcardButton() :
                    getFlashcardButtons()
            }

            {
                (editFlashcard) ? 
                   <button 
                    onClick = { handleDeleteFlashcard }
                    className={(isLoading) ? "hidden" : "red-btn delete-flashcard-btn flashcard-button-container"}>
                        <FaRegTrashAlt />
                   </button>
                : null
            }



        </div>
    );
}

export default Flashcard;