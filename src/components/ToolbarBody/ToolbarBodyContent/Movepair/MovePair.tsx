import { useContext } from "react";
import { BoardStateContext } from "../../../../contexts";
import "./movePair.css"
import { Chess } from "chess.js";

interface MovePairProps {
    idx: number
}

const MovePair = ({ idx }: MovePairProps) => {

    const { moveHistory, currMove, setCurrMove, history, setGame } = useContext(BoardStateContext);

    const pairIdx = Number((idx === 0) ? "1. " : (idx+2) / 2 +".");

    const handleClick = (color: "w" | "b") => {
        try {
            const moveIdx = (color === "w") ? idx+1 : idx+2;

            const newGame = new Chess(history[moveIdx]);
            setGame(newGame);
            setCurrMove(moveIdx);

        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className={(pairIdx % 2 !== 0) ? "movepair-container movepair-shadow" : "movepair-container"}>
            <div className="move-number">
                {
                    (idx === 0) ? "1." : 
                    (idx+2) / 2 +"."
                }
            </div>
            <button 
            className={ (currMove === idx+1) ? "move-btn move-highlight" : "move-btn" }
            onClick = { () => handleClick("w") }>
                {moveHistory[idx]}
            </button>
            {
                (idx+1 <= moveHistory.length - 1) ? 
                <button 
                className={ (currMove === idx+2) ? "move-btn move-highlight" : "move-btn" }
                onClick = { () => handleClick("b") }>
                    { moveHistory[idx+1] }
                </button> : null
            }
        </div>
    )
}

export default MovePair;