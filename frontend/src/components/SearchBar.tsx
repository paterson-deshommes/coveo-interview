import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faCircleNotch } from '@fortawesome/free-solid-svg-icons'

import './SearchBar.css'
import { City } from './ResultList';

export interface SearchBarProps {
    placeholder: string,
    onCitySearch: (cities: City[]) => any
}

const SearchBar: React.FunctionComponent<SearchBarProps> = (props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [data, setData] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [position, setPosition] = useState<Coordinates | null>(null)

    const search = async () => {
        setIsLoading(true);
        await props.onCitySearch(data)
        setIsLoading(false)
    }

    const onKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            props.onCitySearch(data);
            setQuery('');
        }
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((p) => {
            setPosition(p.coords);
        });
    }, [])

    useEffect(() => {
        if (query === "") {
            setData([]);
            return;
        }

        const q = query.lowerCase()
        const path = position === null
            ? `http://localhost:8080/suggestions?q=${q}&page=0`
            : `http://localhost:8080/suggestions?q=${q}&latitude=${position.latitude}&longitude=${position.longitude}&page=0`

        try {
            fetch(path)
                .then(response => response.json())
                .then(({ cities }) => setData(cities));
        } catch (e) {
            console.error(e);
        }

    }, [query, position])

    return <div className="SearchBar">
        <input
            ref={inputRef}
            placeholder={props.placeholder}
            value={query}
            onKeyDown={onKeyDown}
            onChange={(e) => setQuery(e.target.value)}></input>

        <button onClick={search}>
            <FontAwesomeIcon icon={!isLoading ? faSearch : faCircleNotch} className={isLoading ? 'fa-spin' : ''} />
        </button>

        <div className="suggestions">
            {data.map((suggestion, key) => <div key={key} onClick={() => { setQuery(suggestion.ascii) }}>
                <span>{suggestion.ascii}</span>
            </div>)}
        </div>
    </div>
}

export default SearchBar;