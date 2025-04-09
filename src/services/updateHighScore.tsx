import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.config";

export const updateMainFlashcardsHighscore = async (highscore: number, uid: string) => {
    try {
        const userRef = doc(db, "userData", uid);

        await updateDoc(userRef, {
            flashcardsHighscore: highscore
        });

    } catch (e) {
        console.error(e);
    }
}

export const updateMainFreestyleHighscore = async (highscore: number, uid: string) => {
    try {
        const folderRef = doc(db, "userData", uid);

        await updateDoc(folderRef, {
            arcadeHighscore: highscore
        });      
    } catch (e) {
        console.error(e);
    }
}

export const updateFolderFlashcardsHighscore = async (folderName: string, highscore: number, uid: string) => {
    try {
        const folderRef = doc(db, "userData", uid, "folders", folderName);

        await updateDoc(folderRef, {
            flashcardsHighscore: highscore
        });

    } catch (e) {
        console.error(e);
    }
}

export const updateFolderFreestyleHighscore = async (folderName: string, highscore: number, uid: string) => {
    try {
        const folderRef = doc(db, "userData", uid, "folders", folderName);

        await updateDoc(folderRef, {
            arcadeHighscore: highscore
        });      
    } catch (e) {
        console.error(e);
    }
}