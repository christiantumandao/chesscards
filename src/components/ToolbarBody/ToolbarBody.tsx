import { Flashcard } from "../../types/db";
import { useLocation } from "react-router-dom";

import { useContext } from "react";
import { CardsContext, ToolbarContext } from "../../util/contexts";

import ToolbarBodyHeader from "./ToolbarBodyContent/ToolbarBodyHeader/ToolbarBodyHeader";
import ToolbarContent from "./ToolbarBodyContent/ToolbarBodyContent";
import { PossibleMove } from "../../types/states";

interface ToolbarBodyProps {
    searchResults: Flashcard[],
    setSearchResults: (val: Flashcard[]) => void
    isSearchLoading: boolean,
    possibleMoves: PossibleMove[]
}

const ToolbarBody = ( { searchResults, setSearchResults, isSearchLoading, possibleMoves } : ToolbarBodyProps) => {


    const { flashcards } = useContext(CardsContext);
    const { currentFolder } = useContext(ToolbarContext);


    const currPath = useLocation();



    return (
        <>
            <div className = {  currentFolder && 
                                currPath.pathname === "/flashcards" ? "toolbar-body toolbar-body-folder-highlight" : "toolbar-body" }>

                {/** Header of Body */}

                {
                    (flashcards && currPath.pathname === "/flashcards") ? 
                        <ToolbarBodyHeader />
                    : 
                        null
                }


                {/** Body of Body */}
                
                <ToolbarContent 
                    searchResults = { searchResults }
                    isSearchLoading = { isSearchLoading }
                    setSearchResults ={ setSearchResults }
                    possibleMoves = { possibleMoves }
                />
                
                

            </div>
        </>
    )
}


export default ToolbarBody;