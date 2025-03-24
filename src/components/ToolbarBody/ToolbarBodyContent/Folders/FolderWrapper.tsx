import { useContext } from "react";
import "../Flashcard/flashcard.css";
import { ToolbarContext } from "../../../../contexts";
import { Folder } from "../../../../types/db";

interface FolderWrapperProps {
    folder: Folder
}

const FolderWrapper = ({ folder }: FolderWrapperProps) => {

    const { setToolbarTab, setCurrentFolder } = useContext(ToolbarContext);

    return (
        <div 
        onClick = { ()=> {
            setCurrentFolder(folder);
            setToolbarTab("FolderFocus");
        } }
        className="folder-wrapper">
            <div className="flashcard-body">
                <h4 className="folder-title">
                    { folder.name }
                </h4>

            </div>

        </div>
    );
}

export default FolderWrapper;