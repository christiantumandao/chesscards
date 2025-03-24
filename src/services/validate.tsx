import { Folder } from "../types/db";

export const validateFolderName = (name: string, setErrorMessage: (msg: string) => void, folders: Folder[]) => {
    if (name.length === 0) {
        setErrorMessage("Must have a non-empty name!");
        return false;
    }

    if (name.length > 30) {
        setErrorMessage("Name cannot be more than 30 characters!");
    }

    if (folders.some((folder) => folder.name === name)) {
        setErrorMessage("You have a folder with this name!");
        return false;
    }

    setErrorMessage("");
    return true;
}
