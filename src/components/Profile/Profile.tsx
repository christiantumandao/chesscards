import { useContext, useState } from "react";
import "./profile.css";
import "../../styles/loading.css";
import { auth, db } from "../../firebase.config";
import { Link, useNavigate } from "react-router-dom";
import { EmailAuthProvider, deleteUser, reauthenticateWithCredential } from "@firebase/auth";
import { deleteDoc, doc } from "@firebase/firestore";
import { updateFirstName, updateLastName } from "../../services/userSetters";
import { UserContext } from "../../util/contexts";
import { FirebaseError } from "firebase/app";
import { UserData } from "../../types/db";
const Profile = () => {

    const { user, userData, setUserData } = useContext(UserContext);

    const nav = useNavigate();

    const [logout, setLogout] = useState<boolean>(false);
    const [del, setDel] = useState<boolean>(false);
    const [profileIsDeleted, setProfileIsDeleted] = useState<boolean>(false);

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [confirmPw, setConfirmPw] = useState<string>("");

    const [isLoadingFirstName, setIsLoadingFirstName] = useState<boolean>(false);
    const [isLoadingLastName, setIsLoadingLastName] = useState<boolean>(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);

    const [errorMessage, setErrorMessage] = useState<string>("");



    const signOutUser = () => {
        try {
            auth.signOut();

        } catch (e) {
            console.error(e);
        } finally {
            nav("/log-in");
        }
    }

    const deleteAccount = async () => {

        if (!user) return;
            try {
                setIsLoadingDelete(true);
                
                const credential = EmailAuthProvider.credential(
                    user.email!,
                    confirmPw
                )
                await reauthenticateWithCredential(
                    user, 
                    credential
                )

                const uid = user.uid;
                await deleteUser(user);
                await deleteDoc(doc(db, "userData", uid));
                setErrorMessage("");
                setProfileIsDeleted(true);

            } catch (e: unknown) {
                if (e instanceof FirebaseError) {
                    console.error(e.message);
                    setErrorMessage(e.message); // Use the error message for FirebaseError
                } else {
                    console.error(e);
                    setErrorMessage("An unknown error occurred.");
                }
            } finally {
                setIsLoadingDelete(false);
            }
    }

    const handleFirstNameChange = async () => {
        if (!user) {
            return;
        }
        try {
            setIsLoadingFirstName(true);
            const success = await updateFirstName(firstName, user.uid);
            if (success) {
                const newData = { ...userData, firstName: firstName } as UserData;
                setUserData(newData);
            }
   
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingFirstName(false);
            setFirstName("");
        }
        
    }

    const handleLastNameChange = async () => {
        if (!user) {
            return;
        }
        try {
            setIsLoadingLastName(true);
            const success = await updateLastName(lastName, user.uid);
            if (success) {
                const newData = { ...userData, lastName: lastName } as UserData;
                setUserData(newData);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingLastName(false);
            setLastName("");
        }

    }

    const getDeletionConfirmation = () => {
        return (
            <div className="modal-wrapper">
                <div className="modal-container">               

                    <section className="modal-header">
                            <h2>
                                 Account successfully deleted!
                            </h2>
                    </section>

                    <p>You can create another account for free <Link to="/sign-up">here.</Link></p>
                    <br />
                    <p>Or you can continue to explore openings at the Explore tab <Link to="/">here.</Link></p>
                </div>
            </div>
        )
    }

    const getProfileStatistics = () => {
        return (

                <section className="profile-blobcontent">
                    <h3>Statistics</h3>
        
                    <div className="profile-field">
                        <div>Cards Correct</div>
                        <div className="stat">{userData?.correct || null}</div>
                    </div>
                    <div className="profile-field">
                        <div>Cards Incorrect</div>
                        <div className="stat">{(userData) ? userData.incorrect : null}</div>
                    </div>
                    <div className="profile-field">
                        <div>Total Cards Completed</div>
                        <div className="stat">{(userData) ? userData.incorrect + userData.correct : null}</div>
                    </div>
                    <div className="profile-field">
                        <div>Accuracy</div>
                        <div className="stat">{(userData) ? (userData.correct + userData.incorrect === 0) ? 0 : ((userData.correct)/(userData.incorrect + userData.correct)).toFixed(2) : null}</div>
                    </div>
                </section>
        )
    }

    const getProfileHighscores = () => {
        return (
            <section className="profile-blobcontent">
                <br />
                <h3>High Scores</h3>

                <div className="profile-field">
                    <div>Flashcards</div>
                    <div className="stat">
                    {(userData?.flashcardsHighscore === -1) ? "n/a" : userData?.flashcardsHighscore}
                    </div>
                </div>

                <div className="profile-field">
                    <div>Timed</div>
                    <div className="stat">
                    {(userData?.timedHighscore === 0) ? "n/a" : userData?.timedHighscore}
                    </div>
                </div>

                <div className="profile-field">
                    <div>Arcade</div>
                    <div className="stat">
                    {(userData?.arcadeHighscore === 0) ? "n/a" : userData?.arcadeHighscore}
                    </div>
                </div>
            </section>
        );
    }
    if (!userData) return
    return (
        <div className="page profile-wrapper">

            <h1>Settings</h1>
            <div className="profile-blob">
                <section className="profile-blobcontent">
                    <h3>Profile</h3>
                    <div className="profile-field profile-setting">
                        <div>E-mail</div>
                        <p className="email">{userData?.email || null}</p>
                    </div>
                    <div className="profile-field profile-setting">
                        <div>First Name</div>
                        <input 
                            placeholder={(isLoadingFirstName) ? "" : userData?.firstName || undefined }
                            value = {(isLoadingFirstName) ? "" : firstName}
                            onChange = { (e)=>setFirstName(e.target.value)}
                            disabled = { isLoadingFirstName }
                            className = { (isLoadingFirstName) ? "shimmer" : "" }
                        />
                        {
                            (firstName.length !== 0) ? 
                                <button 
                                onClick = { handleFirstNameChange}
                                className="green-btn">
                                    Change</button> 
                                : null
                        }
                    </div>
                    <div className="profile-field profile-setting">
                        <div>Last Name</div>
                        <input 
                            placeholder={(isLoadingLastName) ? "" : (userData) ? userData.lastName : undefined}
                            value = {(isLoadingLastName) ? "" : lastName}
                            disabled ={isLoadingLastName}
                            className = { (isLoadingLastName) ? "shimmer" : "" }
                            onChange = { (e)=>setLastName(e.target.value)}
                        />
                        {
                            (lastName.length !== 0) ? 
                                <button 
                                onClick = { handleLastNameChange }
                                className="green-btn">
                                    Change
                                </button> 
                                : null
                        }
                    </div>

                </section>
            </div>
            <div className="profile-blob">
                { getProfileStatistics() }
                { getProfileHighscores() }
            </div>


            <div className="profile-blob">
                <section className="profile-blobcontent profile-red-btns">
                    <button className="red-btn" onClick = { () => setLogout(true) } >
                        Sign out
                    </button>

                    <button className="red-btn" onClick = { () => setDel(true) }>
                        Delete account
                    </button>
                </section>
            </div>

            {
                (del || logout || profileIsDeleted) ? 
                (profileIsDeleted) ? getDeletionConfirmation() :
                <div className="modal-wrapper">
                    <div className="modal-container">
                        <section className="modal-header">
                            {
                                (logout) ? <h2>Log out?</h2> : <h2>Delete account?</h2>
                            }
                        </section>

                        <section className="modal-body">
                            {
                                (logout) ?
                                <div className="modal-buttons">
                                
                                    <button className="confirm red-btn" onClick = { ()=>{
                                        signOutUser();
                                        setLogout(false);
                                        setDel(false);
                                    }}
                                    >
                                        Log out
                                    </button>
                                    <button className="cancel" onClick = { ()=>{
                                        setLogout(false);
                                        setDel(false);
                                    
                                    }}>
                                            Cancel
                                    </button>
                                

                                </div> : 
                                <div className="confirm-delete">
                                    { (errorMessage.length > 0) ? <p className="error-message">{errorMessage}</p> : null }
                                    <input 
                                        type="password"
                                        placeholder={ (isLoadingDelete) ? "" : "Confirm password"}
                                        value = { (isLoadingDelete) ? "" : confirmPw }
                                        onChange = { (e)=>setConfirmPw(e.target.value)}
                                        className= { (isLoadingDelete) ? "shimmer" : ""}
                                        disabled = { isLoadingDelete }
                                        required
                                    />
                                    <div className={(isLoadingDelete) ? "hidden modal-buttons" : "modal-buttons"}>
                                        <button className="confirm-delete-btn red-btn"
                                            onClick = { deleteAccount }
                                        >
                                            Delete
                                        </button>
                                        <button className="cancel" onClick = { ()=>{
                                            setLogout(false);
                                            setDel(false);
                                        }}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            }
                        </section>
                    </div>
                </div>
            : null
            }

        </div>
    )
}

export default Profile;