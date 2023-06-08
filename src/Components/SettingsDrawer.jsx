import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import FormControlLabel from '@mui/material/FormControlLabel';
import SettingsIcon from "@mui/icons-material/Settings";
import Switch from '@mui/material/Switch';
import { IconButton } from "@mui/material";
const { ipcRenderer } = window.require('electron');

export default function SettingsDrawer() {
  const [open, setOpen] = React.useState(false);
  const [runBoot, setRunBoot] = React.useState(false);

  React.useEffect(() => {
    ipcRenderer.invoke("is-run-boot").then((isEnable) => {
      setRunBoot(isEnable);
    });
  }, []);

  const toggleDrawer = (_open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setOpen(_open);
  };

  const handleRunOnBoot = (e) => {
    setRunBoot(e.target.checked);
    ipcRenderer.send('run-boot', e.target.checked);
  }

  const list = () => (
    <Box
      className="settings-content"
      role="presentation"
      // onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <h2>Options</h2>
        <ListItem disablePadding>
          {/* <ListItemText primary={"prochainement..."} /> */}
          <FormControlLabel control={<Switch onChange={(e) => handleRunOnBoot(e)} checked={runBoot}/>} label="Lancer au démarrage du système" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <React.Fragment key={"left"}>
      <IconButton
        aria-label="settings"
        color="primary"
        onClick={toggleDrawer(true)}
      >
        <SettingsIcon />
      </IconButton>
      <Drawer
        PaperProps={{
          sx: { width: "16rem" },
        }}
        anchor={"left"}
        open={open}
        onClose={toggleDrawer(false)}
      >
        {list()}
      </Drawer>
    </React.Fragment>
  );
}
