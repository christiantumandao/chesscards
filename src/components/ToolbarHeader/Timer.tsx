import { useContext, useEffect } from 'react'
import { PlayContext, ToolbarContext } from '../../util/contexts';

interface TimerProps {
    direction: "UP" | "DOWN"
}

const Timer = ({direction}: TimerProps) => {

    const { onFinishFlashcards, onFinishFreestyle, time, playMode, setTime } = useContext(PlayContext); 
    const { setCurrentFolder } = useContext(ToolbarContext);


    useEffect(() => {

        const incr = (direction === "UP") ? 1 : -1 

        const intervalId = setInterval(() => {
            setTime((prev: number) => {

                    if (direction === "DOWN" && prev <= 0) {
                        clearInterval(intervalId);

                        if (playMode === "flashcards") onFinishFlashcards(setCurrentFolder);
                        else if (playMode === "freestyle") onFinishFreestyle(setCurrentFolder);
                        else onFinishFlashcards(setCurrentFolder);
                        return 0;
                    }
                    return prev + incr;
            });
        }, 10);



        return () => clearInterval(intervalId);
    }, []); // empty dependency array

    const minutes = Math.floor((time % 360000) / 6000);
    const seconds = Math.floor((time % 6000) / 100);
    const milliseconds = time % 100;

    return (
        <div className="timer-container">
            {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}:
            {milliseconds.toString().padStart(2, "0")}
        </div>
    )
}

export default Timer;
