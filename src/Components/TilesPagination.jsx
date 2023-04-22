import React, { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";

export default function TilesPagination({ onChange, tiles, page }) {
  const [tilesId, setTilesId] = useState([]);
  useEffect(() => {
    setTilesId(tiles);
  }, [tiles, page]);

  const handleChange = (event, value) => {
    onChange(value - 1);
  };

  return (
    <div className="pagination">
      <Pagination
        color="primary"
        shape="rounded"
        // variant="outlined"

        page={page + 1}
        count={tilesId.length}
        onChange={handleChange}
      />
    </div>
  );
}
