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
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const { ipcRenderer } = window.require("electron");

export default function Favoris({
  panneauPocket,
  onSelect,
  selectedVille,
  disabled,
}) {
  const [selectedCity, setSelectedCity] = useState({});
  const [favoris, setFavoris] = useState([]);
  const [notifier, setNotifier] = useState([]);

  useEffect(() => {
    ipcRenderer.invoke("load", "ville").then((res) => {
      const resJSON = res ? JSON.parse(res) : {};
      setSelectedCity(resJSON);
    });

    panneauPocket.getFavoris().then((res) => {
      updateFavoris(res);
    });

    panneauPocket.getNotifier().then((res) => {
      if (!res.includes(selectedCity.id)) return;
      setNotifier(res);
    });

    const update = setInterval(() => {
      panneauPocket.checkNotifier().then((ville) => {
        if (!ville) return;
        ipcRenderer.send(
          "notify",
          ville.name,
          "Une nouvelle information est apparue !"
        );
      });
    }, 0.25 * 60 * 60 * 1000); //0.25 * 60 * 60 * 1000 1/4 d'heure

    return () => clearInterval(update);
  }, [selectedVille]);

  const updateFavoris = (favoris) => {
    setFavoris(favoris);
    panneauPocket.setFavoris(favoris);
  };

  const handleAddFavoris = () => {
    const newData = favoris.slice(0);
    newData[favoris.length] = selectedVille;
    updateFavoris(newData);
    setSelectedCity(selectedVille);
  };

  const handleListItemClick = async (event, ville) => {
    if (ville.id === selectedCity.id) return;
    onSelect(ville);
    setSelectedCity(ville);
  };

  const handleRemove = (event, id) => {
    let _favoris = favoris.filter((r) => r.id !== id);
    removeNotifier(null, id);
    updateFavoris(_favoris);
  };

  const clearFavoris = () => {
    updateFavoris([]);
    setNotifier(panneauPocket.clearNotifier());
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

  const addNotifier = (event, id) => {
    let notif = panneauPocket.addNotifier(id);
    if (notif) setNotifier([...notif]);
  };

  const removeNotifier = (event, id) => {
    let notif = panneauPocket.removeNotifier(id);
    setNotifier([...notif]);
  };

  return (
    <>
      <div className="favoris">
        <Divider variant="middle" sx={{ borderWidth: 0, my: 1 }}></Divider>
        <Button
          className="favoris-add-button"
          disabled={
            favoris.map((r) => r.id).includes(selectedCity.id) ||
            !selectedCity.id
          }
          variant="contained"
          startIcon={<FavoriteIcon />}
          onClick={handleAddFavoris}
        >
          Ajouter aux favoris
        </Button>
        <Divider variant="middle" sx={{ margin: 2, mx: 1 }}>
          Favoris
        </Divider>
        <List component="nav" className="favoris-list">
          {sortFavoris(favoris).map((ville, i) => {
            return (
              <ListItem
                key={i}
                className="favoris-item"
                secondary={
                  <>
                    <IconButton
                      edge="end"
                      aria-label="notification"
                      className=""
                      sx={{ marginRight: "5px" }}
                      onClick={(event) => {
                        panneauPocket.isNotified(ville.id)
                          ? removeNotifier(event, ville.id)
                          : addNotifier(event, ville.id);
                      }}
                    >
                      {panneauPocket.isNotified(ville.id) ? (
                        <NotificationsActiveIcon />
                      ) : (
                        <NotificationsNoneIcon />
                      )}
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      className="favoris-delete-button"
                      onClick={(event) => handleRemove(event, ville.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemButton
                  // dense
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
                  <ListItemText
                    primary={`${ville.name} (${ville.department})`}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      <div className="favoris-clear-container">
        <Button
          className="favoris-clear-button"
          variant="contained"
          color="error"
          startIcon={<DeleteForeverIcon />}
          onClick={clearFavoris}
        >
          Vider les favoris
        </Button>
      </div>
      </div>
    </>
  );
}
