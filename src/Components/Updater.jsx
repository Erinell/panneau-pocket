import React, { useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";

const { ipcRenderer } = window.require("electron");

export default function Updater() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState({});

  useEffect(() => {
    ipcRenderer.on("update-rcv", function (event, payload) {
      setStatus(payload);
      if(payload.update){
        setOpen(true);
      }
    });
  }, []);

  const handleCancel = () => {
    setOpen(false);
  };

  const handleClose = (e) => {
    console.log(e);
    if(e.type === "click" && e.target.localName !== 'button') return;
    setOpen(false);
    ipcRenderer.send("update-apply");
  };

  return (
    <div className="update">
      <Dialog
        disableEscapeKeyDown
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{status.message}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {status.update ? "Une nouvelle version va être téléchargée" : null}
            {status.percent ? (
              <span>
              <label style={{display: 'flex', alignItems: 'center'}}>
              <LinearProgress variant="determinate" value={status.percent} sx={{width:"80%", mr: "10px"}}/>{Math.round(status.percent)}%
              </label>
                {`${(status.size / 1000000).toFixed(2)}Mo / ${(status.sizeTotal / 1000000).toFixed(2)}Mo`}
                <br />
                {`${(status.downloadSpeed / 1000000).toFixed(2)}Mo/s`}
              </span>
            ) : null}
            {status.downloaded
              ? "Relancer l'application pour effectuer l'installation."
              : null}
          </DialogContentText>
        </DialogContent>
        {status.downloaded ? (
          <DialogActions>
            <Button onClick={handleCancel}>Plus tard</Button>
            <Button onClick={handleClose}>Relancer</Button>
          </DialogActions>
        ) : null}
      </Dialog>
    </div>
  );
}
