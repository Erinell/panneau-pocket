import { useEffect, useState } from "react";

import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const { ipcRenderer } = window.require("electron");

export default function Favoris({ onSelect, selectedVille, disabled }) {
  const [selectedCity, setSelectedCity] = useState({});
  const [favoris, setFavoris] = useState([]);

  useEffect(() => {
    ipcRenderer.invoke("load", "ville").then((res) => {
      const resJSON = res ? JSON.parse(res) : {};
      setSelectedCity(resJSON);
    });
    ipcRenderer.invoke("load", "favoris").then((res) => {
      if (res) {
        const resJSON = res ? JSON.parse(res) : {};
        setFavoris(resJSON);
      }
    });
  }, [selectedVille]);

  const handleAddFavoris = () => {
    const newData = favoris.slice(0);
    newData[favoris.length] = selectedVille;
    setFavoris(newData);
    setSelectedCity(selectedVille);
    ipcRenderer.send("save", "favoris", JSON.stringify(newData));
  };

  const handleListItemClick = async (event, ville) => {
    if (ville.id === selectedCity.id) return;
    onSelect(ville);
    setSelectedCity(ville);
  };

  const handleRemove = (event, index) => {
    let _favoris = favoris.filter((r) => r.id !== index);
    setFavoris(_favoris);
    ipcRenderer.send("save", "favoris", JSON.stringify(_favoris));
  };

  const clearFavoris = () => {
    ipcRenderer.send("save", "favoris", JSON.stringify([]));
    setFavoris([]);
  };

  const sortFavoris = (favoris) => {
    return favoris.sort(function (a, b) {
      if (a.city < b.city) {
        return -1;
      }
      if (a.city > b.city) {
        return 1;
      }
      return 0;
    });
  };

  return (
    <div className="favoris">
      <Divider variant="middle" sx={{ borderWidth: 0, my: 1 }}></Divider>
      <Button
        className="btn-add-favoris"
        disabled={
          favoris.map((r) => r.id).includes(selectedCity.id) || !selectedCity.id
        }
        variant="contained"
        startIcon={<FavoriteIcon />}
        onClick={handleAddFavoris}
      >
        Ajouter aux favoris
      </Button>
      <List component="nav" className="favoris-list">
        <Divider variant="middle" sx={{ margin: 2, mx: 1 }}>
          Favoris
        </Divider>

        {sortFavoris(favoris).map((ville, i) => {
          return (
            <ListItem key={i} className="favoris-item">
              <ListItemButton
                dense
                disabled={disabled}
                selected={selectedCity.id === ville.id}
                sx={{
                  "&": {
                    borderRadius: "5px",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#1976d2",
                    color: "#fff",
                  },
                  "&.Mui-focusVisible": {
                    backgroundColor: "#2e8b57",
                  },
                  ":hover": {
                    backgroundColor: "#619cd5",
                    color: "#fff",
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "#1976d2",
                    color: "#fff",
                  },
                }}
                onClick={(event) => handleListItemClick(event, ville)}
              >
                <ListItemText primary={`${ville.name} (${ville.department})`} />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  className="favoris-delete-button"
                  onClick={(event) => handleRemove(event, ville.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Button
        className="btn-clear-favoris"
        variant="contained"
        color="error"
        startIcon={<DeleteForeverIcon />}
        onClick={clearFavoris}
      >
        Vider les favoris
      </Button>
    </div>
  );
}
