import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Flashcard, Folder, UserData } from "../../types/db";
import { Chess, Move } from "chess.js";
import { Trie } from "../../util/Trie";
import { Color, MoveVerbose, PlayModeType } from "../../types/states"; 
import { AutoPlayContext, BoardStateContext, CardsContext, PlayContext, startingFen, TabContext, UserContext } from "../../util/contexts";
import Game from "../Game/Game";
import Toolbar from "../Toolbar/Toolbar";
import { parseMovesIntoArray } from "../../util/formatting";
import { AutoPlayContextType, BoardStateContextType, PlayContextType } from "../../types/contexts";
import { updateFolderFlashcardsHighscore, updateFolderFreestyleHighscore, updateMainFlashcardsHighscore, updateMainFreestyleHighscore } from "../../services/updateHighScore";

const MainBody = () => {

    const { tab } = useContext(TabContext);;

    // game state, always used when board is visible. this is in a context 
    const [game, setGame] = useState<Chess>(new Chess()); 
    const [history, setHistory] = useState<string[]>([startingFen]);  // holds the history of fens
    const [moveHistory, setMoveHistory] = useState<string[]>([]);     // holds history of moves
    const [currMove, setCurrMove] = useState<number>(0);                      // used for tracking player history
    const [currOpening, setCurrOpening]= useState<Flashcard | null>(null); // contains opening name of whatever is on board
    const [color, setColor] = useState<Color>("white"); 
    const [lastMove, setLastMove] = useState<Move | undefined>(undefined); // this is for sound effects

    const [lastSquare, setLastSquare] = useState<string | null>(null);

    // auto playing openings
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    const [autoPlayIdx, setAutoPlayIdx] = useState<number>(0);
    const [autoPlayMoves, setAutoPlayMoves] = useState<string[]>([]);

    // for playing flashcards
    const [playMode, setPlayMode] = useState<PlayModeType>("");
    const [inGameCorrects, setInGameCorrects] = useState<number>(0);
    const [testingSetName, setTestingSetName] = useState<0 | string>(0);
    const [time, setTime] = useState<number>(0);
    const [hasSkippedFlashcard, setHasSkippedFlashcard] = useState<boolean>(false);

    const [testingFlashcards, setTestingFlashcards] = useState<Flashcard[]>([]); 
    const [flashcardIdx, setFlashcardIdx] = useState<number>(0);            // idx for testingFlashcards
    const [flashcardMoves, setFlashcardMoves] = useState<string[]>([]);
    const [playerMoveIdx, setPlayerMoveIdx] = useState<number>(0);          // the move idx in testing a flashcard
    const [flash, setFlash] = useState<"green" | "red" | "">("");

    const [trieHead, setTrieHead] = useState<Trie>(new Trie());
    const [currTrie, setCurrTrie] = useState<Trie>(new Trie());

    const [localFreestyleHighscore, setLocalFreestyleHighscore] = useState<number>(0);
    const [localFlashcardsHighscore, setLocalFlashcardsleHighscore] = useState<number>(-1);


    const { userData, setUserData } = useContext(UserContext);
    const { flashcards, setFolders, folders } = useContext(CardsContext);

    const moveAudio = useMemo( () => (
        new Audio("/src/assets/sounds/move-self.mp3")
    ),[]);
    const checkAudio = useMemo( () => (
        new Audio("/src/assets/sounds/check.mp3")
    ),[]);
    const castleAudio = useMemo( () => (
        new Audio("/src/assets/sounds/castle.mp3")
    ),[]);
    const captureAudio = useMemo( () => (
        new Audio("/src/assets/sounds/capture.mp3")
    ),[]);



    useEffect(()=> {
        if (game.fen() === startingFen) {

        }
        else if (game.isCheck() || game.isCheckmate()) {
            checkAudio.play();
        }
        else if (lastMove?.isCapture()) {
            captureAudio.play();
        } else if (lastMove?.isKingsideCastle() || lastMove?.isQueensideCastle()) {
            castleAudio.play();
        } else {
            console.log("playing standard sound");
            moveAudio.play();
        }

    },[game, lastMove, currMove]);


    const  makeAMove = useCallback( (move: MoveVerbose | string) => {
        try {
            const isFirstMove = (game.fen() === startingFen);
            const gameCopy = new Chess(game.fen());
            const moveObject = gameCopy.move(move);
            setLastMove(moveObject);
            setGame(gameCopy);

            const newHistory = history.slice(0, currMove + 1);
            newHistory.push(gameCopy.fen());
            setHistory(newHistory);
            setCurrMove(currMove + 1);
            
            if (typeof move === "string") {
                setLastSquare(move);
            } else {
                setLastSquare(move.to);
            }

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
        setInGameCorrects(0);
        setTestingFlashcards([]);
        setFlashcardIdx(0);
        setFlashcardMoves([]);
        setPlayerMoveIdx(0);

        setCurrTrie(new Trie());
        setTrieHead(new Trie());

        setAutoPlayIdx(0);
        setAutoPlay(false);
        setAutoPlayMoves([]);
        setInGameCorrects(0);
        setTime(0);
        setHasSkippedFlashcard(false);
}


    const beginFreestyle = (color: Color, head: Trie, folderName: 0 | string) => {
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
        setInGameCorrects(0);
        setTestingSetName(folderName);
        setTime(6000);
        setHasSkippedFlashcard(false);

        // game logic in Game component

    }

    const testFlashcards = (color: Color, flashcardsToTest: Flashcard[], setName: string | 0) => {
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
        setInGameCorrects(0);
        setTestingSetName(setName);
        setTime(0);
        setHasSkippedFlashcard(false);

        // game logic in Game component
    }

    const onFinishFreestyle = (setCurrentFolder?: (val: Folder) => void) => {
        try {
            if (hasSkippedFlashcard) {
                resetVariables();
                return;
            }
            const score = inGameCorrects;
            
            // if playing from main flashcards set and new higscore
            if (userData && testingSetName === 0 && userData.arcadeHighscore < score) {
                updateMainFreestyleHighscore(score, userData.id);

                setUserData({
                    ...userData,
                    arcadeHighscore: score
                });
            }  else if (testingSetName === 0 && !userData && score > localFreestyleHighscore) {
                setLocalFreestyleHighscore(score);
            }

            // if playiong from folder and made new highscore
            else if (testingSetName !== 0) {
                const currFolder = folders.find((folder) => folder.name === testingSetName);
                if (currFolder && score > currFolder.arcadeHighscore) {
                    if (userData) updateFolderFreestyleHighscore(currFolder.name, score, userData.id);
                    const newFolder = {
                        ...currFolder,
                        arcadeHighscore: score
                    } as Folder;
                    if (setCurrentFolder) setCurrentFolder(newFolder);
    
                    const newFolders = folders.map((folder) => {
                        if (folder.name !== currFolder.name) return folder;
                        else return newFolder
                    })
                    setFolders(newFolders);


                }
            }

        } catch (e) {
            console.error(e);
        } finally {
            resetVariables();
        }
    }


    const onFinishFlashcards = (setCurrentFolder?: (newVal: Folder) => void) => {

        try {
            if (hasSkippedFlashcard || testFlashcards.length === 0) {
                resetVariables();
                return;
            }

            // if playing from main flahscards set
            console.log(userData);
            if (testingSetName === 0 && userData && (time < userData.flashcardsHighscore || userData.flashcardsHighscore === -1)) {
                updateMainFlashcardsHighscore(time, userData.id);

                const newUserData = { ...userData, flashcardsHighscore: time } as UserData;
                setUserData(newUserData);
                console.log("updated playData");

            } else if (testingSetName === 0 && !userData && (time < localFlashcardsHighscore || localFlashcardsHighscore === -1)) {
                setLocalFlashcardsleHighscore(time);
            }

            // if playing from folders set
            if (testingSetName !== 0) {
                const folder = folders.find(f => f.name === testingSetName) as Folder;

                if (time < folder.flashcardsHighscore || folder.flashcardsHighscore === -1) {
                    if (userData) updateFolderFlashcardsHighscore(folder.name, time, userData.id);

                    const newFolder = { ...folder, flashcardsHighscore: time } as Folder;

                    if (setCurrentFolder) setCurrentFolder(newFolder);

                    const newFolders = folders.map((f) => {
                        if (f.name !== newFolder.name) return f;
                        else return newFolder;
                    })
                    setFolders(newFolders);
                }
            }

        } catch (e) {
            console.error(e);
        } finally {
            resetVariables();
        }
 
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

            const newCurrMove = currMove + 1;
            const newGame = new Chess(game.fen());
            const newLastMove = newGame.move(moveHistory[currMove]);

            setCurrMove(newCurrMove);
            setGame(newGame);
            setLastMove(newLastMove);
        }
    }

    const undo = () => {
        if (currMove === 0) return;
        else if (currMove === 1) {
            setCurrMove(0);
            setGame(new Chess());  
            setLastMove(undefined);
        }
        else {
            setCurrMove(currMove -1);

            const prevMove = history[currMove - 1];
            const newGame = new Chess(prevMove);
            setGame(newGame);
            setLastMove(undefined);
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

        localFlashcardsHighscore: localFlashcardsHighscore, 
        localFreestyleHighscore: localFreestyleHighscore,
        setLocalFlashcardsHighscore: setLocalFlashcardsleHighscore,
        setLocalFreestyleHighscore: setLocalFreestyleHighscore,

        time: time,
        setTime: setTime,

        flash: flash,

        trieHead: trieHead,
        currTrie: currTrie,

        playMode: playMode,
        inGameCorrects,
        testingSetName,
        setHasSkippedFlashcard,
        setTestingSetName,
        setInGameCorrects,

        setFlash: setFlash,
        setTestingFlashcards: setTestingFlashcards,
        setFlashcardIdx: setFlashcardIdx,
        setFlashcardMoves: setFlashcardMoves,
        setPlayerMoveIdx: setPlayerMoveIdx,

        setTrieHead: setTrieHead,
        setCurrTrie: setCurrTrie,
        setPlayMode: setPlayMode,
        onFinishFlashcards: onFinishFlashcards,
        onFinishFreestyle: onFinishFreestyle

    } as PlayContextType),[playMode, testingFlashcards, flashcardIdx, flashcardMoves, playerMoveIdx,
        trieHead, currTrie, flash,
        localFlashcardsHighscore, localFreestyleHighscore,
        time, testingSetName, inGameCorrects
    ]);


    return (
        <div className="mainbody">


                <BoardStateContext.Provider value = { boardContextProviderValue }>
                    <PlayContext.Provider value = { playContextProviderValue }>
                        <AutoPlayContext.Provider value = { autoPlayContextProviderValue }>

                            <Game 
                                makeAMove = { makeAMove }
                                lastSquare = { lastSquare }
                                setLastSquare={ setLastSquare }
                            />
                            <Toolbar 
                                undo = { undo } 
                                redo = { redo }
                                restart = { restart }
                    
                                beginFreestyle = { beginFreestyle }
                                testFlashcards = { testFlashcards }

                            />

                        </AutoPlayContext.Provider>
                    </PlayContext.Provider>
                </BoardStateContext.Provider>
        </div>
    )
}

export default MainBody;