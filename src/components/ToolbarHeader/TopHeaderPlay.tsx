import { useContext, useState } from "react";
import "./toolbarHeader.css";

import { BoardStateContext, CardsContext, PlayContext, ToolbarContext, UserContext } from "../../util/contexts";
import { BsCaretDown } from "react-icons/bs";
import { FaRegQuestionCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import shuffleCards from "../../util/shuffleCards";
import { Color, PlayModeType } from "../../types/states";
import Timer from "./Timer";
import { Chess } from "chess.js";
import { parseHighscoreTime, parseMovesIntoArray } from "../../util/formatting";
import { incrementIncorrects } from "../../services/userSetters";
import buildTrie, { Trie } from "../../util/Trie";

interface TopHeaderPlayProps {
}


const TopHeaderPlay = ({  }: TopHeaderPlayProps) => {

    const { playMode, inGameCorrects, localFlashcardsHighscore, localFreestyleHighscore, localTimedHighscore,
        setPlayerMoveIdx, setFlashcardMoves, setFlashcardIdx, testingFlashcards, flashcardIdx, setHasSkippedFlashcard, resetVariables, setCurrTrie, trieHead, setTrieHead,
        beginFreestyle, beginFlashcards, onFinishFlashcards,onFinishFreestyle
     } = useContext(PlayContext);
    const { color, setColor, setGame, setMoveHistory, setCurrOpening } = useContext(BoardStateContext);
    const { flashcards, setFlashcards } = useContext(CardsContext);
    const { editFlashcardsMode, editFolderMode, currentFolder, 
            toolbarTab } = useContext(ToolbarContext);
    const { userData } = useContext(UserContext);

    const [gameMode, setGameMode] = useState<PlayModeType>("flashcards");


    const handleSkip = () => {

        setHasSkippedFlashcard(true);

        if (playMode === "flashcards") {
            incrementIncorrects();
            if ((flashcardIdx + 1) >= testingFlashcards.length) {
                resetVariables(); // cannot be called in freestyle so its fine
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
        } else if (playMode === "freestyle" || playMode === "arcade") {
            setGame(new Chess());
            setCurrTrie(trieHead);
        }


    }

    const handleBeginFreestyle = () => {
        if (gameMode !== "freestyle" && gameMode !== "arcade") return;

        let head = new Trie();

        if (toolbarTab === "FolderFocus" && (!currentFolder || currentFolder.openings.length === 0)) return;
        if (toolbarTab === "FolderFocus" && currentFolder && currentFolder.openings.length > 0) head = buildTrie(currentFolder?.openings);
        else head = buildTrie(flashcards);  
        setTrieHead(head);

        const folderName = (currentFolder) ? currentFolder.name:0;
        beginFreestyle(gameMode, color, head,folderName);

    }



    const handleBeginFlashcards = () => {
        if (gameMode !== "flashcards" && gameMode !== "timed") return;

        if (toolbarTab === "FolderFocus" && (!currentFolder || currentFolder.openings.length === 0)) return;
        if (toolbarTab === "FolderFocus" && currentFolder && currentFolder.openings.length > 0) beginFlashcards(gameMode, color, currentFolder.openings, currentFolder.name);
        else beginFlashcards(gameMode, color, flashcards, 0);
    }

    const handleStart = () => {
        if (gameMode === "flashcards" || gameMode === "timed") {
            handleBeginFlashcards();
        } else {
            handleBeginFreestyle();
        }
    }

    const handleExit = () => {
        if (playMode === "timed") {
            onFinishFlashcards();
            return;
        } else if (playMode === "arcade") {
            onFinishFreestyle();
            return;
        }
        resetVariables();
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
                                onChange = { (e) => setGameMode(e.target.value as PlayModeType) }
                            >
                                <option value = "flashcards">Flashcards</option>
                                <option value = "timed">Timed</option>
                                <option value = "freestyle">Freestyle</option>
                                <option value = "arcade">Arcade</option>
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

            if (highscore === -1) highscore = "n/a";
            else highscore = parseHighscoreTime(highscore);
        }

        else if (playMode === "arcade") {
            if (toolbarTab === "Flashcards" && userData) highscore = userData.arcadeHighscore;
            else if (toolbarTab === "Flashcards" && !userData) highscore = localFreestyleHighscore;
            else if (toolbarTab === "FolderFocus" && currentFolder) highscore = currentFolder.arcadeHighscore;
        }

        else if (playMode === "timed") {
            if (toolbarTab === "Flashcards" && userData) highscore = userData.timedHighscore;
            else if (toolbarTab === "Flashcards" && !userData) highscore = localTimedHighscore;
            else if (toolbarTab === "FolderFocus" && currentFolder) highscore = currentFolder.timedHighscore;
        }
        
        if (!highscore) highscore = 0;

        return highscore;
    }


    const getPlayingHeader = () => {

        const dir = (gameMode === "flashcards") ? "UP" 
            : "DOWN"
            
        return (
            <>

                <div className="score-container">
                    {
                        (playMode !== "flashcards") ?
                            <label>
                                Score:
                                <div className="score-number">
                                    { inGameCorrects }
                                </div>
                            </label>
                            : null
                    }


                    
                    {
                        (playMode !== "freestyle") ?
                        <label>
                            High score:
                            <div className="score-number">
                                {
                                    getHighScore()
                                }

                            </div>
                        </label>
                        : null
                    }

                    
                </div>
                {         
                    (playMode !== "freestyle") ?       
                        <Timer 
                            direction = { dir }
                        />
                        : null
                }


                

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