import { useNavigate } from "react-router-dom";

interface GetSignInMessageToolbarProps {
    modal: string,
    setModal: (val: "sign-in" | "added" | "") => void
}

const GetSignInMessageToolbar = ({ modal, setModal }: GetSignInMessageToolbarProps) => {

    const nav = useNavigate();

    return (
        (modal.length <= 0) ? null :
        <div className="small-modal-wrapper">
            <div className="small-modal-container">
                <div className="small-modal-message">
                    { (modal === "sign-in") ? "You must be signed in to add!" : "Card already added!" }
                </div>
                <div className="small-modal-buttons">
                    {
                        (modal === "sign-in") ? 
                            <>
                                <button className= "small-modal-sign-in green-btn" onClick = { ()=> nav("/log-in") }>
                                    Sign in
                                </button>
                                <button className= "small-modal-cancel" onClick = { ()=> setModal("") }>
                                    Cancel
                                </button>
                            </> 
                            : (modal === "added") ? 
                            <>
                                <button
                                    onClick = { ()=> setModal("")} >
                                    Got it
                                </button>
                            </> : null       
                    }
                </div>
            </div>
        </div>
    )
}

export default GetSignInMessageToolbar;