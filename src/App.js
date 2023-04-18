import './App.css';
import Dropdown from './Components/Dropdown';
import { useEffect, useState, useRef } from 'react';
import Favoris from './Components/Favoris';
import PanneauPocket from './Components/PanneauPocket';
import TilesPagination from './Components/TilesPagination';
import SettingsDrawer from './Components/SettingsDrawer';
import { CircularProgress } from '@mui/material';

const panneauPocket = new PanneauPocket();

const { ipcRenderer } = window.require('electron');

function App() {
  const [selectedVille, setSelectedVille] = useState({});
  const [disableFav, setDisableFav] = useState(false);
  const [tiles, setTiles] = useState([]);
  const contentRef = useRef(null);

  const handleChangeVille = async (ville) => {
    setDisableFav(true);
    if (ville) {
      await updateTiles(ville.id);
      setSelectedVille(ville);
      ipcRenderer.send('save', 'ville', JSON.stringify(ville));
      loadPage(ville.id);
      setDisableFav(false);
      return;
    }
    setSelectedVille({});
    ipcRenderer.send('save', 'ville', JSON.stringify({}));
  }

  const handleChangePage = async (page) => {
    // setSelectedPage(page);
    loadPage(selectedVille.id, tiles[page])
  }

  const loadPage = async (villeId, tileId) => {
    let pageDom = await panneauPocket.getPageDom(`https://app.panneaupocket.com/embeded/${villeId}/${tileId ? tileId : ''}`);
    contentRef.current.replaceChildren(pageDom);
  }

  useEffect(() => {
    ipcRenderer.invoke('load', 'ville')
      .then(res => {
        const resJSON = res ? JSON.parse(res) : {};
        setSelectedVille(resJSON);
        updateTiles(resJSON.id);
        loadPage(resJSON.id);
      })
  }, []);

  const updateTiles = async (id) => {
    setTiles([]);
    let tiles = await panneauPocket.getTiles(`https://app.panneaupocket.com/embeded/${id}`);
    setTiles(tiles);
  }

  return (
    <div className="App">

      <main id='root'>
        <div className='left'>
          <div className='settings-btn'>
            <SettingsDrawer />
          </div>

          <div className='sidebar'>
            <Dropdown onChange={handleChangeVille} />
            <Favoris onSelect={handleChangeVille} selectedVille={selectedVille} disabled={disableFav} />
          </div>
        </div>
        <div className='container'>
          {!disableFav ? <div className='page' ref={contentRef}></div> : null}

          {disableFav ? <div className='loading' ><CircularProgress /></div> : null}

          <TilesPagination tiles={tiles} onChange={handleChangePage} />

        </div>
      </main>
    </div>
  );
}

export default App;
