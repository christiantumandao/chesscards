import { useContext, useEffect } from "react";
import EditFolderName from "../Folders/EditFolderName/EditFolderName";
import { deleteDoc, doc } from "@firebase/firestore";
import { db } from "../../../../firebase.config";
import { FaRegEdit, FaRegQuestionCircle } from "react-icons/fa";
import { CardsContext, PlayContext, ToolbarContext, UserContext } from "../../../../util/contexts";
import "./toolbarBodyHeader.css";
import { parseHighscoreTime } from "../../../../util/formatting";
const ToolbarBodyHeader = () => {

    const { toolbarTab, setToolbarTab, 
            currentFolder, setCurrentFolder,
            editFlashcardsMode, setEditFlashcardsMode,
            editFolderMode, setEditFolderMode,
            setAddOpeningsToFolder
    } = useContext(ToolbarContext);

    const { user, userData } = useContext(UserContext);
    const { playMode, localFlashcardsHighscore, localFreestyleHighscore, localTimedHighscore } = useContext(PlayContext);
    const { folders, setFolders } = useContext(CardsContext);


    useEffect(()=>{
        setEditFolderMode(false);
        setEditFlashcardsMode(false);

        return (
            () => {
                setEditFolderMode(false);
                setEditFlashcardsMode(false);               
            }
        )
    },[setEditFlashcardsMode, setEditFolderMode])

    // CONDITIONAL COMPONENTS

    // TOP HEADER ==================================================================
    const getTopHeader = () => {
        return (
            <div className="toolbar-body-top-header">   
            {  
                    (editFolderMode) ?
                        getEditFolderTopHeaderComponent()
                :   (editFlashcardsMode) ?
                        getEditFlashcardsTopHeaderComponent() 
                :
                        getFlashcardsOrFolders()
                    
            }
            </div>
        )
    }

    const getEditFlashcardsTopHeaderComponent = () => {
        return (
            <button onClick = { () => setEditFlashcardsMode(false) } className="cancel-edit-flashcards-btn">
                Exit
            </button>
        )
    }

    const getEditFolderTopHeaderComponent = () => {
        return (
            <>
                <button 
                    onClick = { handleDeleteFolder }
                    className="delete-folder-btn red-btn">
                    Delete Folder
                </button>

                <button onClick = { () => setEditFolderMode(false) }className="cancel-edit-folder-btn">
                    Exit
                </button>
            </>
        )
    }

    const getFlashcardsOrFolders = () => {
        return (
            <div className="folders-flashcards-button-container">
                <button
                    className={(toolbarTab === "Flashcards") ? "flashcards-folders-btn-selected border-right" :"flashcards-folders-btn border-right"}
                    disabled = { (toolbarTab === "Flashcards" || playMode !== "") }
                    onClick = { () => {
                        setToolbarTab("Flashcards");
                        setCurrentFolder(null);
                        setAddOpeningsToFolder(false);
                    }}
                >
                    Flashcards
                </button>
                <button
                    className={(toolbarTab === "Folders") ? "flashcards-folders-btn-selected" :"flashcards-folders-btn"}
                    disabled = { (toolbarTab === "Folders" || playMode !== "") }
                    onClick = { () => {
                        setToolbarTab("Folders");
                        setCurrentFolder(null);
                        setAddOpeningsToFolder(false);
                }}>
                    Folders
                </button>
            </div>
        )
    }


    // BOTTOM HEADER ======================================================================

    const getBottomHeader = () => {
        return (
            <>
                <div className="toolbar-body-bottom-header">
                {
                    (editFolderMode && user) ? 
                        <EditFolderName /> 
                    :
                        <h3>
                        {
                            (toolbarTab === "Folders") ?
                                "Folders" :
                            (toolbarTab === "FolderFocus" && currentFolder) ?
                                currentFolder.name :
                                "Flashcards"
                        }
                        </h3>
                }

                {
                    (toolbarTab === "FolderFocus" && !editFolderMode && user && playMode === "") ?
                        <button onClick = { () => setEditFolderMode(true) }className="edit-folder-btn">
                            <FaRegEdit />
                        </button>
                    :  
                    (toolbarTab === "Flashcards" && !editFlashcardsMode && user && playMode === "") ? 
                        <button onClick = { () => setEditFlashcardsMode(true) }className="edit-folder-btn">
                            <FaRegEdit />
                        </button> 
                    : null  
                }
                </div>
            

            
            </>
        )
    }

    const getHighScores = () => {
        if (toolbarTab === "Folders" || playMode !== "") return null;


        let arcadeHighscore:any = (toolbarTab === "FolderFocus" && currentFolder) ? currentFolder.arcadeHighscore 
            : (toolbarTab === "Flashcards" && userData) ? userData.arcadeHighscore 
            : localFreestyleHighscore;

        let flashcardsHighscore: any = (toolbarTab === "FolderFocus" && currentFolder) ? currentFolder.flashcardsHighscore 
            : (toolbarTab === "Flashcards" && userData) ? userData.flashcardsHighscore 
            : localFlashcardsHighscore;

        // todo
        let timedHighscore: any = (toolbarTab === "FolderFocus" && currentFolder) ? currentFolder.timedHighscore 
            : (toolbarTab === "Flashcards" && userData) ? userData.timedHighscore 
            : localTimedHighscore;

        if (!flashcardsHighscore || flashcardsHighscore === -1 ) flashcardsHighscore = "-";
        else flashcardsHighscore = parseHighscoreTime(flashcardsHighscore);
        if (!timedHighscore || timedHighscore === -1 ) timedHighscore = "-";
        if (!arcadeHighscore || arcadeHighscore === -1 ) arcadeHighscore = "-";


        return (
            <div className="body-header-highscore-container">

                <div className="tooltip-container">
                    <FaRegQuestionCircle />
                    <div className="tooltip">
                        Highscores will clear upon adding/deleting flashcards
                    </div>
                </div>

                <div className="highscore">Flashcards: { flashcardsHighscore }</div>
                <div className="highscore">Timed: { timedHighscore }</div>
                <div className="highscore">Arcade: { arcadeHighscore }</div>
            </div>
        )
    }

    const handleDeleteFolder = async () => {
        try {
        
            if (!currentFolder) {
                console.error("Current folder is null");
                return;
            } else if (!user) {
                console.error("Error: user not found");
                return;
            }

            const folderToDelete = currentFolder.name;
            const docRef = doc(db, "userData", user.uid, "folders", folderToDelete);
            await deleteDoc(docRef);

            const newFolders = folders.filter((folder) => folder.name !== folderToDelete);
            setFolders(newFolders);
            setCurrentFolder(null);
            setEditFolderMode(false);
            setToolbarTab("Folders");

        } catch (e) {
            console.error(e);
        }
    }


    return (
        <div className="toolbar-body-header">
        
        { getTopHeader() }
        { getBottomHeader() }
        { getHighScores() }

        </div> 
    )
}

export default ToolbarBodyHeader;