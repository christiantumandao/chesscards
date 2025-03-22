import "./about.css";

import { IoReorderThree } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { TbBinaryTree } from "react-icons/tb";



const About = () => {
    return (
        <div className="more-wrapper page">
            <div className="more-blob">
                <h1>Chess Flashcards</h1>


                <section className="tutorial-container">
                    <article>
                        <h3>
                            About
                        </h3>

                        <p>
                            Openings in chess are the first few moves played in a game.
                            Many chess players spend years studying openings as they may determine the middlegame, endgame, and victor.
                            While there are many tools that test the recognization of openings as a flashcard, there are very few that allow the user to play them out on the board...
                        </p>
                    </article>
                </section>

            </div>

            <div className="more-blob">
                <h1>How does it work?</h1>

                <section className="tutorial-container">

                    <article>
                        <h3>
                            <IoReorderThree />
                            Flashcards
                        </h3> 
                        <p>
                            The Flashcards tab allows you to test yourself and organize your openings. 
                            Your default set is called "Flashcards," while additional sets can be found under the "Folders" tab in the toolbar.
                            The "Folders" tab allows users to categorize their openings from cards in the default "Flashcards" set. 
                            Note that deleting an opening from either the "Flashcards" set or a folder will only be local to that set.

                            On the top of the toolbar, users can select what color to test themselves on, randomize the order of their set, and begin their test. 
                            While you cannot add flashcards or folders without an account, users are given default openings in both tabs to use.
                        </p>
                    </article>


                    <article>
                        <h3 className="trie-header">
                            <TbBinaryTree />
                            Trie-built flashcards (Freestyle)
                        </h3>
                        <p>
                            User's flashcards will be compiled into a Trie-based data structure where "prefixes" are constructred from shared moves. 
                            The user, playing as black or white, will be playing against a computer that will play a random move from one of the children of the current move-node.
                            This will give users more freedom to choose the line of play while in the bounds of their repertoire.

                        </p>
                    </article>


                    <article>
                        <h3>
                            <FaSearch />
                            Explorer
                        </h3>  
                        <p>
                            In the Explorer tab, you can discover new openings by playing them out on the board or searching one up in the toolbar. 
                            Underneath the search bar, the opening name and its corresponding ECO will show up. Once an opening is played, a plus 
                            symbol will appear next to its designation which will allow the user to add the opening to their default flashcards set. 
                            Note that users not signed in cannot add flashcards to the default set.

                        </p>
                    </article>
                </section>
            </div>

            <div className="more-blob">
                <h1>Upcoming features</h1>


                <section className="tutorial-container">

                    <article>
                        <h3>Other</h3>
                        <ul>
                            <li>Notes for flashcards</li>
                            <li>Evaluation bar in Explorer tab</li>
                            <li>Common moves played from current position (Explorer)</li>
                        </ul>

                    </article>
                </section>
            </div>

            <div className="more-blob">
                <h4>Credits:</h4>
                <p style={{fontSize: "1rem"}}>Christian Tumandao</p>
                <p style={{fontSize: "1rem"}}>Built on React and GCP</p>
            </div>
        </div>
    )
}

export default About;