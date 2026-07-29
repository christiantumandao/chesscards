import { PossibleMove } from "../types/states";



export const fetchPossibleMoves = async (fen: string) => {
    try {  
        if (!fen) fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const params = new URLSearchParams({
            fen: fen,
            moves: "10"
        })

        const url=`https://explorer.lichess.org/masters?${params}`;
        const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${import.meta.env.VITE_LICHESS_TOKEN}`,
        },
        });

        const account = await response.json();
        
        const possibleMoves: PossibleMove = account.moves.map((e: any)=>{
            return {
                move: e.san,
                white: e.white,
                black: e.black,
                draws: e.draws
            }
        });

        console.log(possibleMoves);



    } catch (e) {
        console.error(e);
    }
}