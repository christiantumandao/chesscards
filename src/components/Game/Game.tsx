import { useEffect, useContext, useState } from "react";

import "./game.css";

import 'firebase/firestore';

import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import { Chess, Move, Square } from "chess.js";
import { useLocation } from "react-router-dom";
import { incrementCorrects, incrementIncorrects } from "../../services/userSetters";
import { AutoPlayContext, BoardStateContext, PlayContext, startingFen } from "../../util/contexts";
import { MoveVerbose } from "../../types/states";
import { parseMovesIntoArray } from "../../util/formatting";
import { findOpening } from "../../services/dbGetters";
import { AudioType } from "../Main/MainBody";

//import { generateBoard } from "react-chessboard";

const animationSpeed = 100;
const transitionSpeed = 750;

interface GameProps {
    makeAMove: (newMove: MoveVerbose | string) => boolean
    lastSquare: string | null,
    setLastSquare: (newVal: string | null) => void,
    playSound: (audio: AudioType) => void,
    lastMove: Move | undefined
}

interface Arrow {
    startSquare: string,
    endSquare: string,
    color: string
}

const Game = ({ makeAMove, lastSquare, setLastSquare, lastMove, playSound }: GameProps) => {

    const { game, color,
        setCurrOpening, setHistory, setMoveHistory, setCurrMove, setGame, moveHistory
     } = useContext(BoardStateContext);

    const { playMode, flashcardIdx, setFlashcardIdx, flashcardMoves, setFlashcardMoves, playerMoveIdx, setPlayerMoveIdx, testingFlashcards,
            currTrie, trieHead, setCurrTrie, setInGameCorrects, inGameCorrects, onFinishFlashcards, setTime, time
     } = useContext(PlayContext);

     const { autoPlay } = useContext(AutoPlayContext);

     const onDrop = ({sourceSquare, targetSquare}: PieceDropHandlerArgs): boolean => {
        if (!targetSquare) return false;
        const move = makeAMove({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // always promote to a queen for example simplicity
        });

        if (move === null) return false;
        return true;
    }
    
    //const [squareStyles, setSquareStyles] = useState<Record<string, React.CSSProperties>>({});
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState({});
    const [displayedArrows, setDisplayedArrows] = useState<Arrow[]>([]);

    const currPath = useLocation();


    /*useEffect(() => {
        const _color = (color === "both") ? "white" : color;
        const board = generateBoard(8,8, _color);

    },[]);*/

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
            if ((playMode === "flashcards" || playMode === "timed")  && 
                color==='black' && playerMoveIdx===0 && 
                flashcardMoves) {
                    makeAMove(flashcardMoves[0]);

            } else if ((playMode === "freestyle" || playMode === "arcade") && 
                color === 'black' && 
                playerMoveIdx === 0 && 
                currTrie) {
                    // making random move among children in currTrie node
                    const childrenArr = Object.keys(currTrie.children);
                    const randomIdx = Math.floor(Math.random() * childrenArr.length);
                    makeAMove(childrenArr[randomIdx]);
            }
        }, animationSpeed);

    },[playMode, playerMoveIdx, flashcardMoves, color])

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
            else if (playMode === "flashcards" || playMode === "timed") validateMove_flashcards(move);
            else if (playMode === "freestyle" || playMode === "arcade") validateMove_freestyle(move);
        } 
    },[game, currPath, playMode]);

    const validateMove_freestyle = (move: string) => {
        if (!move) return;
        const childrenArr = Object.keys(currTrie.children);
        const isCorrect = childrenArr.includes(move);

        if (isCorrect) {
            
            const nextTrie = currTrie.children[move];

            // if last move in the flashcard
            if (Object.keys(nextTrie.children).length === 0) {
                onNextFreestyle();
            } else {
                checkBot_freestyle(move);
            }

        } else {
            triggerIncorrectAnimation();
            playSound("incorrect");
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
            if ((playerMoveIdx + 1) === flashcardMoves.length) {
                playSound("correct");
                onNextFlashcard();
            // next move in flashcard
            } else {
                setTimeout(()=>{
                    checkBot_flashcards();
                },animationSpeed)
            }

        } else {
            incrementIncorrects();
            drawCorrectArrow(flashcardMoves[playerMoveIdx]);
            playSound("incorrect");
            triggerIncorrectAnimation();
            
            setTimeout(()=>{
                setPlayerMoveIdx(0);

                setGame(new Chess());
                setHistory([startingFen]);
                setMoveHistory([]);
                setCurrMove(0);
                setDisplayedArrows([]);
            },transitionSpeed)
            
        }
        
    }

    const drawCorrectArrow = (move: string) => {

        try {
            const gameCopy = new Chess();
            gameCopy.loadPgn(game.pgn());
            gameCopy.undo();
            const correctMove = gameCopy.move(move, {verbose: true} as any);
            const arrow = [{
                startSquare: correctMove.from,
                endSquare: correctMove.to,
                color: "orange"
            }] as Arrow[];
            setDisplayedArrows(arrow);
        } catch (e) {
            console.error(`Error drawing arrow: ${e}`);
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
        triggerCorrectAnimation();
        incrementCorrects();
        setInGameCorrects(inGameCorrects + 1);

        if (playMode === "arcade") {
            const increment = Math.floor((moveHistory.length / 2));
            setTime(time + increment);
            //console.log("increment: ", increment);
        }
        
    
        setTimeout(()=>{
            setGame(new Chess());
            setCurrTrie(trieHead);
            setMoveHistory([]);
            setHistory([startingFen]);
            setPlayerMoveIdx(0);
        }, transitionSpeed);   
    }


    const onNextFlashcard = () => {
        triggerCorrectAnimation();
        incrementCorrects();
        setInGameCorrects(inGameCorrects + 1);

        if (playMode === "timed") {
            const increment = Math.floor((moveHistory.length / 2));
            setTime(time + increment);
            //console.log("increment: ", increment);
        }


        setTimeout(()=>{

            if (flashcardIdx + 1 >= testingFlashcards.length) {
                switch (playMode) {
                    case "flashcards":
                        onFinishFlashcards();
                        break;
                    case "timed":
                        const newFlashcard = testingFlashcards[0];
                        const newMoves = parseMovesIntoArray(newFlashcard.moves);
                        setGame(new Chess());
                        setCurrOpening(newFlashcard);
                        setFlashcardIdx(0);
                        setFlashcardMoves(newMoves);
                        setMoveHistory([]);
                        setPlayerMoveIdx(0);
                        break;
                }
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

    const triggerCorrectAnimation = () => {

        if (lastMove) {
            console.log("test");
            setOptionSquares({      
                [lastMove.to]: {
                    backgroundColor: 'rgba(0,255,0,0.4)'
                },
                [lastMove.from]: {
                    backgroundColor: 'rgba(0,255, 0,.2'
                }

            })
        }

        setTimeout(()=> {
            //imgElement.remove();
            setLastSquare(null);
            setOptionSquares({});
        },transitionSpeed);
        
    }

    const triggerIncorrectAnimation = () => {


        if (lastSquare && lastMove && lastMove.from) {
            setOptionSquares({      
                [lastMove.to]: {
                    backgroundColor: 'rgba(255,0,0,0.4)'
                },
                [lastMove.from]: {
                    backgroundColor: 'rgba(255, 0, 0,.2'
                }

            })
        }

        setTimeout(()=> {
            //imgElement.remove();
            setLastSquare(null);
            setOptionSquares({});
        },transitionSpeed);
        
    }


    const onSquareClick = ({ square, piece }: SquareHandlerArgs) => {
      // piece clicked to move
      if (!moveFrom && piece) {
        // get the move options for the square
        const hasMoveOptions = getMoveOptions(square as Square);

        // if move options, set the moveFrom to the square
        if (hasMoveOptions) {
          setMoveFrom(square);
        }

        // return early
        return;
      }

      // square clicked to move to, check if valid move
      const moves = game.moves({
        square: moveFrom as Square,
        verbose: true
      });
      const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

      // not a valid move
      if (!foundMove) {
        // check if clicked on new piece
        const hasMoveOptions = getMoveOptions(square as Square);

        // if new piece, setMoveFrom, otherwise clear moveFrom
        setMoveFrom(hasMoveOptions ? square : '');

        // return early
        return;
      }

        const res: boolean = makeAMove({
            from: moveFrom,
            to: square,
            promotion: 'q'
        });
        if (res === false) {
            // if invalid, setMoveFrom and getMoveOptions
            const hasMoveOptions = getMoveOptions(square as Square);

            // if new piece, setMoveFrom, otherwise clear moveFrom
            if (hasMoveOptions) {
            setMoveFrom(square);
            }

            // return early
            return;
        }

        setMoveFrom('');
        setOptionSquares({}); 
    }

    const getMoveOptions = (square: Square) => {
      // get the moves for the square
      const moves = game.moves({
        square,
        verbose: true
      });

      // if no moves, clear the option squares
      if (moves.length === 0) {
        setOptionSquares({});
        return false;
      }

      // create a new object to store the option squares
      const newSquares: Record<string, React.CSSProperties> = {};

      // loop through the moves and set the option squares
      for (const move of moves) {
        newSquares[move.to] = {
          background: game.get(move.to) && game.get(move.to)?.color !== game.get(square)?.color ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)' // larger circle for capturing
          : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
          // smaller circle for moving
          borderRadius: '50%'
        };
      }

      // set the square clicked to move from to yellow
      newSquares[square] = {
        background: 'rgba(255, 255, 0, 0.4)'
      };

      // set the option squares
      setOptionSquares(newSquares);

      // return true to indicate that there are move options
      return true;
    }

    const boardOptions = {
        position: game.fen() ,
        onPieceDrop: onDrop,
        dropSquareStyle: {
            boxShadow: 'inset 0px 0px 0px 5px rgba(255,255,255,.5)'
        },

        onSquareClick,

        // this is to prevent animation when player makes the move
        animationDuration: (autoPlay || playMode !== "") ? animationSpeed : 0 ,

        boardOrientation:  (color==='both') ? 'white' : color,
        customBoardStyle:  (window.innerWidth > 425) ?                  
            { borderRadius: '5px' } : {} ,
        customDropSquareStyle: { boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.4)' },
        arePiecesDraggable: true ,
        squareStyles: optionSquares,
        id: 'click-or-drag-to-move',

        arrows: displayedArrows
    };



    return (
        <div className="game-wrapper">
            <div className={"gamegui-container"}>

                <Chessboard options = { boardOptions }
                />
            </div>
        </div>
    );
}

export default Game;

