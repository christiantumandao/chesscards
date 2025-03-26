import React, { useContext, useEffect, useState } from "react";
import "./login.css";
import "../../styles/loading.css";
import { Link, useNavigate } from "react-router-dom";
import { LoginProps } from "./types";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase.config";
import { doc, setDoc } from "@firebase/firestore";
import { UserContext } from "../../util/contexts";


const LogIn = (props: LoginProps) => {

    const { login }  = props;

    const { user } = useContext(UserContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const nav = useNavigate();


    useEffect(()=>{
        return ()=>{
            resetFields();
        }
    },[]);


    const resetFields = () => {
        setPassword("");
        setConfirmPassword("");
        setEmail("");
        setFirstName("");
        setLastName("");
        setErrorMessage('');
        setIsLoading(false);
    }

    const submitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (login) setIsLoading(true);
        else return;

        try {
            // user will be updated at hook in App.tsx

            await signInWithEmailAndPassword(auth, email, password)
            //const user = userCredential.user;
            resetFields();
            nav("/flashcards");

        } catch (error: unknown) {
            console.error(error);
            setErrorMessage((error as { code: string }).code);
        } finally {
            setIsLoading(false);
        }

    }

    const createUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const valid = validate();
        if (!valid) {
            return;
        }
        setIsLoading(true);
        await createUserWithEmailAndPassword(auth, email, password)
            .then( async (userCredential)=>{
                const user = userCredential.user;
                const docRef = doc(db, "userData", user.uid);
                await setDoc(docRef, {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    correct: 0,
                    incorrect: 0,
                    added: 0
                })
                setPassword("");
                setConfirmPassword("");
                setEmail("");
                setFirstName("");
                setLastName("");
                nav("/");
                setIsLoading(false);
            })
            .catch((e)=>{
                setErrorMessage(e.code);
                setIsLoading(false);
                console.error(e);
            });
           


    }

    const validate = () => {
        if (password !== confirmPassword) {
            setErrorMessage("Passwords must match!");
            return false;
        }
        else if (password.length <= 8) {
            setErrorMessage("Password must be more than 8 characters long!");
            return false;
        }
        return true;
    }

    if (user) return null
    else 
    return (
        <div className="login-wrapper page">
            <div className="login-container">

                {
                    (login) ? 
                        <h2>Login</h2> 
                    : 
                        <h2>Sign up</h2>
                }

                { (errorMessage.length === 0) ? null : <div className="error-message">{ errorMessage } </div> }

                <form 
                    onSubmit = { (login) ? submitLogin : createUser }
                    className="login-info">

                    {
                        (!login) ? 
                            <>
                                <input 
                                    type="text"
                                    placeholder={(isLoading) ? "" : "First Name"}
                                    value = { (isLoading) ? "" : firstName }
                                    onChange = { (e)=> setFirstName(e.target.value)}
                                    className = { (isLoading) ? "shimmer" : ""}
                                    disabled = { isLoading }
                                    required
                                />
                                <input 
                                    type="text"
                                    placeholder={(isLoading) ? "" : "Last Name"}
                                    value = { (isLoading) ? "" : lastName }
                                    onChange = { (e)=> setLastName(e.target.value)}
                                    disabled = { isLoading }
                                    className = { (isLoading) ? "shimmer" : ""} 
                                    required
                                />
                            </> 
                        : null
                    }
                    <input
                        placeholder={(isLoading) ? "" : "E-mail"}
                        type="text"
                        value = { (isLoading) ? "" : email }
                        onChange = { (e)=> setEmail(e.target.value) }
                        className = { (isLoading) ? "shimmer" : ""}
                        disabled = { isLoading }
                        required
                    />
                    <input 
                        type="password"
                        placeholder={(isLoading) ? "" : "Password"}
                        value = { (isLoading) ? "" : password }
                        onChange = { (e)=> setPassword(e.target.value)}
                        disabled = { isLoading }
                        className = { (isLoading) ? "shimmer" : ""} 
                        required
                    />
                    {
                        (!login) ? 

                            <input 
                                type="password"
                                placeholder={(isLoading) ? "" : "Confirm Password"}
                                value = { (isLoading) ? "" : confirmPassword }
                                onChange = { (e)=> setConfirmPassword(e.target.value)}
                                disabled = { isLoading }
                                className = { (isLoading) ? "shimmer" : ""} 
                                required
                            />
                        : null
                    }

                    <button 
                    className={(isLoading) ? "hidden" : "login-button" }
                    type="submit">
                        {
                            (login) ? <>Login</> : <>Sign up</>
                        }
                    </button>
                </form>

                {
                    (!login) ? 
                    <>
                        <div className={(isLoading) ? "hidden" : "or"}>
                            or
                        </div>
                        <div className={(isLoading) ? "hidden" : "sign-up-link"}>
                            <Link to="/log-in">Already have an account? Log in</Link>
                        </div>
                    </>
                    :
                    <>
                        <div className={(isLoading) ? "hidden" : "or"}>
                            or
                        </div>
                        <div className={(isLoading) ? "hidden" : "sign-up-link"}>
                            <Link to="/sign-up">Don't have a Profile? Sign up</Link>
                        </div>
                    </>
                }

            </div>
        </div>
    );
}


export default LogIn;