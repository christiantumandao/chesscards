import { useContext } from "react";
import MovePair from "./MovePair";
import { deleteDoc, doc, setDoc } from "@firebase/firestore";
import { db } from "../../../firebase.config";
import Flashcard from "./Flashcard/Flashcard";
import FolderFocus from "./Folders/FolderFocus";
import Folders from "./Folders/Folders";
import { useLocation } from "react-router-dom";
import { BoardStateContext, CardsContext, PlayContext, startingFen, ToolbarContext, UserContext } from "../../../contexts";
import { Flashcard as FlashcardType, Folder } from "../../../types/db";

interface ToolbarContentProps { 
    searchResults: FlashcardType[]
}

const ToolbarContent = ({ searchResults }: ToolbarContentProps) => {

    const { flashcards, setFlashcards, folders, setFolders } = useContext(CardsContext);
    const { currentFolder, setCurrentFolder, 
            toolbarTab, editFlashcardsMode } = useContext(ToolbarContext);
    const { user } = useContext(UserContext);
    const { freestyle } = useContext(PlayContext);
    const { game, moveHistory } = useContext(BoardStateContext);

    const currPath = useLocation();

    const deleteFlashcardFromFolder = async (fc: FlashcardType) => {
        if (!user) return;
        if (!currentFolder || !fc) {
            console.error("Error resolving folder/flashcard");
            return;
        }
        if (user && currentFolder && fc) {
            try {
                const ref = doc(db, "userData", user.uid, "folders", currentFolder.name);

                const newCurrentFolder = { ...currentFolder } as Folder;
                newCurrentFolder.openings = currentFolder.openings.filter((opening) => (
                    opening.eco !== fc.eco &&
                    opening.name !== fc.name &&
                    opening.moves !== fc.moves &&
                    opening.fen !== fc.fen
                ))

                // TO DO CHECK THIS
                const newFolders = folders.map((folder)=>{
                    if (folder.name === currentFolder.name) return newCurrentFolder;
                    else return folder;
                })
                
                await setDoc(ref, newCurrentFolder)
                setCurrentFolder(newCurrentFolder);
                setFolders(newFolders);

            } catch(e) {
                console.error(e);
            } 
        }
    }

    // this is ONLY for deleting flashcards from main set
    const deleteFlashcardFromMain = async (fc: FlashcardType) => {
        if (!user) {
            console.error('User not signed in');
            return;
        };
        if (!fc || !fc.id) {
            console.error("Issue resolving flashcard to delete");
            return;
        }

        try {
            
            const ref = doc(db, "userData", user.uid, "flashcards", fc.id);
            await deleteDoc(ref)

            const newFlashcards = flashcards.filter((f)=>f.id !== fc.id);
            setFlashcards(newFlashcards);


        } catch (e) {
            console.error(e);
        }
    }

    // TODO: might have a duplicate 
    const showMoveHistory = () => {
        return (
            <div className="">
                {
                    moveHistory.map((move, idx)=> (
                       (idx % 2 === 0) ? 
                            <MovePair
                                key = { move } 
                                idx = { idx } 
                            /> 
                        : null
                    ))
                }
            </div>
        )
    }

    const getFolderContents = () => {
        return (
            <FolderFocus 
                deleteFlashcard = { deleteFlashcardFromFolder }

            />
        )
    }

    const getExploreInit = () => {
        return (
            <h1 className="empty-query-message">
                Play a move or search for an opening above to get started.
            </h1>
        )
    }

    const getSearchResults = () => {
        return (
            searchResults.map((flashcard, idx)=>(
                <Flashcard
                    key = { flashcard.moves }
                    idx = { idx }
                    editFlashcard = { false }
                    flashcard = { flashcard }
                    deleteFlashcard={ ()=>{} }
                />
            ))
        )
    }


    return (
            (toolbarTab === "Folders" && currPath.pathname === "/flashcards") ?             
                <Folders />          
            :
            (toolbarTab === "FolderFocus" && currentFolder && currPath.pathname === "/flashcards" && !freestyle) ?
                getFolderContents()
            :
            (freestyle) ? 
                showMoveHistory() 
            :
            <div className="flashcards-container">
            {
                // if in flashcard mode
                (flashcards && currPath.pathname === "/flashcards") ?
                    flashcards.map((flashcard, idx)=>(
                        <Flashcard 
                            key = { flashcard.moves + idx }
                            idx = { idx }
                            flashcard = { flashcard }
                            deleteFlashcard = { deleteFlashcardFromMain }
                            editFlashcard = { editFlashcardsMode }

                        />
                    )) 
                // if searched, none found
                /*: (searchResults && searchResults.length === 1 && currPath.pathname === "/" && searchResults[0] === "empty" && !currOpening) ?
                    <h1 className="empty-query-message">
                        No openings found. Try a different query or play a move to get started.
                    </h1>*/
                // if nothing done so far

                : (searchResults.length === 0 && currPath.pathname === "/" && game.fen() === startingFen) ?
                    getExploreInit()
                // if searched and has results
                : (searchResults && searchResults.length > 0 && currPath.pathname === "/") ?
                    getSearchResults()
                : (currPath.pathname === "/") ? 
                    showMoveHistory()
                : null
                
            }
            </div>
    )
}

export default ToolbarContent;