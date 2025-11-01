import { useContext, useEffect } from 'react'
import { PlayContext } from '../../util/contexts';

interface TimerProps {
    direction: "UP" | "DOWN"
}

const Timer = ({direction}: TimerProps) => {

    const { onFinishFlashcards, onFinishFreestyle, time, playMode, setTime } = useContext(PlayContext); 


    useEffect(() => {

        const incr = (direction === "UP") ? 1 : -1 

        const intervalId = setInterval(() => {
            setTime((prev: number) => {

                    if (direction === "DOWN" && prev <= 0) {
                        clearInterval(intervalId);

                        if (playMode === "flashcards") onFinishFlashcards();
                        else if (playMode === "freestyle") onFinishFreestyle();
                        else onFinishFlashcards();
                        return 0;
                    }
                    return prev + incr;
            });
        }, 1000);



        return () => clearInterval(intervalId);
    }, []); // empty dependency array

    const minutes = Math.floor(time / 60)
    const seconds = time % 60;


    return (
        <div className="timer-container">
            {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}
        </div>
    )
}

export default Timer;
