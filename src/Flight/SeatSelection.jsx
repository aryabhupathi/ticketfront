import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

const SeatSelection = ({ flight, onSeatSelect }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleSeatClick = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleConfirmSelection = () => {
    onSeatSelect(selectedSeats);
  };

  const getCategory = (seat) => {
    const { categories } = flight;
    if (seat <= categories[2].noOfSeatsAvailable) return 'Economy';
    if (seat <= categories[1].noOfSeatsAvailable + categories[2].noOfSeatsAvailable) return 'Business';
    return 'First Class';
  };

  return (
    <Box>
      <Typography variant="h6">Select Seats for {flight.flightName}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
        {flight.layout.seatConfiguration.flat().map((seat) => {
          const category = getCategory(seat);
          const isSelected = selectedSeats.includes(seat);

          return (
            <Button
              key={seat}
              sx={{
                backgroundColor: isSelected ? 'red' : category === 'Business' ? 'gold' : category === 'First Class' ? 'silver' : 'green',
                color: 'white',
              }}
              onClick={() => handleSeatClick(seat)}
            >
              {seat}
            </Button>
          );
        })}
      </Box>
      <Button variant="contained" sx={{ mt: 2 }} onClick={handleConfirmSelection}>
        Confirm Seats
      </Button>
    </Box>
  );
};

export default SeatSelection;
