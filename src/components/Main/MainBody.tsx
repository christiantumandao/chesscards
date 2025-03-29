import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Flashcard } from "../../types/db";
import { Chess } from "chess.js";
import { Trie } from "../../util/Trie";
import { Color, MoveVerbose, PlayModeType } from "../../types/states"; 
import { AutoPlayContext, BoardStateContext, CardsContext, PlayContext, startingFen, TabContext } from "../../util/contexts";
import { incrementIncorrects } from "../../services/userSetters";
import Game from "../Game/Game";
import Toolbar from "../Toolbar/Toolbar";
import { parseMovesIntoArray } from "../../util/formatting";
import { AutoPlayContextType, BoardStateContextType, PlayContextType } from "../../types/contexts";


const MainBody = () => {

    const { tab } = useContext(TabContext);;

    // game state, always used when board is visible. this is in a context 
    const [game, setGame] = useState<Chess>(new Chess()); 
    const [history, setHistory] = useState<string[]>([startingFen]);  // holds the history of fens
    const [moveHistory, setMoveHistory] = useState<string[]>([]);     // holds history of moves
    const [currMove, setCurrMove] = useState<number>(0);                      // used for tracking player history
    const [currOpening, setCurrOpening]= useState<Flashcard | null>(null); // contains opening name of whatever is on board
    const [color, setColor] = useState<Color>("white"); 

    // auto playing openings
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    const [autoPlayIdx, setAutoPlayIdx] = useState<number>(0);
    const [autoPlayMoves, setAutoPlayMoves] = useState<string[]>([]);

    // for playing flashcards
    const [playMode, setPlayMode] = useState<PlayModeType>("");

    const [testingFlashcards, setTestingFlashcards] = useState<Flashcard[]>([]); 
    const [flashcardIdx, setFlashcardIdx] = useState<number>(0);            // idx for testingFlashcards
    const [flashcardMoves, setFlashcardMoves] = useState<string[]>([]);
    const [playerMoveIdx, setPlayerMoveIdx] = useState<number>(0);          // the move idx in testing a flashcard
    const [flash, setFlash] = useState<"green" | "red" | "">("");

    const [trieHead, setTrieHead] = useState<Trie>(new Trie());
    const [currTrie, setCurrTrie] = useState<Trie>(new Trie());


    const { flashcards } = useContext(CardsContext);


    const  makeAMove = useCallback( (move: MoveVerbose | string) => {
        try {
            const isFirstMove = (game.fen() === startingFen);
            const gameCopy = new Chess(game.fen());
            gameCopy.move(move);
            setGame(gameCopy);

            const newHistory = history.slice(0, currMove + 1);
            newHistory.push(gameCopy.fen());
            setHistory(newHistory);
            setCurrMove(currMove + 1);

            if (isFirstMove) {
                setMoveHistory([gameCopy.history()[0]]);
            } else {
                const newMoveHistory = moveHistory.slice(0, currMove);
                newMoveHistory.push(gameCopy.history()[0]);
                setMoveHistory(newMoveHistory);
            }

            return true;

        } catch {
            console.error("Invalid move:", move);
            return false;
        }
    },[currMove, game, history, moveHistory])


    // useEffect for autoplaying an opening
    useEffect(()=> {

        const autoPlayMove = () => {
            if (autoPlayIdx === autoPlayMoves.length) {
                setTimeout(()=>{
                    setAutoPlay(false);
                },1000)
            }
            else {
                setTimeout(()=> {
                
                    makeAMove(autoPlayMoves[autoPlayIdx]);
                    setAutoPlayIdx(autoPlayIdx + 1);
                },500);
            }
        }

        if (playMode === "" && autoPlay && autoPlayIdx <= autoPlayMoves.length) {
            autoPlayMove();
        }

    },[game, playMode, autoPlay, autoPlayIdx, autoPlayMoves, makeAMove])

    // incase user changes tab in middle of autoplaying an opening or playing flashcards
    useEffect(()=>{
        resetVariables();
    },[tab])

    // does not reset color
    const resetVariables = () => {

        const newGame = new Chess();
        setGame(newGame);
        setHistory([startingFen]);
        setCurrOpening(null);
        setMoveHistory([]);
        setCurrMove(0);

        setPlayMode("");
        setTestingFlashcards([]);
        setFlashcardIdx(0);
        setFlashcardMoves([]);
        setPlayerMoveIdx(0);

        setCurrTrie(new Trie());
        setTrieHead(new Trie());

        setAutoPlayIdx(0);
        setAutoPlay(false);
        setAutoPlayMoves([]);
}


    const beginFreestyle = (color: Color, head: Trie) => {
        if (Object.keys(head.children).length === 0) {
            console.error("No flashcards to build trie off of");
            return;
        }
        
        setColor(color);
        setTrieHead(head);
        setCurrTrie(head);
        setPlayMode("freestyle"); //double check
        setPlayerMoveIdx(0);
        setGame(new Chess());
        setMoveHistory([]);
        setHistory([startingFen]);

        // game logic in Game component

    }

    const testFlashcards = (color: Color, flashcardsToTest: Flashcard[]) => {
        if (flashcards.length === 0) {
            console.error("Do not have any flashcards to begin testing");
            return;
        }
        const firstMoveSet = parseMovesIntoArray(flashcardsToTest[0].moves);
        setTestingFlashcards(flashcardsToTest);
        setPlayMode("flashcards");
        setFlashcardIdx(0);
        setFlashcardMoves(firstMoveSet);
        setPlayerMoveIdx(0);
        setCurrOpening(flashcardsToTest[0]);
        setGame(new Chess());
        setMoveHistory([]);
        setHistory([startingFen]);
        setColor(color);

        // game logic in Game component
    }

    const handleSkip = () => {

        setFlash("red");
        incrementIncorrects();

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

    }

    const onFinishFlashcards = () => {
        resetVariables();
    }


    const autoPlayOpening = (flashcard: Flashcard) => {
        if (autoPlay === true) return; // have pop up saying auto play in progress
        setGame(new Chess());
        setHistory([startingFen]);
        setCurrMove(0);

        setMoveHistory([]);
        const moves = parseMovesIntoArray(flashcard.moves);
        setCurrOpening(flashcard);
        setAutoPlay(true);
        setAutoPlayMoves(moves);
        setAutoPlayIdx(0);
    }

    const restart = () => {
        const newGame = new Chess();
        setGame(newGame);
        setHistory([startingFen]);
        setMoveHistory([]);
        setCurrMove(0);
    }

    const redo = () => {
        if (currMove === history.length - 1) return;
        else {
            setCurrMove(currMove + 1);
            setGame(new Chess(history[currMove + 1]));
        }
    }

    const undo = () => {
        if (currMove === 0) return;
        else if (currMove === 1) {
            setCurrMove(0);
            setGame(new Chess());
        }
        else {
            setCurrMove(currMove -1);

            const prevMove = history[currMove - 1];
            setGame(new Chess(prevMove));
        }
    }

    // event listener for seeing player history with arrows
    useEffect(() => {

        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' && playMode === "") {
                undo();
            } else if (event.key === 'ArrowRight' && playMode === "") {
                redo();
                }
    
        }
    
        window.addEventListener('keydown', handleKeyPress);
    
        // Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            };
    },[playMode, currMove]);
    

    const boardContextProviderValue = useMemo(()=> ({
        game: game,
        history: history,
        moveHistory: moveHistory,
        currMove: currMove,
        currOpening: currOpening,
        color: color,

        setGame: setGame,
        setHistory: setHistory,
        setMoveHistory: setMoveHistory,
        setCurrMove: setCurrMove,
        setCurrOpening,
        setColor: setColor
      } as BoardStateContextType),[game, history, moveHistory, currMove, currOpening, color]);

      const autoPlayContextProviderValue = useMemo(()=>({
        autoPlay,
        autoPlayIdx,
        autoPlayMoves,

        setAutoPlay,
        setAutoPlayIdx,
        setAutoPlayMoves,

        autoPlayOpening
      } as AutoPlayContextType),[autoPlay, autoPlayIdx, autoPlayMoves]);

    const playContextProviderValue = useMemo(()=> ({
        testingFlashcards: testingFlashcards,
        flashcardIdx: flashcardIdx,
        flashcardMoves: flashcardMoves,
        playerMoveIdx: playerMoveIdx,

        flash: flash,

        trieHead: trieHead,
        currTrie: currTrie,

        playMode: playMode,
        

        setFlash: setFlash,
        setTestingFlashcards: setTestingFlashcards,
        setFlashcardIdx: setFlashcardIdx,
        setFlashcardMoves: setFlashcardMoves,
        setPlayerMoveIdx: setPlayerMoveIdx,

        setTrieHead: setTrieHead,
        setCurrTrie: setCurrTrie,
        setPlayMode: setPlayMode
    } as PlayContextType),[playMode, testingFlashcards, flashcardIdx, flashcardMoves, playerMoveIdx,
        trieHead, currTrie, flash
    ]);


    return (
        <div className="mainbody">


                <BoardStateContext.Provider value = { boardContextProviderValue }>
                    <PlayContext.Provider value = { playContextProviderValue }>
                        <AutoPlayContext.Provider value = { autoPlayContextProviderValue }>

                            <Game 
                                makeAMove = { makeAMove }
                                onFinishFlashcards = { onFinishFlashcards }
                            />
                            <Toolbar 
                                undo = { undo } 
                                redo = { redo }
                                restart = { restart }
                                handleSkip = { handleSkip }
                    
                                beginFreestyle = { beginFreestyle }
                                testFlashcards = { testFlashcards }
                                onFinishFlashcards = { onFinishFlashcards }
                            />

                        </AutoPlayContext.Provider>
                    </PlayContext.Provider>
                </BoardStateContext.Provider>
        </div>
    )
}

export default MainBody;