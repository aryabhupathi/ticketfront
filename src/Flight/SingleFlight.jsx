/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TicketStepper from "./TicketStepper";
import { useLocation } from "react-router-dom";
const SingleFlight = () => {
  const location = useLocation();
  const { formData } = location.state;
  const apiUrl = process.env.REACT_APP_API_URL;
  const [selectedSeats, setSelectedSeats] = useState({});
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [startBooking, setStartBooking] = useState(false);
  const [totalFare, setTotalFare] = useState(0);
  const [trip, setTrip] = useState([]);
  const [error, setError] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/flight/search?source=${formData.source}&destination=${formData.destination}`
        );
        if (!response.ok) {
          throw new Error("Error fetching flights");
        }
        const data = await response.json();
        setTrip(data);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchFlightData();
  }, [formData.source, formData.destination,apiUrl]);
  const fetchBookedSeats = async (flightId) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/flight/bookedSeats?flightId=${flightId}`
      );
      if (!response.ok) {
        throw new Error("Error fetching booked seats");
      }
      const data = await response.json();
      setBookedSeats(data.bookedSeats || []);
    } catch (error) {
      console.error("Error fetching booked seats:", error);
    }
  };
  const handleCloseSnackbar = () => setShowMessage(false);
  const handleFlightSelect = async (flight) => {
    setSelectedFlight(flight);
    setSelectedSeats((prevSeats) => ({
      ...prevSeats,
      [flight.flightName]: prevSeats[flight.flightName] || [],
    }));
    setBookingConfirmed(false);
    setStartBooking(false);
    await fetchBookedSeats(flight._id);
  };
  const handleStartBooking = () => {
    setStartBooking(true);
  };
  const handleBookSeats = () => {
    if (selectedSeats[selectedFlight.flightName]?.length > 0) {
      setOpenConfirmModal(true);
    } else {
      alert("Please select seats before booking.");
    }
  };
  const handleTotalFareUpdate = (fare) => {
    setTotalFare(fare);
  };
  const handleConfirmBooking = async () => {
    const payload = {
      flightId: selectedFlight._id,
      seats: selectedSeats[selectedFlight.flightName] || [],
      totalFare,
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
      const response = await fetch(`${apiUrl}/api/flight/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        setBookingConfirmed(true);
        setShowMessage(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during booking:", error);
      alert(
        "An error occurred while confirming your booking. Please try again."
      );
    } finally {
      setOpenConfirmModal(false);
    }
  };
  const confirmBooking = () => {
    handleConfirmBooking();
  };
  const handleChange = (flightIndex) => {
    setExpanded(expanded === flightIndex ? false : flightIndex);
    handleFlightSelect(trip[flightIndex]);
  };
  return (
    <Box
      sx={{
        padding: 2,
        backgroundImage: "url(../../flight.webp)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          background: "linear-gradient(to right, red, green, blue)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          margin: 0,
        }}
      >
        Available Flights from {formData.source} to {formData.destination}
      </Typography>
      <Grid size={{ xs: 12, sm: 9 }} sx={{ padding: 2 }}>
        {trip.length > 0 ? (
          trip.map((details, index) => (
            <Accordion
              key={index}
              expanded={expanded === index}
              onChange={() => handleChange(index)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="h6"
                  sx={{ color: "blue", fontWeight: "bold" }}
                >
                  {details.flightName}
                  <span style={{ color: "gray" }}> &#x2794; </span>
                </Typography>
                <Typography variant="body1" sx={{ color: "green", ml: 2 }}>
                  Route: {details.source} to {details.destination}
                  <span style={{ color: "gray" }}> &#x2794; </span>
                </Typography>
                <Typography variant="body1" sx={{ color: "orange", ml: 2 }}>
                  Fare per seat: ${details.baseFare}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Box
                    sx={{
                      border: "1px solid lightgray",
                      borderRadius: "4px",
                      padding: 2,
                      mb: 2,
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ color: "blue", mr: 1 }}>
                        Start Time: {details.startTime}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "blue" }}>
                        | End Time: {details.endTime}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "green", mt: 1 }}>
                      Stops: {details.stops.join(", ")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "green", mt: 1 }}>
                      Base Price: ${details.baseFare}
                    </Typography>
                    <Button onClick={handleStartBooking}>Proceed</Button>
                    {startBooking && !bookingConfirmed && (
                      <TicketStepper
                        selectedFlight={details}
                        seatLayout={details.layout}
                        seatCategories={details.seatCategories}
                        onTotalFare={handleTotalFareUpdate}
                        setSelectedSeats={setSelectedSeats}
                        bookedSeats={bookedSeats}
                      />
                    )}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Alert severity="error">No flights found!</Alert>
        )}
      </Grid>
      <Modal open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6">Confirm Booking?</Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={confirmBooking}
          >
            Confirm
          </Button>
        </Box>
      </Modal>
      <Snackbar
        open={showMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Booking Confirmed!
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default SingleFlight;
