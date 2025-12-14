import { Flashcard } from "../types/db";

// takes in the string of numbered moves into array of only moves
export const parseMovesIntoArray = (moves: string) => {
    const moves_ = moves.split(" ");
    const res: string[] = [];
    let i = 3;
    moves_.forEach((m) => {
        if (i===3) i=1;
        else {
            res.push(m);
            i++;
        }
    })
    return res;
}

export const parseMovesToString =  (moveHistory: string[]) => {

    let mc = 1;
    let str = "";
    
    for (let i = 0; i < moveHistory.length; i++) {

        if (i % 2 === 0) {
            str += mc + ". " + moveHistory[i];
            mc++;
        } else {
            if (i === moveHistory.length - 1) str += " "+moveHistory[i];
            else str += " "+moveHistory[i]+" ";
        }

    }
    return str;
}

export const formatName = (currOpening: Flashcard) => {
    return "["+currOpening.eco+"] "+currOpening.name;
}

export const parseQuery = (str: string) => {
    return str.replace(/\b\w/g, function (match) {
        return match.toUpperCase();
    });
}

    // this is for displaying a custom opening in the title
export  const formatCustomMoveHistory = (moveHistory: string[], currMove: number) => {
    let title = "";
    let cnt = 1;
    for (let i = 0; i < moveHistory.length; i++) {
        if (i === currMove) break;
        else if (i >= 7) {
            title+="...";
            break;
        }
        else if (i % 2 === 0) {
            title+= (cnt + ". ");
            cnt++;
        }
        title+=moveHistory[i] + " ";
    }
    return (
        <p>{title}</p>
    )
}

export const parseHighscoreTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60;

    return `${minutes}:${seconds}`;
}


