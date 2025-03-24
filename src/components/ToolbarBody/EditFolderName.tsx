import { deleteDoc, doc, setDoc } from "@firebase/firestore";
import React, { useContext, useState } from "react";
import { db } from "../../firebase.config";
import { validateFolderName } from "../../services/validate";
import { CardsContext, ToolbarContext, UserContext } from "../../contexts";

const EditFolderName = () => {

    const { user } = useContext(UserContext);
    const { setEditFolderMode, currentFolder, setCurrentFolder } = useContext(ToolbarContext); 
    const { folders, setFolders } = useContext(CardsContext);

    const [newFolderName, setNewFolderName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");


    const handleChangeFolderName = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            alert("Must be signed in!");
            return;
        }
        if (!currentFolder) {
            console.error("Error finding folder");
            return;
        }

        const validName = validateFolderName(newFolderName, setErrorMessage, folders);
        if (!validName) {
            console.log("Error validating name");
            return;
        }
        try {
            // get ref of folder with new name
            // delete document in db 
            // add it again with the new name
            // we must delete the document instead of updating to also update its id

            const oldName = currentFolder.name;
            const docRef = doc(db, "userData", user.uid, "folders", currentFolder.name);
            const newRef = doc(db, "userData", user.uid, "folders", newFolderName);

            const newCurrentFolder = {...currentFolder};
            newCurrentFolder.name = newFolderName;

            await deleteDoc(docRef)
                .then(()=>{

                })
                .catch((e)=> console.error(e));
            
            await setDoc(newRef, newCurrentFolder)
                .then(()=>{
                    setCurrentFolder(newCurrentFolder);
                    const newFolders = folders.filter((f)=> f.name !== oldName);
                    newFolders.push(newCurrentFolder);
                    setFolders(newFolders);
                    setEditFolderMode(false);
                })
                .catch((e)=>{
                    console.error(e);
                })


        } catch (e) {
            alert("An error occured changing folder name");
            console.error(e);
            setEditFolderMode(false);
        }


    }    

    return (
        <div className="edit-name-container">

            { errorMessage.length !== 0 ? <p className="error-message align-left">{ errorMessage }</p> : null }
           
            <form className="edit-name-field-set" onSubmit = { handleChangeFolderName } >
                
                <input 
                    type="text"
                    placeholder={(currentFolder) ? currentFolder.name : undefined }
                    value = { newFolderName }
                    onChange = { (e) => setNewFolderName(e.target.value) }
                    required
                />

                <button 
                    disabled = { newFolderName.length === 0 }
                    type="submit">
                    Edit
                </button> 
                
            </form>
        </div>
    )
}

export default EditFolderName;