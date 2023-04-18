import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import villes from "../assets/villes.json";
import CircularProgress from "@mui/material/CircularProgress";

function sleep(delay = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export default function Dropdown({ onChange, value }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setOptions(
      villes.map((r) => {
        return { label: `${r.name} (${r.department})`, id: r.id };
      })
    );
  }, []);

  const getInfos = (id) => {
      let infos = villes.filter((r) => r.id === id)[0];
      sessionStorage.setItem("selected", JSON.stringify(infos));
      onChange(infos);
  };

  return (
    <>
      <Autocomplete
        autoComplete
        className="dropdown"
        id="villes"
        open={open}
        onOpen={async () => {
          setLoading(true);
          await sleep(200);
          setOpen(true);
          setLoading(false);
        }}
        onClose={() => {
          setOpen(false);
          setLoading(false);
        }}
        onChange={(event, newValue) => {
          // setSelected(newValue);
          if(newValue){
            getInfos(newValue.id);
          }
        }}
        loading={loading}
        options={options.filter((r) => r.label != null)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Ville"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
      />
    </>
  );
}
