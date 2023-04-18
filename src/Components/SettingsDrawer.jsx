import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import SettingsIcon from "@mui/icons-material/Settings";
import { IconButton } from "@mui/material";

export default function SettingsDrawer() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (_open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setOpen(_open);
  };

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
          <ListItemText primary={"prochainement..."} />
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
          sx: { width: "15rem" },
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
