import React, { useEffect, useState } from "react";
import "./toolbarHeader.css";

import { FaSearch } from "react-icons/fa";
import { search } from "../../services/dbGetters";
import { BsCaretDown } from "react-icons/bs";
import { Flashcard } from "../../types/db";

interface TopHeaderExploreProps {
    setSearchResults: (newVal: Flashcard[]) => void
    setIsSearchLoading: (val: boolean) => void
}

const TopHeaderExplore = ({ setSearchResults, setIsSearchLoading }: TopHeaderExploreProps) => {

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [resultLimit, setResultLimit] = useState<number>(20);

    useEffect(()=>{
        return (()=>{
            setSearchQuery("");
            setSearchResults([]);
        })
    },[setSearchQuery, setSearchResults]);

    const handleSubmitSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSearchLoading(true);
        search(searchQuery, setSearchResults, resultLimit);
        setTimeout(() => {
            setIsSearchLoading(false);
        }, 500);
    }
 
    return (
        <form className="search-container" onSubmit = { handleSubmitSearch }>
            <input 
                type="search"
                placeholder="Search openings"
                value = { searchQuery }
                onChange = { (e)=> setSearchQuery(e.target.value)}
                required
            />

            <div className="search-btns">
                <div className="search-select">
                    <select
                        value = { resultLimit }
                        onChange = {(e: React.ChangeEvent<HTMLSelectElement>) => setResultLimit(Number(e.target.value))}
                    >
                        <option value = {5}>5</option>
                        <option value = {10}>10</option>
                        <option value = {20}>20</option>
                        <option value = {50}>50</option>

                    </select>
                    <BsCaretDown />
                </div>
                
                <button
                    disabled = { searchQuery.length === 0 }
                    type="submit"
                >
                    <FaSearch />
                </button>
            </div>


    </form>
    )
}


export default TopHeaderExplore;