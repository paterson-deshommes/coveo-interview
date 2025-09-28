import * as React from 'react'
import cityImg from '../city.png'

export interface City {
    id: number,
    ascii: string,
    name: string
}


export const ResultList: React.FunctionComponent<{ cities: City[] }> = ({ cities }) => {
    return <div className="ResultList">
        <ol>
            {cities.map((c) => <li key={c.id}>
                <img src={cityImg} alt="City logo"/>
                <span>Country: {c.name}</span>
                <span>Name: {c.ascii}</span>
            </li>)}
        </ol>
    </div>
}