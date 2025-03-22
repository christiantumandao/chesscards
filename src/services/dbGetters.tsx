import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase.config";
import { Flashcard } from "../types/db";
import { parseQuery } from "../util/formatting";

export const findOpening = async (currFen: string): Promise<Flashcard | null> => {
    try {
        const openingsCollection = collection(db, 'openings');
        const q =  query(openingsCollection, where("fen", "==",currFen));

        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const match = querySnapshot.docs[0].data() as Flashcard;
          return match;

        } else { // opening not in db
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