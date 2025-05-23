import { doc, getDoc, updateDoc } from "@firebase/firestore"
import { db } from "../firebase.config"
import { auth } from "../firebase.config";

const updateFirstName = async (firstName: string, uid: string): Promise<boolean> => {
    try {
        const ref = doc(db, "userData", uid);
        await updateDoc(ref, {
            firstName: firstName
        })
        return true;
    } catch (e) {
        console.error("Something went wrong. Try again later");
        console.error(e);
        return false;
    }
}

const updateLastName = async (lastName: string, uid: string): Promise<boolean>  => {
    try {
        const ref = doc(db, "userData", uid);
        await updateDoc(ref, {
            lastName: lastName
        })
        return true;
    } catch (e) {
        console.error("Something went wrong. Try again later");
        console.error(e);
        return false;
    }
}

const incrementCorrects = async () => {
    if (!auth.currentUser) return;
    try {
        const userRef = doc(db, "userData", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const correct =userData.correct;
            const newCorrect = correct+1;
            await updateDoc(userRef, {
                correct: newCorrect
            });
        } else {
            console.error("Error finding user while attempting to update")
        }

    } catch (error) {
        console.error("Error occured while  attempting to update user data");
    }
}

const incrementIncorrects = async () => {
    if (!auth.currentUser) return;
    try {
        const userRef = doc(db, "userData", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const incorrect =userData.incorrect;
            const newIncorrect = incorrect+1;
            await updateDoc(userRef, {
                incorrect: newIncorrect
            });
        } else {
            console.error("Error finding user while attempting to update")
        }
    } catch (error) {
        console.error("Error finding user while attempting to update");
    }
}



export { updateFirstName, updateLastName, incrementCorrects, incrementIncorrects };