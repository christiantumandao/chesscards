import "./toolbarFooter.css";

import { useContext } from "react";
import { FaArrowLeft, FaArrowRight, FaArrowsAltV, FaRedo } from "react-icons/fa";
import { BoardStateContext, PlayContext } from "../../contexts";

interface ToolbarFooterProps {
    restart: () => void,
    undo: () => void,
    redo: () => void,

}

const ToolbarFooter = ({restart, undo, redo }: ToolbarFooterProps) => {

    const { testMode, freestyle } = useContext(PlayContext);
    const { color, setColor } = useContext(BoardStateContext);

    return(
        <div className="toolbar-footer">
            <div className="buttons-container">
                {
                (!testMode && !freestyle) ? 
                <>
                    <button onClick = { restart }>
                        <FaRedo />
                    </button>

                    <button
                        onClick = { () => {
                            if (color === 'white' || color ==='both') setColor('black');
                            else setColor('white');
                        }}
                    >
                        <FaArrowsAltV />
                    </button>

                    <button onClick = { undo }>
                        <FaArrowLeft />
                    </button>

                    <button
                        onClick = { redo } >
                    <FaArrowRight />
                    </button>
                </> : null
                }
            </div>
        </div>
    )
}

export default ToolbarFooter;