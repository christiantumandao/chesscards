import { Flashcard } from "../types/db";

const shuffleCards = (flashcards: Flashcard[], setFlashcards: (newVal: Flashcard[])=> void) => {
    const array = [...flashcards];
    let currentIndex = array.length,  randomIndex;

    while (currentIndex > 0) {
  
      // get random idx
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // swap idxs
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    setFlashcards(array);
}

export default shuffleCards;