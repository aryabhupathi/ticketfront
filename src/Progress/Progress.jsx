import React from "react";
import { Box, Typography } from "@mui/material";
const Progress = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        backgroundColor: "#f57c73",
      }}
    >
      <Typography variant="h3" color="blue">
        SITE UNDER CONSTRUCTION
      </Typography>
      <Typography variant="h2" color="red">
        PROCESSING . . . .
      </Typography>
    </Box>
  );
};
export default Progress;
