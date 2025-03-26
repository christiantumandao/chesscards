import { useState, useEffect, useContext } from "react";
import "../../../../styles/loading.css"

import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import CreateFolder from "./CreateFolder";
import FolderWrapper from "./FolderWrapper";

import { CardsContext, ToolbarContext, UserContext } from "../../../../util/contexts";

// component outputs either the folders user has OR the openings of a selected folder
const Folders = () => {

    const { user } = useContext(UserContext);
    const { setAddOpeningsToFolder, currentFolder } = useContext(ToolbarContext);
    const { folders } = useContext(CardsContext);

    const [showAddFolder, setShowAddFolder] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const nav = useNavigate();

    // if user goes back to folders during adding openings, it will reset addOpeningsToFolder
    useEffect(()=> {
        if (currentFolder) setAddOpeningsToFolder(false);
    },[currentFolder, setAddOpeningsToFolder])


    useEffect(()=> {
        return (()=>{
            setShowSignIn(false);
            setShowAddFolder(false);
        })
    },[])

    const getCreateFolderEelement = () => {
        return (
            (showAddFolder) ? 
            <div className={(isLoading) ? "add-folder-input-wrapper shimmer" : "add-folder-input-wrapper"}>
                <CreateFolder 
                    setShowAddFolder = { setShowAddFolder }
                    isLoading = { isLoading }
                    setIsLoading = { setIsLoading }
                />

            </div>
            : 
            (showSignIn) ?
            getSignIn()
            :
            <button 
                onClick = { ()=> (user) ? setShowAddFolder(true) : setShowSignIn(true) }
                className="add-folder-wrapper">
                    <FaPlusCircle />
                    <h4>Create Folder</h4>
            </button>
        );
    }

    const getSignIn = () => {
        return (
            <div className="add-folder-input-wrapper">
                <div>
                    You must be signed in to create a folder!
                </div>

                <button 
                    className="add-folder-sign-in-msg"
                    onClick = { () => nav("/log-in") }>
                    Sign in here
                </button>
            </div>
        )
    }

    const getFolders = () => {
        return (
            folders.map((folder, idx) => (
                <FolderWrapper 
                    key = { idx + folder.name }
                    folder = { folder }
                />
            ))
        )
    }

    return (
        // maps out differnet folders
        <div className="flashcards-container"> 
            { getCreateFolderEelement() }
            { getFolders() }
        </div> 
            
    )
}

export default Folders;