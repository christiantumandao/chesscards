import { useState, useEffect, useContext } from "react";
import "./selectOpeningsInFolder.css";

import { FaWindowClose } from "react-icons/fa";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import { db } from "../../../../../firebase.config";
import { useNavigate } from "react-router-dom";
import FlashcardToSelect from "./FlashcardToSelect";
import { CardsContext, ToolbarContext, UserContext } from "../../../../../util/contexts";
import { Flashcard, Folder } from "../../../../../types/db";


const SelectOpeningsInFolder = () => {

     const { flashcards, folders, setFolders } = useContext(CardsContext);
     const { currentFolder, setCurrentFolder, setAddOpeningsToFolder } = useContext(ToolbarContext);
     const { user } = useContext(UserContext);

    const nav = useNavigate();

    const [selectedFlashcards, setSelectedFlashcards] = useState<Flashcard[]>([]);
    const [addableFlashcards, setAddableFlashcards] = useState<Flashcard[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(()=> {

        const filterFlashcards = () => {
            if (currentFolder) {
                const flashcardEcos = currentFolder.openings.map((f)=>f.eco);
                const newAddableFlashcards = flashcards.filter((flashcard) => !flashcardEcos.includes(flashcard.eco)) as Flashcard[];
                setAddableFlashcards(newAddableFlashcards);
            }
        }

        filterFlashcards();

    },[flashcards, currentFolder]);

    const handleAddOpenings = async () => {

        if (!user || selectedFlashcards.length === 0 || !currentFolder) return;

        try {
            setIsLoading(true);
            
            const folderRef = doc(db, "userData", user.uid, "folders", currentFolder.name);
            const folderSnap = await getDoc(folderRef);
            if (folderSnap.exists()) {

                const newFolder = {
                    ...folderSnap.data(),
                    arcadeHighscore: 0,
                    flashcardsHighscore: -1,
                    timedHighscore: 0,
                } as Folder;
                
                selectedFlashcards.forEach(opening => {
                    newFolder.openings.push(opening);
                });

                await setDoc(folderRef, newFolder)

                setAddOpeningsToFolder(false);
                setSelectedFlashcards([]);

                const newFolders = folders.filter((f) => f.name !== newFolder.name);
                setCurrentFolder(newFolder);
                newFolders.push(newFolder);
                setFolders(newFolders);

            } else {
                console.error("Error: folder not found in DB");
            }

        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }


    const getHeader = () => {
        return (
            <div className={(isLoading) ? "hidden" : "add-openings-modal-header"}>

                <button onClick = {()=> setAddOpeningsToFolder(false) }className="close-add-openings-modal-btn">
                    <FaWindowClose />
                </button>

                <h4>Add Flashcards to { currentFolder?.name }</h4>

            </div>
        )
    }

    const getFlashcardsToAdd = () => {
        return (
            (addableFlashcards.length > 0) ? 

                addableFlashcards.map((flashcard, idx)=>
                    <FlashcardToSelect 
                        key = { flashcard.moves  + idx}
                        flashcard = { flashcard }
                        setSelectedFlashcards = { setSelectedFlashcards }
                        selectedFlashcards = { selectedFlashcards }
                        selected = { selectedFlashcards.some(f => f.moves + idx === flashcard.moves + idx) }
                    />
                ) 
            : 
                <h5 className="no-openings-to-add">
                    You do not seem to have openings to add to this folder... Add openings to your main flashcards list in Explore.
                </h5>
        )
    }

    const getButtons = () => {
        return (
        
            (addableFlashcards.length === 0) ? 
                <button
                className={(isLoading) ? "hidden" : "add-openings-btn" }
                onClick = { () => nav("/") }>
                    Explore
                </button>
            :
                <button 
                className={(isLoading) ? "hidden" : "add-openings-btn" }
                onClick = { handleAddOpenings }>
                    Add Openings
                </button>
        )
    }

    return (
        <div className = {(isLoading) ? "shimmer add-openings-modal-container" : "add-openings-modal-container"}>

            { getHeader() }

            <div className={(isLoading) ? "hidden" : "add-openings-modal-body"}>
                { getFlashcardsToAdd() }
            </div>

            { getButtons() }

        </div>
    )
}

export default SelectOpeningsInFolder;