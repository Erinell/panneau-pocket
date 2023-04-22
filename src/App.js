import './App.css';
import Dropdown from './Components/Dropdown';
import { useEffect, useState, useRef } from 'react';
import Favoris from './Components/Favoris';
import PanneauPocket from './Components/PanneauPocket';
import TilesPagination from './Components/TilesPagination';
import SettingsDrawer from './Components/SettingsDrawer';
import { CircularProgress } from '@mui/material';
import Updater from './Components/Updater';

const panneauPocket = new PanneauPocket();

const { ipcRenderer } = window.require('electron');

function App() {
  const [selectedVille, setSelectedVille] = useState({});
  const [disableFav, setDisableFav] = useState(false);
  const [tiles, setTiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const contentRef = useRef(null);

  const handleChangeVille = async (ville) => {
    setDisableFav(true);
    if (ville) {
      await updateTiles(ville.id);
      setSelectedVille(ville);
      ipcRenderer.send('save', 'ville', JSON.stringify(ville));
      handleChangePage(ville.id);
      setDisableFav(false);
      return;
    }
    setSelectedVille({});
    ipcRenderer.send('save', 'ville', JSON.stringify({}));
  }

  const handleChangePage = async (villeId, page) => {
    setCurrentPage(page ? page : 0);
    loadPage(villeId, tiles[page])
  }

  const loadPage = async (villeId, tileId) => {
    panneauPocket.getPageDom(`${villeId}/${tileId ? tileId : ''}`)
      .then(res => {
        contentRef.current.replaceChildren(res);
      })
      .catch(err => {
        contentRef.current.replaceChildren("Cherchez un nom de ville pour voir les informations ici.");
      })
  }

  useEffect(() => {
    ipcRenderer.invoke('load', 'ville').then(res => {
      const resJSON = res ? JSON.parse(res) : {};
      setSelectedVille(resJSON);
      updateTiles(resJSON.id);
      handleChangePage(resJSON.id);
    })

    const version = document.getElementById('version');

    ipcRenderer.invoke('version').then(res => {
      version.innerHTML = 'v' + res.version
    })
  }, []);

  const updateTiles = async (id) => {
    setTiles([]);
    let tiles = await panneauPocket.updateCityTiles(id);
    setTiles(tiles);
  }

  return (
    <div className="App">
      <Updater />
      <main id='root'>
        <div className='left'>
          <div className='settings-btn'>
            <SettingsDrawer />
            <div id='version' className='version'></div>
          </div>

          <div className='sidebar'>
            <Dropdown onChange={handleChangeVille} />
            <Favoris panneauPocket={panneauPocket} onSelect={handleChangeVille} selectedVille={selectedVille} disabled={disableFav} />
          </div>
        </div>
        <div className='container'>
          {!disableFav ? <div className='page' ref={contentRef}></div> : null}

          {disableFav ? <div className='loading' ><CircularProgress /></div> : null}
          <TilesPagination tiles={tiles} onChange={(page) => {handleChangePage(selectedVille.id, page)}} page={currentPage}/>
        </div>
      </main>
    </div>
  );
}

export default App;
