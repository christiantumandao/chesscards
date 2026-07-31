import { MoveVerbose, PossibleMove } from "../../../../types/states";
import "./possiblemove.css";


interface PossibleMoveProps {
    move: PossibleMove,
    makeAMove: (newMove: MoveVerbose | string) => boolean
}
const PossibleMoveComp = (props: PossibleMoveProps) => {

    const { move, makeAMove } = props;

    const total = move.black + move.white + move.draws;
    const whitePct = Math.round((move.white / total)*100);
    const blackPct = Math.round((move.black / total)*100);
    const drawsPct = Math.round((move.draws / total)*100);

    return (
        <div className="possible-move-container"
            onClick = { () => makeAMove(move.move)}
        >
            <div className="possible-move">{move.move}</div>

            <ul className="move-breakdown">
                <li className="move-breakdown-white" style={{width: `${ whitePct }%`}}>{ whitePct }%</li> 
                <li className="move-breakdown-draws" style={{}}>{ drawsPct }%</li> 
                <li className="move-breakdown-black" style={{width: `${ blackPct }%`}}>{ blackPct }%</li> 
            </ul>

        </div>
    )
}

export default PossibleMoveComp;