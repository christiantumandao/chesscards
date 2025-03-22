import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import { db } from "../firebase.config";

import { Flashcard, Folder, UserData } from "../types/db";

export const getUserData = async (uid: string): Promise<UserData | null> => {
    try {
        const ref = doc(db, "userData", uid);

        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
            console.log(docSnap.data())
            const userData = {
                ...docSnap.data(),
                id: uid
            } as UserData;
            return userData;
        } else {
            console.error("Error: Could not find user");
            return null;
        }
    } catch (e) {
        console.error(e);
        return null;
    }
}

export const getUserFlashcards = async (uid: string): Promise<Flashcard[] | []> => {
    try {
        const userCards: Flashcard[] = [];
        const querySnapshot = await getDocs(collection(db, "userData", uid, "flashcards"));
        querySnapshot.forEach((doc) => {
            userCards.push({
                ...doc.data(),
                id: doc.id
            } as Flashcard);
        });
        return userCards;
    } catch (e) {
        console.error(e);
        console.log(",,,")
        return [];
    }  
}

export const getUserFolders = async (uid: string): Promise<Folder[] | []> => {
    try {
        const userFolders: Folder[] = [];
        const querySnapshot = await getDocs(collection(db, "userData", uid, "folders"));
        querySnapshot.forEach((doc) => {
            userFolders.push(doc.data() as Folder);
        })
        return userFolders;
    } catch (e) {
        console.error(e);
        return [];
    }

}




