import { useContext, useState } from "react";
import "./toolbarHeader.css";

import { BoardStateContext, CardsContext, PlayContext, ToolbarContext, UserContext } from "../../util/contexts";
import { BsCaretDown } from "react-icons/bs";
import { FaRegQuestionCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import shuffleCards from "../../util/shuffleCards";
import { Color } from "../../types/states";
import Timer from "./Timer";
import { Chess } from "chess.js";
import { parseHighscoreTime, parseMovesIntoArray } from "../../util/formatting";
import { incrementIncorrects } from "../../services/userSetters";

interface TopHeaderPlayProps {
    handleBegin: () => void,
    handleFreestyle: () => void,
}

type gameModeType = "standard" | "freestyle";

const TopHeaderPlay = ({ handleBegin, handleFreestyle }: TopHeaderPlayProps) => {

    const { playMode, inGameCorrects, localFlashcardsHighscore, localFreestyleHighscore,
        onFinishFreestyle, onFinishFlashcards, setPlayerMoveIdx, 
        setFlashcardMoves, setFlashcardIdx, testingFlashcards, flashcardIdx, setHasSkippedFlashcard,
     } = useContext(PlayContext);
    const { color, setColor, setGame, setMoveHistory, setCurrOpening } = useContext(BoardStateContext);
    const { flashcards, setFlashcards } = useContext(CardsContext);
    const { editFlashcardsMode, editFolderMode, currentFolder, 
            toolbarTab, setCurrentFolder } = useContext(ToolbarContext);
    const { userData } = useContext(UserContext);

    const [gameMode, setGameMode] = useState<gameModeType>("standard");


    const handleSkip = () => {
        incrementIncorrects();
        setHasSkippedFlashcard(true);

        if ((flashcardIdx + 1) >= testingFlashcards.length) {
            onFinishFlashcards(setCurrentFolder); // cannot be called in freestyle so its fine
            return;
        }
        const idx = flashcardIdx+1;
        const newFlashcard = testingFlashcards[idx];
        const newMoves = parseMovesIntoArray(newFlashcard.moves);

        setGame(new Chess());

        setCurrOpening(newFlashcard);
        setFlashcardIdx(idx);
        setFlashcardMoves(newMoves);
        setMoveHistory([]);

        setPlayerMoveIdx(0);

    }


    const handleStart = () => {
        if (gameMode === "standard") {
            handleBegin();
        } else {
            handleFreestyle();
        }
    }

    const getHeaderOptions = () => {
        return (
            <>
                <div className="selectcolor-element">
                    <label>
                        Color
                        <div className="select-element">
                            <select                 
                                value = { color }
                                onChange = { (e: React.ChangeEvent<HTMLSelectElement>)=> setColor(e.target.value as Color)}
                                >
                                <option value = "both">Both</option>
                                <option value = "white">White</option>
                                <option value = "black">Black</option>
                            </select>
                            <BsCaretDown />
                        </div>
                    </label>
                </div>

                <div className="selectcolor-element">
                    <label>
                    Mode
                    <span className="tooltip-container">
                            {" "}<FaRegQuestionCircle />
                            <span className="tooltip">
                                <Link to="/about">Read more</Link>
                            </span>

                    </span>

                        <div className="select-element">
                            <select
                                value = { gameMode }
                                onChange = { (e) => setGameMode(e.target.value as gameModeType) }
                            >
                                <option value = "standard">Flashcards</option>
                                <option value = "freestyle">Arcade</option>
                            </select>
                            <BsCaretDown />

                        </div>
                    </label>

                </div>


                <button 
                    className="begin-test selectcolor-element" 
                    onClick={ handleStart }>
                        Begin
                </button>

                <button 
                    onClick ={ ()=> shuffleCards(flashcards, setFlashcards) } 
                    className="shuffle-button selectcolor-element"
                >
                    Shuffle
                </button>
            </>
        )
    } 

    const getHighScore = () => {
        let highscore: any = "";

        // userData.flashcardsHighscore
 

        if (playMode === "flashcards") {
            if (toolbarTab === "Flashcards" && userData) highscore = userData.flashcardsHighscore;
            else if (toolbarTab === "Flashcards" && !userData) highscore = localFlashcardsHighscore;
            else if (toolbarTab === "FolderFocus" && currentFolder) highscore = currentFolder.flashcardsHighscore;

            highscore = parseHighscoreTime(highscore);
        }

        else if (playMode === "freestyle") {
            if (toolbarTab === "Flashcards" && userData) highscore = userData.arcadeHighscore;
            else if (toolbarTab === "Flashcards" && !userData) highscore = localFreestyleHighscore;
            else if (toolbarTab === "FolderFocus" && currentFolder) highscore = currentFolder.arcadeHighscore;
        }
        
        if (highscore === -1) return 0;

        return highscore;
    }


    const getPlayingHeader = () => {

        const dir = (gameMode === "standard") ? "UP" 
            : (gameMode === "freestyle") ? "DOWN" 
            : ("UP");
            
        return (
            <>

                <div className="score-container">
                    <label>
                        Score:
                        <div className="score-number">
                            { inGameCorrects }
                        </div>
                    </label>

                    <label>
                        High score:
                        <div className="score-number">
                            {
                                getHighScore()
                            }

                        </div>
                    </label>
                </div>
                <Timer 
                    direction = { dir }
                />

                

                <button
                    className="skip-btn"
                    onClick = { handleSkip }
                >
                    Skip
                </button> 
                
                <button 
                    className="exit-test red-btn" 
                    onClick = { handleExit }>
                        Exit
                </button>

            </>
        );
    }

    const handleExit = () => {
        
        if (playMode === "flashcards") {
            onFinishFlashcards(setCurrentFolder);
        } else if (playMode === "freestyle") {
            onFinishFreestyle(setCurrentFolder);
        } else {
            console.error("error: playing on timed playMode");
        }
    
    }


    return (
        <div className="selectcolor-container">
                    
            {
                (playMode !== "") ? 
                    getPlayingHeader()
                : (!editFlashcardsMode && !editFolderMode) ? 
                    getHeaderOptions()
                : null
            }
        </div> 
    )
}

export default TopHeaderPlay;