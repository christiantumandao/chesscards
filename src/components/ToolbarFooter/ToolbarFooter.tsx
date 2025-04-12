import "./toolbarFooter.css";

import { useContext, useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaArrowsAltV, FaRedo } from "react-icons/fa";
import { BoardStateContext, PlayContext, startingFen } from "../../util/contexts";
import { Chess, validateFen } from "chess.js";
import { useLocation } from "react-router-dom";

interface ToolbarFooterProps {
    restart: () => void,
    undo: () => void,
    redo: () => void,

}

const ToolbarFooter = ({restart, undo, redo }: ToolbarFooterProps) => {

    const [pgn, setPgn] = useState<string>("");
    const [fen, setFen] = useState<string>("");
    const [loadInErrorMessage, setLoadInErrorMessage] = useState<string>("");
    const [option, setOption] = useState<"pgn" | "fen" | "">("");

    const { playMode } = useContext(PlayContext);
    const { color, setColor, setGame, setMoveHistory, setHistory, setCurrMove } = useContext(BoardStateContext); 
    
    const currPath = useLocation();

    useEffect(()=> {
        setLoadInErrorMessage("");
        setPgn("");
        setFen("");
    },[option]);

    const handleUploadPGN = () => {
        try {
            if (pgn.length === 0) return;

            const newGame = new Chess();
            newGame.loadPgn(pgn);
            
            if (newGame.fen() === startingFen) {
                setLoadInErrorMessage("Invalid PGN format");
                return;
            }

            setGame(newGame);

            const newMoveHistory = newGame.history();
            setMoveHistory(newMoveHistory);
            setCurrMove(newMoveHistory.length - 1);

            const newHistory: string[] = [];
            const temp = new Chess();
            temp.loadPgn(pgn);

            while (temp.fen() !== startingFen) {
                newHistory.unshift(temp.fen());
                temp.undo()
            }
            newHistory.unshift(startingFen);
            setHistory(newHistory);

            setOption("");
            setPgn("");
            setLoadInErrorMessage("");
        } catch (e) {
            console.error(e);
            setLoadInErrorMessage("Invalid PGN format");
        } finally {

        }
    }

    const handleUploadFEN = () => {
        try {

            if (!validateFen(fen)) {
                setLoadInErrorMessage("Invalid FEN format");
                return;
            }

            const newGame = new Chess(fen);
            setGame(newGame);

            setMoveHistory([]);
            setCurrMove(0);
            setHistory([fen]);

            setOption("");
            setFen("");
            setLoadInErrorMessage("");
        } catch (e) {
            console.error(e);
            setLoadInErrorMessage("Invalid PGN format");
        } finally {

        }
    }

    const getUploadInput = () => {
        return (
            <div className="upload-container">
                <div className="upload-container-header">
                    <button 
                    className="upload-back-btn"
                    onClick = { () => setOption("") }>
                        <FaArrowLeft />
                    </button>

                    <p className="error-message"> { loadInErrorMessage } </p>
                </div>

                <textarea
                    placeholder = { `Paste ${option.toUpperCase()} to upload here.`}
                    value = { (option === "pgn") ? pgn : fen }
                    onChange = { (option === "pgn") ? (e) => setPgn(e.target.value) : (e) => setFen(e.target.value) }
                    rows = { 4 } />

                <button 
                onClick = { (option === "pgn") ? handleUploadPGN : handleUploadFEN }
                className="upload-btn">
                    Upload
                </button>
            </div>
        )      
    }

    const getExploreButtons = () => {
        return (
            <div className="explore-buttons-container">
                <button 
                className="explore-btn" onClick = { () => setOption("pgn")}>
                    Upload PGN
                </button>    

                <button
                className="explore-btn" onClick = { () => setOption("fen")}>
                    Upload FEN
                </button>
            </div> 
        )     
    }

    return(
        <>
            {
                (currPath.pathname === "/" && option === "") ? 
                    getExploreButtons() 
                : (currPath.pathname === "/" && option !== "") ? 
                    getUploadInput() : null
            }
            <div className="toolbar-footer">
                <div className="buttons-container">
                    {
                    (playMode === "") ? 
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
        </>
    )
}

export default ToolbarFooter;