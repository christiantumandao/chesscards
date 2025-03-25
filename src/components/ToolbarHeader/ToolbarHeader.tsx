import { useState, useEffect, useContext } from "react";
import "./toolbarHeader.css";

import { formatCustomMoveHistory, formatName, parseMovesToString } from "../../util/formatting";
import { db } from "../../firebase.config";
import { doc, setDoc } from "@firebase/firestore";

import { CgAddR, CgCheckR } from "react-icons/cg";
import { useLocation } from "react-router-dom";

import { Flashcard } from "../../types/db"
import { BoardStateContext, CardsContext, PlayContext, startingFen, TabContext, ToolbarContext, UserContext } from "../../contexts";

import GetSignInMessageToolbar from "./GetSignInMessage";
import TopHeaderPlay from "./TopHeaderPlay";
import TopHeaderExplore from "./TopHeaderExplore";

interface ToolbarHeaderProps {
    setSearchResults: (newVal: Flashcard[]) => void,
    handleBegin: () => void,
    onFinishFlashcards: () => void,
    handleFreestyle: () => void,
    handleSkip: () => void,
    setIsSearchLoading: (val: boolean) => void
}

const ToolbarHeader = (props: ToolbarHeaderProps) => {

    const { setSearchResults, handleBegin, onFinishFlashcards, 
            handleFreestyle, handleSkip, setIsSearchLoading
    } = props;

    const currPath = useLocation();
    
    const [modal, setModal] = useState<"sign-in" | "added" | "">("");
    const [showAddButton, setShowAddButton] = useState<boolean>(true);
    const [isAddLoading, setIsAddLoading] = useState<boolean>(false);

    const { game, currOpening, moveHistory, currMove } = useContext(BoardStateContext);
    const { addOpeningsToFolder, toolbarTab } = useContext(ToolbarContext);
    const { testMode, freestyle }= useContext(PlayContext);
    const { flashcards, setFlashcards }= useContext(CardsContext);
    const { user }= useContext(UserContext);
    const { tab }= useContext(TabContext);


    // if the current position changes, then currOpening will change, and so add showAddButton
    useEffect(()=> {
        if (game.fen() === startingFen || testMode || freestyle) setShowAddButton(false);
        else if (flashcards.some((flashcard) => flashcard.fen === game.fen())) {
            setShowAddButton(false);
        } else {
            setShowAddButton(true);
        }

    },[currOpening, flashcards, game, testMode, freestyle])

    const addOpening = async () => {
        if (!user) {
            setModal("sign-in");
            return;
        }
        try {
            setIsAddLoading(true);
            const name = (currOpening) ? currOpening.moves : parseMovesToString(moveHistory);
            const isAdded = (flashcards.some((flashcard) => flashcard.moves === name))
            if (isAdded) {
                setModal("added");
                setShowAddButton(false);
                setIsAddLoading(false);
                return;
            }


            const flashcardMoves = (currOpening) ? currOpening.moves : parseMovesToString(moveHistory);
            const flashcardECO = (currOpening) ? currOpening.eco : "usr";
            const flashcardName = (currOpening) ? currOpening.name : flashcardMoves;

            const docRef = doc(db, "userData", user.uid, "flashcards", flashcardECO);
            await setDoc(docRef, {
                fen: game.fen(),
                eco: flashcardECO, 
                moves: flashcardMoves,
                name: flashcardName,
            });

            const newFlashcards = [...flashcards] as Flashcard[];
            newFlashcards.push({...currOpening, id: currOpening?.eco} as Flashcard);
            setFlashcards(newFlashcards);
            setShowAddButton(false);       
            
        } catch (e) {
            console.error(e);
        } finally {
            setIsAddLoading(false);
        }
        
    }


    return (
        <div className="toolbar-header">
            <h2 className="toolbar-title">{(tab === 'test') ? "Your Openings" : "Explorer"}</h2>
                {
                    (currPath.pathname === "/") ? 
                        <TopHeaderExplore 
                            setSearchResults = { setSearchResults }
                            setIsSearchLoading = { setIsSearchLoading }
                        /> 
                    : 
                    (!addOpeningsToFolder && (toolbarTab === "Flashcards" || toolbarTab === "FolderFocus")) ?
                        <TopHeaderPlay 
                            handleSkip = { handleSkip }
                            handleBegin = { handleBegin }
                            handleFreestyle = { handleFreestyle }
                            onFinishFlashcards = { onFinishFlashcards }
                        />
                    : 
                    <div className="selectcolor-container"></div>
                }

            <div className="toolbar-description">
                { (freestyle) ? "Freestyle Aracde" : (currOpening) ? formatName(currOpening) : (game.fen() !== startingFen) ? formatCustomMoveHistory(moveHistory, currMove) : null }

                {
                    (freestyle) ? null :
                    (showAddButton) ?           
                        <button 
                        className={(isAddLoading) ? "hidden" : "add-opening-btn"}
                        onClick = { addOpening }>
                            <CgAddR />
                        </button> 
                    : 
                    (game.fen() !== startingFen) ?
                        <button className="tooltip-container" disabled>
                            <CgCheckR />
                            <div className="tooltip">
                                Opening is added
                            </div>
                        </button> : null

                }

                <GetSignInMessageToolbar 
                    modal = { modal }
                    setModal= { setModal}
                />

                
            </div>

        </div>
    )
}

export default ToolbarHeader;