import { Flashcard } from "../../types/db";
import { useLocation } from "react-router-dom";

import { useContext, useEffect, useState } from "react";
import { BoardStateContext, CardsContext, startingFen, ToolbarContext } from "../../contexts";

import ToolbarBodyHeader from "./ToolbarBodyHeader";
import ToolbarContent from "./ToolbarBodyContent/ToolbarBodyContent";
import { FaArrowLeft } from "react-icons/fa";
import { Chess } from "chess.js";
interface ToolbarBodyProps {
    searchResults: Flashcard[],
    setSearchResults: (val: Flashcard[]) => void
    isSearchLoading: boolean,
}

const ToolbarBody = ( { searchResults, setSearchResults, isSearchLoading } : ToolbarBodyProps) => {

    const [pgn, setPgn] = useState<string>("");
    const [fen, setFen] = useState<string>("");
    const [loadInErrorMessage, setLoadInErrorMessage] = useState<string>("");
    const [option, setOption] = useState<"pgn" | "fen" | "">("");

    const { flashcards } = useContext(CardsContext);
    const { currentFolder } = useContext(ToolbarContext);
    const { setGame, setMoveHistory, setCurrMove, setHistory } = useContext(BoardStateContext);


    const currPath = useLocation();

    useEffect(()=> {
        setLoadInErrorMessage("");
        setPgn("");
    },[option]);

    const handleUploadPGN = () => {
        try {
            console.log("loading pgn");
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

            //console.log(newHistory);
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

    }

    const getExploreButtons = () => {
        if (option === "pgn") {
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
                        placeholder="Paste PGN to upload here."
                        value = { pgn }
                        onChange = { (e) => setPgn(e.target.value) }
                        rows = { 4 } />

                    <button 
                    onClick = { handleUploadPGN }
                    className="upload-btn">
                        Upload
                    </button>
                </div>
            )
        } else if (option === "fen") {
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
                        placeholder="Paste FEN to upload here."
                        value = { fen }
                        onChange = { (e) => setFen(e.target.value) }
                        rows = { 4 } />

                    <button 
                    onClick = { handleUploadFEN }
                    className="upload-btn">
                        Upload
                    </button>                  
                </div>
            )
        } else {
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
    }


    return (
        <>
            <div className = {  currentFolder && 
                                currPath.pathname === "/flashcards" ? "toolbar-body toolbar-body-folder-highlight" : "toolbar-body" }>

                {/** Header of Body */}

                {
                    (flashcards && currPath.pathname === "/flashcards") ? 
                        <ToolbarBodyHeader />
                    : 
                        null
                }


                {/** Body of Body */}
                
                <ToolbarContent 
                    searchResults = { searchResults }
                    isSearchLoading = { isSearchLoading }
                    setSearchResults ={ setSearchResults }
                />
                
                

            </div>
            {
                (currPath.pathname === "/") ? 
                    getExploreButtons() 
                : 
                    null
            }
        </>
    )
}


export default ToolbarBody;