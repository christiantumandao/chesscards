import { useEffect, useContext } from "react";

import "./game.css";

import 'firebase/firestore';
import checkmarkIcon from "../../assets/checkmark.svg" ;
import xIcon from "../../assets/xMark.svg" ;

import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { useLocation } from "react-router-dom";
import { incrementCorrects, incrementIncorrects } from "../../services/userSetters";
import { AutoPlayContext, BoardStateContext, PlayContext, startingFen } from "../../util/contexts";
import { MoveVerbose } from "../../types/states";
import { parseMovesIntoArray } from "../../util/formatting";
import { findOpening } from "../../services/dbGetters";

const animationSpeed = 100;
const transitionSpeed = 750;

interface GameProps {
    makeAMove: (newMove: MoveVerbose | string) => void
    lastSquare: string | null
    setLastSquare: (newVal: string | null) => void,
}

const Game = ({ makeAMove, lastSquare, setLastSquare }: GameProps) => {

    const { game, color,
        setCurrOpening, setHistory, setMoveHistory, setCurrMove, setGame
     } = useContext(BoardStateContext);

    const { playMode, flashcardIdx, setFlashcardIdx, flashcardMoves, setFlashcardMoves, playerMoveIdx, setPlayerMoveIdx, testingFlashcards, flash, setFlash,
            currTrie, trieHead, setCurrTrie, setInGameCorrects, inGameCorrects, onFinishFlashcards
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
        }, animationSpeed);
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
            if (game.fen() === startingFen) return;
            else if (playMode === "flashcards") validateMove_flashcards(move);
            else if (playMode === "freestyle") validateMove_freestyle(move);
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
            triggerIncorrectAnimation();
            setTimeout(()=>{
                incrementIncorrects();
                setPlayerMoveIdx(0);
                setGame(new Chess());
                setCurrTrie(trieHead);
    
                setHistory([startingFen]);
                setMoveHistory([]);
                setCurrMove(0);
            },transitionSpeed)

            
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
                setTimeout(()=>{
                    checkBot_flashcards();
                },animationSpeed)
            }

        } else {
            setFlash("red");
            incrementIncorrects();
            triggerIncorrectAnimation();
            
            setTimeout(()=>{
                setPlayerMoveIdx(0);

                setGame(new Chess());
                setHistory([startingFen]);
                setMoveHistory([]);
                setCurrMove(0);
            },transitionSpeed)
            
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
            if ((playerMoveIdx + 1) >= flashcardMoves.length) {
                makeAMove(flashcardMoves[playerMoveIdx+1]);
                 
                onNextFlashcard();
                return;
            }
            setTimeout(()=>{
                makeAMove(flashcardMoves[playerMoveIdx+1]);
                setPlayerMoveIdx(playerMoveIdx+1);
            }, animationSpeed);

        // if not a bot play (or bot has played)
        } else {
            setPlayerMoveIdx(playerMoveIdx+1);
        }
    }

    const onNextFreestyle = () => {
        setFlash("green");
        triggerCorrectAnimation();
        incrementCorrects();
        setInGameCorrects(inGameCorrects + 1);
        
    
        setTimeout(()=>{
            setGame(new Chess());
            setCurrTrie(trieHead);
            setMoveHistory([]);
            setHistory([startingFen]);
            setPlayerMoveIdx(0);
        }, transitionSpeed);   
    }


    const onNextFlashcard = () => {
        setFlash("green");
        triggerCorrectAnimation();
        incrementCorrects();
        setInGameCorrects(inGameCorrects + 1);

        setTimeout(()=>{
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
        },transitionSpeed);
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

    const triggerCorrectAnimation = () => {

        const target = document.querySelector(`[data-square='${lastSquare}']`) as HTMLElement;
        const imgElement = document.createElement("img");
        imgElement.src = checkmarkIcon;  // Replace with your image URL
        target?.appendChild(imgElement);

        if (target == null) return;

        target.style.position = "relative";
        imgElement.style.position = "absolute";
        imgElement.style.top = "-10px";
        imgElement.style.right = "-10px";
        imgElement.style.height = "2rem";
        imgElement.style.width = "2rem";
        imgElement.style.zIndex = "100";

        setTimeout(()=> {
            imgElement.remove();
            setLastSquare(null);
        },transitionSpeed);
        
    }

    const triggerIncorrectAnimation = () => {

        const target = document.querySelector(`[data-square='${lastSquare}']`) as HTMLElement;
        const imgElement = document.createElement("img");
        imgElement.src = xIcon;  // Replace with your image URL
        target?.appendChild(imgElement);

        if (target == null) {
            return;
        };

        target.style.position = "relative";
        imgElement.style.position = "absolute";
        imgElement.style.top = "-10px";
        imgElement.style.right = "-10px";
        imgElement.style.height = "2rem";
        imgElement.style.width = "2rem";
        imgElement.style.zIndex = "100";

        setTimeout(()=> {
            imgElement.remove();
            setLastSquare(null);
        },transitionSpeed);
        
    }



    return (
        <div className="game-wrapper">
            <div className={"gamegui-container"}>

                <Chessboard 
                    position = { game.fen() }
                    onPieceDrop = { onDrop }
                    

                    // this is to prevent animation when player makes the move
                    animationDuration = { (autoPlay || playMode !== "") ? animationSpeed : 0 }

                    boardOrientation = { (color==='both') ? 'white' : color }
                    customBoardStyle = { (window.innerWidth > 425) ?                  
                        { borderRadius: '5px' } : {} }
                    customDropSquareStyle = {{ boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.4)' }}
                    arePiecesDraggable = { true }


                />
            </div>
        </div>
    );
}

export default Game;

