import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import { City, ResultList } from './components/ResultList';

const App: React.FunctionComponent = () => {
  const [cities, setCities] = useState<City[]>([]);

  return (
    <div className="App">
      <header className="App-header">
        <SearchBar placeholder="Search cities" onCitySearch={setCities} />
        <ResultList cities={cities}></ResultList>
      </header>
    </div>
  );
}

export default App;
