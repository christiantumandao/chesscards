import React, { useContext, useEffect, useState } from "react";
import "./flashcard.css";
import "./../../../../styles/loading.css";

import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { db } from "../../../../firebase.config";
import { doc, setDoc } from "@firebase/firestore";
import { AutoPlayContext, CardsContext, PlayContext, ToolbarContext, UserContext } from "../../../../util/contexts";
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
    const { playMode, flashcardIdx } = useContext(PlayContext);
    const { autoPlayOpening } = useContext(AutoPlayContext);
    const { currentFolder, setCurrentFolder, toolbarTab, editFlashcardsMode } = useContext(ToolbarContext);
    const { user } = useContext(UserContext);

    const [editName, setEditName] = useState(false);
    const [newName, setNewName] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(()=>{
        setNewName("");
    },[editName]);

    useEffect(() => {
        setEditName(false);
    },[editFlashcardsMode])

    const handleDeleteFlashcard = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        try {
            setIsLoading(true);
            if (toolbarTab === "Flashcards") await deleteFlashcard(flashcard);
            else if (toolbarTab === "FolderFocus" && currentFolder) await deleteFlashcard(flashcard);
            else {
                console.error("Error resolving flashcard/folder for deletion");
            }

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
                    {(playMode !== "") ? null : flashcard.moves }
                </p>
            </>
        )
    }

    const getEditFlashcard = () => {
        return (
            <form 
                className="edit-flashcard-name-form"
                onSubmit = { handleEditFlashcardName }>
                <label>
                    Change name
                <input 
                    placeholder={(flashcard) ? flashcard.name: undefined }
                    value = { newName }
                    onChange = { (e) => setNewName(e.target.value)}
                    onClick = { (e) => e.stopPropagation()}
                    required
                />
                </label>

                <button 
                    onClick = { (e) => e.stopPropagation()}
                    className= {(newName.length === 0) ? "display-none" : "edit-flashcard-btn green-btn" }
                    type="submit">
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
            className={(isLoading) ? "shimmer flashcard-wrapper" : (playMode === "flashcards" && idx === flashcardIdx) ? "flashcard-wrapper flashcard-highlight" : "flashcard-wrapper"} 
            onClick ={ () => {
                if (playMode === "") autoPlayOpening(flashcard)
            }}>
          
            

            <div className={ (isLoading) ? "hidden" : "flashcard-body" }>
            {
                (!editName) ?  
                    getFlashcardContent() :
                    getEditFlashcard()
            }
            </div>

            {
                (editName && editFlashcardsMode) ?
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