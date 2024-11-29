import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import Grid from '@mui/material/Grid2'
import { useAuth } from "../authContext";
const additionalProducts = [
  { name: "Extra Baggage", price: 50 },
  { name: "Meal Plan", price: 30 },
  { name: "Priority Boarding", price: 20 },
];
const TicketStepper = ({
  selectedFlight,
  seatLayout,
  seatCategories,
  selectedSeats,
  onTotalFare,
  setSelectedSeats,
  bookedSeats = [],
}) => {
  const { user } = useAuth();
  const steps = ["Select Seat", "Select Additionals", "Review"];
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSeatSelections, setSelectedSeatSelections] = useState({});
  const [additionalSelections, setAdditionalSelections] = useState({});
  const [totalFare, setTotalFare] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [userLoginWarning, setUserLoginWarning] = useState(false);
  const handleSeatSelect = (seat) => {
    const isSelected = Object.values(selectedSeatSelections).flat().includes(seat);
    const rowMatch = seat.match(/^(\d+)/); 
    const rowIndex = rowMatch ? parseInt(rowMatch[1], 10) : null;
    const seatCategory = rowIndex !== null
      ? seatCategories.find((category) => category.rows.includes(rowIndex))
      : null;
    if (!seatCategory) return;
    const farePerSeat = seatCategory.price;
    setSelectedSeatSelections((prev) => {
      const updatedSeats = isSelected
        ? Object.entries(prev).reduce((acc, [key, seats]) => {
              const filteredSeats = seats.filter((s) => s !== seat);
              if (filteredSeats.length > 0) {
                  acc[key] = filteredSeats; // Keep non-empty arrays
              }
              return acc;
          }, {})
        : {
              ...prev,
              [farePerSeat]: [...(prev[farePerSeat] || []), seat],
          };
      const newTotalFare = Object.entries(updatedSeats).reduce(
        (total, [price, seats]) => total + price * seats.length,
        0
      );
      setTotalFare(newTotalFare);
      onTotalFare(newTotalFare);
      setSelectedSeats((prev) => ({
        ...prev,
        [selectedFlight._id]: Object.values(updatedSeats).flat(),
      }));
      return updatedSeats;
    });
  };
  const handleAdditionalSelect = (product, price) => {
    setAdditionalSelections((prev) => {
      const isSelected = prev[product] !== undefined;
      const newSelections = { ...prev };
      if (isSelected) {
        delete newSelections[product]; // Deselecting the product
      } else {
        newSelections[product] = price; // Selecting the product
      }
      // Calculate the new total fare
      const newTotalFare =
        Object.values(newSelections).reduce((total, itemPrice) => total + itemPrice, 0) +
        Object.entries(selectedSeatSelections).reduce(
          (total, [price, seats]) => total + price * seats.length,
          0
        );
      setTotalFare(newTotalFare);
      onTotalFare(newTotalFare);
      return newSelections;
    });
  };
  const handleConfirmBooking = async () => {
    const payload = {
      flightId: selectedFlight._id,
      seats: Object.values(selectedSeatSelections).flat(),
      totalFare,
      additionalSelections,
    };
    if (
      !payload.flightId ||
      payload.seats.length === 0 ||
      payload.totalFare <= 0
    ) {
      alert("Flight ID, seats, and total fare are required.");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:5000/api/flight/bookings",
        {
          method: "POST", // Use POST for booking
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Booking confirmed:", data);
        setConfirm(true);
        setBookingConfirmed(true); // Set booking confirmed state
        setSnackbarOpen(true); // Open the snackbar
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during booking:", error);
      alert(
        "An error occurred while confirming your booking. Please try again."
      );
    }
  };
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  const handleNext = () => {
    if (activeStep === 0 && Object.values(selectedSeatSelections).flat().length === 0) {
      alert("Please select at least one seat.");
      return;
    }
    // Check if the user is logged in before confirming the booking
    if (activeStep === steps.length - 1) {
      if (!user) {
        setUserLoginWarning(true); // Show warning if not logged in
        return; // Prevent confirmation if user is not logged in
      }
      handleConfirmBooking(); // Proceed to confirm booking if user is logged in
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };
  const handleCloseLoginWarning = () => {
    setUserLoginWarning(false);
  };
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  const getSeatBorderColor = (seat) => {
    const seatLabel = typeof seat === "string" ? seat : seat.label;
    const rowIndex = parseInt(seatLabel.match(/\d+/)[0]) - 1;
    const category = seatCategories.find((cat) => cat.rows.includes(rowIndex));
    switch (category?.name) {
      case "Business":
        return "red";
      case "First Class":
        return "yellow";
      case "Economy":
        return "blue";
      default:
        return "gray";
    }
  };
  // Render seat layout
  const renderSeats = () => {
    const columnCount = seatLayout.seatConfiguration[0].length;
    const transposedLayout = Array(columnCount)
      .fill()
      .map((_, colIndex) =>
        seatLayout.seatConfiguration.map((row) => row[colIndex])
      );
    return (
      <Grid container spacing={2}>
        <Box
          display="flex"
          flexDirection="column"
          mt={2}
          sx={{ overflow: "scroll" }}
        >
          {transposedLayout.map((seatColumn, columnIndex) => (
            <Box
              key={columnIndex}
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              mb={2}
              flexGrow={1}
            >
              {seatColumn.map((seat, rowIndex) => {
                const isSelected = Object.values(selectedSeatSelections)
                  .flat()
                  .includes(seat);
                const isBooked =
                  Array.isArray(bookedSeats) && bookedSeats.includes(seat);
                return (
                  <Box
                    key={rowIndex}
                    textAlign="center"
                    width="60px"
                    height="40px"
                    border={`1px solid ${getSeatBorderColor(seat)}`}
                    bgcolor={
                      isSelected
                        ? "lightgreen"
                        : isBooked
                        ? "lightgray"
                        : "white"
                    }
                    onClick={() => !isBooked && handleSeatSelect(seat)}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx={1}
                    borderRadius={1}
                    sx={{
                      cursor: isBooked ? "not-allowed" : "pointer",
                      opacity: isBooked ? 0.5 : 1,
                    }}
                  >
                    {seat}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Grid>
    );
  };
  const renderAdditionals = () => {
    return (
      <Box>
        {additionalProducts.map((product) => (
          <Box key={product.name}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={additionalSelections[product.name] !== undefined}
                  onChange={() =>
                    handleAdditionalSelect(product.name, product.price)
                  }
                />
              }
              label={`${product.name} - $${product.price}`}
            />
          </Box>
        ))}
      </Box>
    );
  };
  const renderReview = () => {
    const selectedSeats = Object.entries(selectedSeatSelections).flatMap(
      ([category, seats]) => seats.map((seat) => ({ seat, category }))
    );
    const additionalTotal = Object.values(additionalSelections).reduce(
      (total, price) => total + price,
      0
    );
    const total = totalFare + additionalTotal;
    return (
      <Box>
        <Typography variant="h6">Selected Seats:</Typography>
        {selectedSeats.map(({ seat }) => (
          <Typography key={seat}>{seat}</Typography>
        ))}
        <Typography variant="h6">Additionals:</Typography>
        {Object.keys(additionalSelections).length > 0 ? (
          Object.keys(additionalSelections).map((additional) => (
            <Typography key={additional}>{additional}</Typography>
          ))
        ) : (
          <Typography>No additional products selected.</Typography>
        )}
        <Typography variant="h6">Total Fare: ${total}</Typography>
      </Box>
    );
  };
  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box mt={4}>
        {activeStep === 0 && renderSeats()}
        {activeStep === 1 && renderAdditionals()}
        {activeStep === 2 && renderReview()}
      </Box>
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Button variant="contained" color="primary" onClick={handleNext}>
          {activeStep === steps.length - 1 ? "Confirm" : "Next"}
        </Button>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={bookingConfirmed ? "success" : "error"}
        >
          {bookingConfirmed
            ? "Booking Confirmed!"
            : "Booking could not be confirmed."}
        </Alert>
      </Snackbar>
      <Snackbar
        open={userLoginWarning}
        autoHideDuration={6000}
        onClose={handleCloseLoginWarning}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseLoginWarning} severity="warning">
          Please log in to confirm your booking.
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default TicketStepper;
