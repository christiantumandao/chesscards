import { useEffect, useContext } from "react";

import "./game.css";

import 'firebase/firestore';

import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { useLocation } from "react-router-dom";
import { incrementCorrects, incrementIncorrects } from "../../services/userSetters";
import { AutoPlayContext, BoardStateContext, PlayContext, startingFen } from "../../util/contexts";
import { MoveVerbose } from "../../types/states";
import { parseMovesIntoArray } from "../../util/formatting";
import { findOpening } from "../../services/dbGetters";

const animationSpeed = 100;

interface GameProps {
    makeAMove: (newMove: MoveVerbose | string) => void
    onFinishFlashcards: () => void
}

const Game = ({ makeAMove, onFinishFlashcards }: GameProps) => {

    const { game, color,
        setCurrOpening, setHistory, setMoveHistory, setCurrMove, setGame
     } = useContext(BoardStateContext);

    const { playMode, flashcardIdx, setFlashcardIdx, flashcardMoves, setFlashcardMoves, playerMoveIdx, setPlayerMoveIdx, testingFlashcards, flash, setFlash,
            currTrie, trieHead, setCurrTrie,
     } = useContext(PlayContext);

     const { autoPlay } = useContext(AutoPlayContext);


    const currPath = useLocation();

    /* Game Logic
        if applicable, useEffect1 will fire
        when useEffect1 fires or player makes move, useEffect 2 fires and invokes validateMove
        validateMove() checks if the flashcard is completed
            if not, will look the next move in checkBot() before continuing
        checkBot() see's if the bot must play
            if not (the bot made this move), we increment the playerMoveIdx
            if so, we increment moveIdx (from user move), and make the bot move

        repeat, this cycle also applies to the bot move not just player move
    */

    // useEffect 1
    // when using a flashcard, the bot must play first:
    useEffect(()=>{
        setTimeout(()=>{
            if (playMode === "flashcards" && color==='black' && playerMoveIdx===0 && flashcardMoves) {
                makeAMove(flashcardMoves[0]);

            } else if (playMode === "freestyle" && color === 'black' && playerMoveIdx === 0 && currTrie) {
                // making random move among children in currTrie node
                const childrenArr = Object.keys(currTrie.children);
                const randomIdx = Math.floor(Math.random() * childrenArr.length);
                makeAMove(childrenArr[randomIdx]);
            }
        }, 1000);
    },[playMode, playerMoveIdx,
        flashcardMoves, color])

    // useEffect 2
    // for updating the title of opening is being played in toolbar
    // for checking and proceding in flashcard testing
    useEffect(()=> {
        if (playMode === "") {
            handleFindOpening(); 
        } else if (currPath.pathname === "/flashcards") {
            const moveHistory = game.history();
            const move = moveHistory[moveHistory.length - 1];
            setTimeout(()=>{
                if (game.fen() === startingFen) return;
                else if (playMode === "flashcards") validateMove_flashcards(move);
                else if (playMode === "freestyle") validateMove_freestyle(move);
            }, animationSpeed)
        } 
    },[game, currPath, playMode]);

    const validateMove_freestyle = (move: string) => {
        if (!move) return;
        const childrenArr = Object.keys(currTrie.children);
        const isCorrect = childrenArr.includes(move);

        if (isCorrect) {
            const nextTrie = currTrie.children[move];
            if (Object.keys(nextTrie.children).length === 0) {
                onNextFreestyle();
            } else {
                checkBot_freestyle(move);
            }

        } else {
            setFlash("red");
            incrementIncorrects();
            setPlayerMoveIdx(0);
            setGame(new Chess());
            setCurrTrie(trieHead);

            setHistory([startingFen]);
            setMoveHistory([]);
            setCurrMove(0);

            
        }

    }

    const validateMove_flashcards = (move: string) => {
        if (!move) return;

        const isCorrect = (flashcardMoves[playerMoveIdx] === move);
        if (isCorrect) {
            // next flashcard
            if ((playerMoveIdx + 1) >= flashcardMoves.length) {
                onNextFlashcard();
            // next move in flashcard
            } else {
                checkBot_flashcards();
            }
        } else {
            setFlash("red");
            incrementIncorrects();
            setPlayerMoveIdx(0);

            setGame(new Chess());
            setHistory([startingFen]);
            setMoveHistory([]);
            setCurrMove(0);
            
        }
        
    }


    /**
     * once bot has played, will trigger use effect again 
     * and enter the root else statement
     */

    const checkBot_freestyle = (move: string) => {
        if ((color === 'black' && playerMoveIdx % 2 === 1) || (color === 'white' && playerMoveIdx % 2 === 0)) {
            
            setTimeout(()=>{
                
                const newCurrTrie = currTrie.children[move];
                const childrenArr = Object.keys(newCurrTrie.children);
                const randomIdx = Math.floor(Math.random() * childrenArr.length);
                makeAMove(childrenArr[randomIdx]);
                
                if (Object.keys(newCurrTrie.children).length === 0) {
                    onNextFreestyle();
                // next move in flashcard
                } else {
                    setCurrTrie(currTrie.children[move]);
                    setPlayerMoveIdx(playerMoveIdx+1);
                }
            }, animationSpeed);         
        } else {
            // updating states and await player move
            setCurrTrie(currTrie.children[move]);
            setPlayerMoveIdx(playerMoveIdx+1);
        }
    }

    const checkBot_flashcards = () => {
        // checking if move prompts bot
        if ((color === 'black' && playerMoveIdx % 2 === 1) || (color === 'white' && playerMoveIdx % 2 === 0)) {
            
            setTimeout(()=>{
                makeAMove(flashcardMoves[playerMoveIdx+1]);
                if ((playerMoveIdx + 1) >= flashcardMoves.length) {
                    onNextFlashcard();
                // next move in flashcard
                } else {
                    setPlayerMoveIdx(playerMoveIdx+1);
                }
            }, animationSpeed);

        // if not a bot play (or bot has played)
        } else {
            setPlayerMoveIdx(playerMoveIdx+1);
        }
        // checking player move
    }

    const onNextFreestyle = () => {
        setTimeout(()=>{
            setFlash("green");
            incrementCorrects();
    
            setGame(new Chess());
            setCurrTrie(trieHead);
            setMoveHistory([]);
            setHistory([startingFen]);
            setPlayerMoveIdx(0);
        },500);   
    }


    const onNextFlashcard = () => {
        setTimeout(()=>{
            setFlash("green");
            incrementCorrects();

            if ((flashcardIdx + 1) >= testingFlashcards.length) {
                onFinishFlashcards();
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
        },500);
    }
    
  
   /* const findOpening = async () => {
        try {
            const currFen = game.fen();
            if (currFen === startingFen) return;

            const openingsCollection = collection(db, 'openings');
            
            const q =  query(openingsCollection, where("fen", "==",currFen));

            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const match = querySnapshot.docs[0].data() as Flashcard;
              setCurrOpening(match);
            } else {
              // opening not in db
              setCurrOpening(null);
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
    } */

    const handleFindOpening = async () => {
        try {
            const currFen = game.fen();
            if (currFen === startingFen) return;

            const res = await findOpening(game.fen());

            setCurrOpening(res);
        } catch (error) {
            console.error('Error finding opening ', error);
        }
    }
    
    const onDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
        const move = makeAMove({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // always promote to a queen for example simplicity
        });

        if (move === null) return false;
        return true;
    } 

    useEffect(()=>{
        if (flash !== "") {
            setTimeout(()=> {
                setFlash("");
            },1000)
        }
    },[flash, setFlash])
    console.log(flash);
    return (
        <div className="game-wrapper">
            <div className={(flash === "green") ? "gamegui-container flash-green" : (flash==="red") ? "gamegui-container flash-red" : (flash === "") ? "gamegui-container" : "gamegui-container"}>

                <Chessboard 
                    position = { game.fen() }
                    onPieceDrop = { onDrop }
                    

                    // this is to prevent animation when player makes the move
                    animationDuration={ (autoPlay) ? animationSpeed : 
                        (
                            (autoPlay) || (
                                (playMode !== "") && (
                                    (playerMoveIdx % 2 === 0 && color === "black") || 
                                    (playerMoveIdx % 2 !== 0 && color === "white")
                                )
                            )
                        ) ? animationSpeed :
                         0 
                    }

                    boardOrientation={(color==='both') ? 'white' : color}
                    customBoardStyle = { (window.innerWidth > 425) ?                  
                        { borderRadius: '5px' } : {} }
                    arePremovesAllowed ={ true }
                    customDropSquareStyle = {{ boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.4)' }}
                    arePiecesDraggable = { true }
                />
            </div>

        </div>
    );
}

export default Game;

