import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase.config";
import { Flashcard } from "../types/db";
import { parseMovesToString, parseQuery } from "../util/formatting";
import { startingFen } from "../util/contexts";

export const findOpening = async (currFen: string, moveHistory: string[], currMove: number): Promise<Flashcard | null> => {
    try {
        if (currFen === startingFen) return null;
        const focusedMoveHistory = moveHistory.slice(0, currMove);
        const serializedMoveHistory = parseMovesToString(focusedMoveHistory);

        /*
        const openingsCollection = collection(db, 'openings');
        const q =  query(openingsCollection, where("fen", "==",currFen));
        */

        const openingsCollection = collection(db, 'openings');
        const q =  query(openingsCollection, where("moves", "==",serializedMoveHistory));

        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const match = querySnapshot.docs[0].data() as Flashcard;
          return match;

        } else { // opening not in db
          console.log("not found")
          return null;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        return null;
      }
}

export const search = async (searchQuery: string, setSearchResults: (newVal: Flashcard[]) => void, resultLimit: number) => {
    try {
        const sq = parseQuery(searchQuery);
        if (searchQuery.length === 0) {
            setSearchResults([]);
            return;
        }

        const collectionRef = collection(db, "openings");
        const q = query(collectionRef, where("name", ">=", sq), limit(resultLimit));
        const querySnapshot = await getDocs(q);
        const res: Flashcard[] = []
        querySnapshot.forEach((doc)=> {
            res.push(doc.data() as Flashcard);
        })
        setSearchResults(res);
    } catch (e) {
        console.error(e);
    }
}