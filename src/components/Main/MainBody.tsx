import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { Flashcard, Folder, UserData } from "../../types/db";
import { Chess, Move } from "chess.js";
import { Trie } from "../../util/Trie";
import { Color, MoveVerbose, PlayModeType } from "../../types/states"; 
import { AutoPlayContext, BoardStateContext, CardsContext, EngineContext, PlayContext, startingFen, TabContext, UserContext } from "../../util/contexts";
import Game from "../Game/Game";
import Toolbar from "../Toolbar/Toolbar";
import { parseMovesIntoArray } from "../../util/formatting";
import { AutoPlayContextType, BoardStateContextType, EngineContextType, PlayContextType } from "../../types/contexts";
import { updateFolderFlashcardsHighscore, updateFolderFreestyleHighscore, updateFolderTimedHighscore, updateMainFlashcardsHighscore, updateMainFreestyleHighscore, updateMainTimedHighscore } from "../../services/updateHighScore";

import moveAudio from "/src/assets/sounds/move-self.mp3";
import castleAudio from "/src/assets/sounds/castle.mp3"
import captureAudio from "/src/assets/sounds/capture.mp3"
import incorrectAudio from "/src/assets/sounds/incorrect.mp3" //change audio
import correctAudio from "/src/assets/sounds/correct.mp3" //get audio
import checkAudio from "/src/assets/sounds/check.mp3"
import illegalAudio from "/src/assets/sounds/illegal.mp3" // change audio
import Engine from "../../services/Engine/engine";

const audios = {
    move: moveAudio,
    capture: captureAudio,
    incorrect: incorrectAudio,
    correct: correctAudio,
    check: checkAudio,
    illegal: illegalAudio,
    castle: castleAudio
} as const;
type AudioType = keyof typeof audios;



const MainBody = () => {

    const { tab } = useContext(TabContext);

    const engine = useMemo(() => new Engine(), []);

    // store engine variables
    const [positionEvaluation, setPositionEvaluation] = useState(0);
    const [depth, setDepth] = useState(18);
    const [bestLine, setBestLine] = useState('');
    const [possibleMate, setPossibleMate] = useState('');

    const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);

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

    const [trieHead, setTrieHead] = useState<Trie>(new Trie());
    const [currTrie, setCurrTrie] = useState<Trie>(new Trie());

    const [localFreestyleHighscore, setLocalFreestyleHighscore] = useState<number>(0);
    const [localFlashcardsHighscore, setLocalFlashcardsleHighscore] = useState<number>(-1);
    const [localTimedHighscore, setLocalTimedHighscore] = useState<number>(0);


    const { userData, setUserData } = useContext(UserContext);
    const { setFolders, folders } = useContext(CardsContext);




    // sound effects
    useEffect(()=> {
        if (game.fen() === startingFen) {

        }
        else if (game.isCheck() || game.isCheckmate()) {
            //new Audio("/src/assets/sounds/check.mp3").play();
            playSound("check");
        }
        else if (lastMove?.isCapture()) {
            //new Audio("/src/assets/sounds/capture.mp3").play();
            playSound("capture");
        } else if (lastMove?.isKingsideCastle() || lastMove?.isQueensideCastle()) {
            //new Audio("/src/assets/sounds/castle.mp3").play();
            playSound("castle");
        } else {
            //new Audio("/src/assets/sounds/move-self.mp3").play();
            playSound("move");
        }

    },[game, lastMove, currMove]);

    // input is a string if it is autoplayed
    const  makeAMove = useCallback( (move: MoveVerbose | string): boolean => {
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
            if (typeof move !== "string" && move.from === move.to) {
                return false;
            } 
            console.error("Invalid move:", move);
            playSound("illegal");

            return false;
        }
    },[currMove, game, history, moveHistory])


    // useEffect for autoplaying an opening
    useEffect(()=> {

        const autoPlayMove = () => {

            // if autoplay is finished
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


    const beginFreestyle = (mode: "freestyle" | "arcade", color: Color, head: Trie, folderName: 0 | string) => {
        if (Object.keys(head.children).length === 0) {
            console.error("No flashcards to build trie off of");
            return;
        }
        setColor(color);
        setTrieHead(head);
        setCurrTrie(head);
        setPlayMode(mode); //double check
        setPlayerMoveIdx(0);
        setGame(new Chess());
        setMoveHistory([]);
        setHistory([startingFen]);
        setInGameCorrects(0);
        setTestingSetName(folderName);
        setTime(60);
        setHasSkippedFlashcard(false);

    }

    const beginFlashcards = (mode: "flashcards" | "timed",color: Color, flashcardsToTest: Flashcard[], setName: string | 0) => {
        if (flashcardsToTest.length === 0) {
            console.error("Do not have any flashcards to begin testing");
            return;
        }

        if (mode === "flashcards") setTime(0);
        else setTime(60);
        const firstMoveSet = parseMovesIntoArray(flashcardsToTest[0].moves);
        setTestingFlashcards(flashcardsToTest);
        setPlayMode(mode);
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
        setHasSkippedFlashcard(false);
    }
    const onFinishFreestyle = () => {
        try {
            if (hasSkippedFlashcard || playMode === "freestyle") {
                resetVariables();
                return;
            }
            const score = inGameCorrects;
            
            // if playing from main flashcards set and new higscore
            if (userData && testingSetName === 0 && userData.arcadeHighscore > score) {
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
                    setCurrentFolder(newFolder);
    
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


    const onFinishFlashcards = () => {
        try {
            if (hasSkippedFlashcard || testingFlashcards.length === 0) {
                resetVariables();
                return;
            }


            if (playMode === "flashcards") handleUpdateFlashcardsHighscore();
            else handleUpdateTimedHighscore();

        } catch (e) {
            console.error(e);
        } finally {
            resetVariables();
        }
 
    }

    const handleUpdateFlashcardsHighscore = () => {
        // if playing from main flahscards set
        if (testingSetName === 0 && userData && (time < userData.flashcardsHighscore || userData.flashcardsHighscore === -1)) {
            updateMainFlashcardsHighscore(time, userData.id);

            const newUserData = { ...userData, flashcardsHighscore: time } as UserData;
            setUserData(newUserData);

        } else if (testingSetName === 0 && !userData && (time < localFlashcardsHighscore || localFlashcardsHighscore === -1)) {
            setLocalFlashcardsleHighscore(time);
        }

        // if playing from folders set
        if (testingSetName !== 0) {
            const folder = folders.find(f => f.name === testingSetName) as Folder;

            if (time < folder.flashcardsHighscore || folder.flashcardsHighscore === -1) {
                if (userData) updateFolderFlashcardsHighscore(folder.name, time, userData.id);

                const newFolder = { ...folder, flashcardsHighscore: time } as Folder;

                setCurrentFolder(newFolder);

                const newFolders = folders.map((f) => {
                    if (f.name !== newFolder.name) return f;
                    else return newFolder;
                })
                setFolders(newFolders);
            }
        }
    }

    const handleUpdateTimedHighscore = () => {
        // upplaying from main set
        if (testingSetName === 0 && userData && inGameCorrects > userData.timedHighscore) {
            updateMainTimedHighscore(inGameCorrects, userData.id);



            const newUserData: UserData = {
                ...userData,
                timedHighscore: inGameCorrects
            };
            setUserData(newUserData);


        } else if (testingSetName === 0 && !userData && inGameCorrects > localTimedHighscore) {
            setLocalTimedHighscore(inGameCorrects);
        }

        // if playting from a folder
        else if (testingSetName !== 0) {
            const folder = folders.find((f) => f.name === testingSetName) as Folder;

            if (inGameCorrects > folder.timedHighscore) {
                if (userData) updateFolderTimedHighscore(folder.name, inGameCorrects, userData.id);

                const newFolder: Folder = {
                    ...folder,
                    timedHighscore: inGameCorrects
                } as Folder;
                setCurrentFolder(newFolder);

                const newFolders = folders.map((f) => {
                    if (f.name !== newFolder.name) return f;
                    else return newFolder;
                })
                setFolders(newFolders);
                console.log("updated highscore")

            }

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
            const newCurrMove = currMove-1;
            setCurrMove(newCurrMove);

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
    

    const boardContextProviderValue = useMemo(()=> {
        
        const boardValues: BoardStateContextType = {
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
        }
        return boardValues;

    },[game, history, moveHistory, currMove, currOpening, color]);

    const autoPlayContextProviderValue = useMemo(()=>{

        const autoPlayValues: AutoPlayContextType = {autoPlay,
            autoPlayIdx,
            autoPlayMoves,

            setAutoPlay,
            setAutoPlayIdx,
            setAutoPlayMoves,

            autoPlayOpening
        }
        return autoPlayValues;

      },[autoPlay, autoPlayIdx, autoPlayMoves]);

    const playContextProviderValue = useMemo(()=> {

        const playValues: PlayContextType = {
            testingFlashcards: testingFlashcards,
            flashcardIdx: flashcardIdx,
            flashcardMoves: flashcardMoves,
            playerMoveIdx: playerMoveIdx,

            localFlashcardsHighscore: localFlashcardsHighscore, 
            localFreestyleHighscore: localFreestyleHighscore,
            localTimedHighscore: localTimedHighscore,
            setLocalTimedHighscore: setLocalTimedHighscore,
            setLocalFlashcardsHighscore: setLocalFlashcardsleHighscore,
            setLocalFreestyleHighscore: setLocalFreestyleHighscore,

            time: time,
            setTime: setTime,


            trieHead: trieHead,
            currTrie: currTrie,

            playMode: playMode,
            inGameCorrects,
            testingSetName,
            setHasSkippedFlashcard,
            setTestingSetName,
            setInGameCorrects,

            setTestingFlashcards: setTestingFlashcards,
            setFlashcardIdx: setFlashcardIdx,
            setFlashcardMoves: setFlashcardMoves,
            setPlayerMoveIdx: setPlayerMoveIdx,

            setTrieHead: setTrieHead,
            setCurrTrie: setCurrTrie,
            setPlayMode: setPlayMode,
            onFinishFlashcards: onFinishFlashcards,
            onFinishFreestyle: onFinishFreestyle,
            resetVariables: resetVariables,
            beginFlashcards: beginFlashcards, 
            beginFreestyle: beginFreestyle
        }
        return playValues;

    }, [playMode, testingFlashcards, flashcardIdx, flashcardMoves, playerMoveIdx,
        trieHead, currTrie,
        localFlashcardsHighscore, localFreestyleHighscore, localTimedHighscore,
        time, testingSetName, inGameCorrects
    ]);

    const EngineContextProviderValue = useMemo(()=> {
        const engineValues: EngineContextType = {
            positionEvaluation,
            setPositionEvaluation,
            depth,
            setDepth,
            bestLine,
            setBestLine,
            possibleMate,
            setPossibleMate,
            engine: engine
        }
        return engineValues;
    },[positionEvaluation, depth, bestLine, possibleMate]);

    const playSound = (audio: AudioType) => {
        new Audio(audios[audio]).play(); 
    }


    return (
        <div className="mainbody">


                <BoardStateContext.Provider value = { boardContextProviderValue }>
                    <PlayContext.Provider value = { playContextProviderValue }>
                        <AutoPlayContext.Provider value = { autoPlayContextProviderValue }>
                            <EngineContext.Provider value = { EngineContextProviderValue }>
        
                                <Game 
                                    makeAMove = { makeAMove }
                                    lastSquare = { lastSquare }
                                    lastMove = { lastMove }
                                    setLastSquare={ setLastSquare }
                                    playSound = { playSound }
                                />
                                <Toolbar 
                                    undo = { undo } 
                                    redo = { redo }
                                    restart = { restart }

                                    currentFolder = { currentFolder }
                                    setCurrentFolder = { setCurrentFolder }

                                />

                            </EngineContext.Provider>
                        </AutoPlayContext.Provider>
                    </PlayContext.Provider>
                </BoardStateContext.Provider>
        </div>
    )
}


export type { AudioType };
export default MainBody;