
import { useEffect, useMemo, useState } from 'react';
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
import { CardsContext, TabContext, UserContext } from './util/contexts';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase.config';
import { getUserData, getUserFlashcards, getUserFolders } from './services/userGetters';
import { getDefaultCards, getDefaultFolders } from './util/getDefaultCards';
import { CardsContextType, TabContextType, UserContextType } from './types/contexts';

function App() {

  const [tab, setTab] = useState<TabType>("explore");
  const [user, setUser] = useState<User | null> (null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);


  // CONTEXT PROVIDER VALUES ====================================================

  // prevent updates for every rerender 
  const cardsContextProviderValue = useMemo(()=> {

    const cardsValues: CardsContextType = {
      flashcards: flashcards, 
      setFlashcards: setFlashcards,
      folders: folders,
      setFolders: setFolders,
    }
    return cardsValues;

  },[flashcards, folders])

  const tabContextProviderValue = useMemo(() => {

    const tabValues: TabContextType = {
      tab: tab,
      setTab: setTab
    }
    return tabValues;

  }, [tab]);

  const userContextProviderValue = useMemo(()=>{

    const userValues: UserContextType = {
      user: user,
      userData: userData,
      setUser: setUser,
      setUserData
    }
    return userValues;

  }, [user, userData]);

  // ==========================================================================


  // Loading in user data in event of log in/out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userData: UserData | null = await getUserData(user.uid);
        const userFlashcards: Flashcard[] = await getUserFlashcards(user.uid)
        const userFolders: Folder[] = await getUserFolders(user.uid);

        setUser(user);
        setUserData(userData);
        setFlashcards(userFlashcards);
        setFolders(userFolders);

      } else {
        const defaultCards: Flashcard[] = getDefaultCards();
        const defaultFolders: Folder[] = getDefaultFolders();
        
        setUser(null);
        setUserData(null);
        setFlashcards(defaultCards);
        setFolders(defaultFolders);

      }

    });

    return () => unsubscribe();
  }, []);


  return (
    <div className="App">

      <UserContext.Provider value = { userContextProviderValue }>
          <CardsContext.Provider value = { cardsContextProviderValue }>
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
          </CardsContext.Provider>
        </UserContext.Provider>

    </div>
  )
}

export default App
