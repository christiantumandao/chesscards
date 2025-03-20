
import { useContext, useEffect, useMemo, useState } from 'react';
import './App.css'

// type imports
import { Flashcard, Folder, UserData } from './types/db';
import { TabType } from './components/NavBar/types';

import { Route, Routes } from 'react-router-dom';


// component imports
import NavBar from './components/NavBar/NavBar';
import MainBody from './components/Main/MainBody';
import About from "./components/About/About";
import LogIn from './components/LogIn/LogIn';
import Profile from './components/Profile/Profile';
import { AppContext, TabContext, UserContext } from './contexts';
import { onAuthStateChanged, User, UserCredential } from 'firebase/auth';
import { auth } from './firebase.config';
import { getUserData, getUserFlashcards, getUserFolders } from './services/userGetters';

function App() {

  const [tab, setTab] = useState<TabType>("explore");
  const [user, setUser] = useState<User | null> (null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);


  // prevent updates for every rerender 
  const appContextProviderValue = useMemo(()=> ({
    flashcards: flashcards, 
    setFlashcards: setFlashcards,
    folders: folders,
    setFolders: setFolders,
  }),[flashcards, folders])

  const tabContextProviderValue = useMemo(() => ({
    tab: tab,
    setTab: setTab
  }), [tab]);

  const userContextProviderValue = useMemo(()=>({
    user: user,
    userData: userData,
    setUser: setUser,
    setUserData
  }), [user, userData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userData = await getUserData(user.uid);
        const userFlashcards = await getUserFlashcards(user.uid)
        const userFolders = await getUserFolders(user.uid);

        setUser(user);
        setUserData(userData);
        setFlashcards(userFlashcards);
        setFolders(userFolders);

      } else {

        setUser(null);
        setUserData(null);
      }

    });

    return () => unsubscribe();
  }, []);


  return (
    <div className="App">

      <UserContext.Provider value = { userContextProviderValue }>
          <AppContext.Provider value = { appContextProviderValue }>
            <TabContext.Provider value = { tabContextProviderValue }>
              
              <NavBar />

              <Routes>
                <Route path="/" element={<MainBody />}></Route>
                <Route path="/about" element={<About />}></Route>
                <Route path="/log-in" element={<LogIn login={true}/>}></Route>
                <Route path="/sign-up" element={<LogIn  login={false}/>}></Route>
                <Route path="/profile" element={<Profile />}></Route>
                <Route path="/flashcards" element={<MainBody/>}></Route>
              </Routes>

            </TabContext.Provider>
          </AppContext.Provider>
        </UserContext.Provider>

    </div>
  )
}

export default App
