import { useState, useEffect, useContext, useRef } from "react";
import "./navBar.css";

import { FaSearch } from "react-icons/fa";
import { PiCardsLight } from "react-icons/pi";
import { TabContext, UserContext } from "../../contexts";
import { useLocation, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { BsThreeDots } from "react-icons/bs";
import { IoReorderThree } from "react-icons/io5";
import { RxExit } from "react-icons/rx";
import { TabType } from "./types";


const NavBar = () => {

    const { user } = useContext(UserContext);
    const { tab, setTab } = useContext(TabContext);

    const [showMobileNav, setShowMobileNav] = useState<boolean>(false);

    const mobileNavRef= useRef<HTMLDivElement | null>(null);

    const currPath = useLocation();
    const nav = useNavigate();

    // for mobile nav
    useEffect(()=> {

        const handleOutsideClick = (e: MouseEvent) => {
            if (mobileNavRef.current && !mobileNavRef.current.contains(e.target as Node)) {
                setShowMobileNav(false);
            }
        }

        if (showMobileNav) {
            document.addEventListener("mousedown", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        }

    },[showMobileNav]);

    useEffect(()=>{
        if (currPath.pathname !== tab) {
            let path = currPath.pathname.slice(1);
            let relPath: TabType;
            if (path === "") relPath = "explore";
            else if (path === "sign-up") relPath = "signup"
            else if (path === "log-in") relPath = "login"
            else if (path === "flashcards") relPath = "test"
            else if (path === "about") relPath = "more"
            else if (path === "profile") relPath = "profile"
            else relPath = "explore";

            setTab(relPath);
        }
    },[currPath, tab, setTab])

    const getLoginOrProfileButtons = () => {
        return (
            
            (user) ?
                <button
                className={(tab === "profile") ? "selected-tab" : ""} 
                onClick = { () => { nav("/profile"); setTab("profile"); setShowMobileNav(false); }}
                >
                    <CgProfile />
                    Profile
                </button>
                :
                <>
                <button
                className={(tab === "signup") ? "selected-tab" : ""} 
                onClick = { () => { nav("/sign-up"); setTab("signup"); setShowMobileNav(false); }}
                >
                    Signup
                </button>
                <button
                className={(tab === "login") ? "selected-tab" : ""} 
                onClick = { () => { nav("/log-in"); setTab('login'); setShowMobileNav(false); }}
                >
                    Login
                </button>
            </>
            
        )
    }

    const getMobileNav = () => {
        return (
            <div className="mobilenav-wrapper">
                <div className="mobilenav-container" ref = { mobileNavRef }>

                    <button 
                        className="navbar-exit"
                        onClick = {()=>setShowMobileNav(false)}>
                        <RxExit />
                    </button>

                    <h2>Chess Flashcards</h2>

                    <nav>
                        <button
                            className={(tab === "explore") ? "selected-tab" : ""} 
                            onClick = { () => { nav("/"); setTab("explore"); setShowMobileNav(false); }}
                        >
                            <FaSearch />
                            Explore
                        </button>

                        <button
                        className={(tab === "test") ? "selected-tab" : ""} 
                        onClick = { () => { nav("/flashcards"); setTab('test'); setShowMobileNav(false); }}
                        >
                            <PiCardsLight />
                            Flashcards
                        </button>

                        { getLoginOrProfileButtons() }



                        <button
                            onClick = { () => { nav("/about"); setTab('more'); setShowMobileNav(false); }}
                            className={(tab === "more") ? "selected-tab" : ""} 
                        >
                            <BsThreeDots />
                            More
                        </button>
                    </nav>     
                </div>
            </div>
        )
    }

    return (
        <>
        <div className="navbar-wrapper">

            <h2>Chess Flashcards</h2>

            <nav>
                <button
                    className={(tab === "explore") ? "selected-tab" : ""} 
                    onClick = { () => { nav("/"); setTab("explore"); }}
                >
                    <FaSearch />
                    Explore
                </button>

                <button
                className={(tab === "test") ? "selected-tab" : ""} 
                onClick = { () => { nav("/flashcards"); setTab('test'); }}
                >
                    <PiCardsLight />
                    Flashcards
                </button>

                { getLoginOrProfileButtons() }

                <button
                    onClick = { () => { nav("/about"); setTab('more');  }}
                    className={(tab === "more") ? "selected-tab" : ""} 
                >
                    <BsThreeDots />
                    About
                </button>
            </nav>
            
        </div>
        
        <div className={ (showMobileNav) ? "hidden navbar-icon" : "navbar-icon"}>
            <button onClick = { ()=> setShowMobileNav(true)}>
                <IoReorderThree />
            </button>
        </div>
      

        {
            (showMobileNav) ? 
                getMobileNav()
            : null
        }

        </>


    )
}

export default NavBar;