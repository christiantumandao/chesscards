import { useContext } from "react";
import "./toolbarHeader.css";

import { BoardStateContext, CardsContext, PlayContext, ToolbarContext } from "../../util/contexts";
import { BsCaretDown } from "react-icons/bs";
import { FaRegQuestionCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import shuffleCards from "../../util/shuffleCards";
import { Color } from "../../types/states";

interface TopHeaderPlayProps {
    handleSkip: () => void,
    handleBegin: () => void,
    handleFreestyle: () => void,
    onFinishFlashcards: () => void
}

const TopHeaderPlay = ({ handleBegin, handleSkip, handleFreestyle, onFinishFlashcards }: TopHeaderPlayProps) => {

    const { playMode } = useContext(PlayContext);
    const { color, setColor } = useContext(BoardStateContext);
    const { flashcards, setFlashcards } = useContext(CardsContext);
    const { editFlashcardsMode, editFolderMode } = useContext(ToolbarContext);

    return (
        <div className="selectcolor-container">
                    
            {
                (playMode !== "") ? 
                    <>
                        <div className="playing-as">
                            <p>Playing as:</p>
                            { 
                                (color === "white" ) ?
                                    <span>White</span>

                                : (color === "black") ?
                                    <span className="black">Black</span>

                                :
                                    <span className="both">Both</span>
                            }
                        </div>

                        {
                            (playMode !== "freestyle") ? 
                                <button
                                    className="skip-btn"
                                    onClick = { handleSkip }
                                    >
                                    Skip
                                </button> : null
                        }
                        <button 
                            className="exit-test red-btn" 
                            onClick = { () => onFinishFlashcards()}>
                                Exit
                        </button>

                    </>
                :
                (editFlashcardsMode || editFolderMode) ? null
                :
                    <>
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
                        <button 
                            className="begin-test" 
                            onClick={ handleBegin }>
                                Begin
                        </button>

                        <div className="freestyle-container">

                            <div className="tooltip-container">
                                <FaRegQuestionCircle />
                                <div className="tooltip">
                                    <Link to="/about">Read more</Link>
                                </div>
                            </div>
                            <button 
                            className = ""
                            onClick = { handleFreestyle }>
                                Freestyle

                            </button>
                        </div>

                        <button onClick ={ ()=> shuffleCards(flashcards, setFlashcards) } className="shuffle-button">
                            Shuffle
                        </button>
        
                
                    </>
                
            }
        </div> 
    )
}

export default TopHeaderPlay;