import React, { useContext } from "react";
import { Flashcard } from "../../../../../types/db";
import { AutoPlayContext } from "../../../../../contexts";

interface FlashcardToSelectProps {
    selected: boolean,
    flashcard: Flashcard,
    selectedFlashcards: Flashcard[]
    setSelectedFlashcards: (val: Flashcard[]) => void
}

const FlashcardToSelect = (props: FlashcardToSelectProps) => {

    const { flashcard, setSelectedFlashcards, selectedFlashcards, selected } = props;

    const { autoPlayOpening } = useContext(AutoPlayContext);

    const handlePlay = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        autoPlayOpening(flashcard);
    }
    return (
        <div onClick = {()=>{
            if (!selected) {
                const newSelectedFlashcards = [...selectedFlashcards];
                newSelectedFlashcards.push(flashcard);
                setSelectedFlashcards(newSelectedFlashcards);
            } else {
                const newSelectedFlashcards = selectedFlashcards.filter((f) => f.moves !== flashcard.moves);
                setSelectedFlashcards(newSelectedFlashcards);
            }

        }}
        className="flashcard-to-add-container">
            <input 
                type='checkbox'
                checked = { selected }
                onChange = {()=>{}}
                
            />
            <div className="flashcard-to-add-left">
                <div className={(selected) ? "fta-title fta-title-selected" : "fta-title"}>
                    { flashcard.name }
                </div>
                <div className={(selected) ? "fta-moves fta-moves-selected" : "fta-moves"}>
                    { flashcard.moves }
                </div>
            </div>
            <div className="flashcard-to-add-right">
                <button className="play-btn" onClick = { handlePlay }>
                    Play
                </button>

            </div>
        </div>
    )
}

export default FlashcardToSelect;