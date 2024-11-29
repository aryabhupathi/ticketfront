import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
const SeatLayout = ({ flightData, onClose }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const layout = flightData.layout || {};
  const seatConfiguration = layout.seatConfiguration || [];
  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Select Your Seats
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {seatConfiguration.map((row, rowIndex) => (
          <Box
            key={rowIndex}
            sx={{ display: "flex", justifyContent: "space-around" }}
          >
            {row.map((seat) => {
              const isBooked = selectedSeats.includes(seat);
              return (
                <Box key={seat} sx={{ width: "100%" }}>
                  <Button
                    variant={isBooked ? "outlined" : "contained"}
                    color={isBooked ? "secondary" : "primary"}
                    onClick={() => toggleSeat(seat)}
                    sx={{
                      padding: "10px",
                      borderRadius: 2,
                      backgroundColor: isBooked ? "lightgray" : "primary.main",
                      color: isBooked ? "black" : "white",
                      width: "100%",
                    }}
                    disabled={isBooked}
                  >
                    {seat}
                  </Button>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
      <Box sx={{ marginTop: 2 }}>
        <Button variant="contained" onClick={onClose}>
          Confirm Booking
        </Button>
      </Box>
    </Box>
  );
};
export default SeatLayout;
