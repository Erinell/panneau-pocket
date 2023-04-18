import React, { useState, useEffect } from "react";
import Pagination from '@mui/material/Pagination';

export default function TilesPagination({onChange, tiles}) {
  const [tilesId, setTilesId] = useState([]);

  useEffect(() => {
    setTilesId(tiles);
  }, [tiles]);

  const handleChange = (event, value) => {
    onChange(value - 1);
  };


  return (
    <div className='pagination' >
      <Pagination 
      color="primary"
      shape="rounded"
      // variant="outlined"
      count={tilesId.length}
      onChange={handleChange}
      />
    </div>
  );
}
