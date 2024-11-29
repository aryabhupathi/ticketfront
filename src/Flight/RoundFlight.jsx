import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import Grid from '@mui/material/Grid2'
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RoundTicketStepper from "./RoundTicketStepper";
import { useLocation } from "react-router-dom";
import { useAuth } from "../authContext";
const RoundFlight = () => {
  const location = useLocation();
  const {user} = useAuth()
  const { formData } = location.state;
  const [selectedFlight, setSelectedFlight] = useState({
    outbound: null,
    return: null,
  });
  const [selectedSeats, setSelectedSeats] = useState({
    outboundSeats: [],
    returnSeats: [],
  });
  const [expandedOutbound, setExpandedOutbound] = useState(null);
  const [expandedReturn, setExpandedReturn] = useState(null);
  const [outboundTrip, setOutboundTrip] = useState([]);
  const [returnTrip, setReturnTrip] = useState([]);
  const [error, setError] = useState(null);
  const [outboundBookedSeats, setOutboundBookedSeats] = useState([]);
  const [returnBookedSeats, setReturnBookedSeats] = useState([]);
  const [isOutboundFinished, setIsOutboundFinished] = useState(false);
  const [isReturnFinished, setIsReturnFinished] = useState(false);
  const [totalFare, setTotalFare] = useState({
    outbound: 0,
    return: 0,
  });
  const handleTotalFareChange = (newFare, tripType) => {
    setTotalFare((prevFare) => ({
      ...prevFare,
      [tripType]: newFare,
    }));
  };
  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        const [outboundRes, returnRes] = await Promise.all([
          fetch(
            `http://localhost:5000/api/flight/search?source=${formData.source}&destination=${formData.destination}`
          ),
          fetch(
            `http://localhost:5000/api/flight/search?source=${formData.destination}&destination=${formData.source}`
          ),
        ]);
        if (!outboundRes.ok || !returnRes.ok) {
          throw new Error("Error fetching flights");
        }
        const [outboundData, returnData] = await Promise.all([
          outboundRes.json(),
          returnRes.json(),
        ]);
        setOutboundTrip(outboundData);
        setReturnTrip(returnData);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchFlightData();
  }, [formData.source, formData.destination]);
  const fetchBookedSeats = async (flightId, tripType) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/flight/bookedSeats?flightId=${flightId}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching ${tripType} booked seats`);
      }
      const data = await response.json();
      if (tripType === "outbound") {
        setOutboundBookedSeats(data.bookedSeats || []);
      } else {
        setReturnBookedSeats(data.bookedSeats || []);
      }
    } catch (error) {
      console.error(`Error fetching ${tripType} booked seats:`, error);
    }
  };
  const handleFlightSelect = async (flight, tripType) => {
    console.log(`Flight selected for ${tripType}:`, flight);
    setSelectedFlight((prevState) => ({
      ...prevState,
      [tripType]: flight,
    }));
    await fetchBookedSeats(flight._id, tripType);
  };
  const handleAccordionChange = (flight, index, tripType) => {
    if (tripType === "outbound") {
      setExpandedOutbound(expandedOutbound === index ? null : index);
      handleFlightSelect(flight, "outbound");
    } else if (tripType === "return") {
      setExpandedReturn(expandedReturn === index ? null : index);
      handleFlightSelect(flight, "return");
    }
  };
  const handleFinish = (tripType) => {
    tripType === "outbound"
      ? setIsOutboundFinished(true)
      : setIsReturnFinished(true);
    console.log(isOutboundFinished, isReturnFinished, "ioirioirioirioirioir");
  };
  const handleSeatsChange = (seats, tripType) => {
    console.log(`Seats updated for ${tripType}:`, seats);
    setSelectedSeats((prevSeats) => ({
      ...prevSeats,
      [`${tripType}Seats`]: seats,
    }));
  };
  const confirmBooking = async () => {
    if(!user){console.log('oooooooooo');
      return
    }
    else{
    const outboundFlightId = selectedFlight.outbound?._id;
    const returnFlightId = selectedFlight.return?._id;
    if (!outboundFlightId || !returnFlightId) {
      console.error("Missing required booking data.");
      return;
    }
    const combinedFare = totalFare.outbound + totalFare.return;
    console.log("Total Fare for Both Trips Combined:", combinedFare);
    try {
      const response = await fetch(
        "http://localhost:5000/api/flight/roundbookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            outboundFlightId,
            returnFlightId,
            outboundSeats: selectedSeats.outboundSeats,
            returnSeats: selectedSeats.returnSeats,
            totalFare: combinedFare,
            additionalSelections: {},
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Booking confirmed:", data);
        setOutboundBookedSeats(data.outboundFlight.bookedSeats);
        setReturnBookedSeats(data.returnFlight.bookedSeats);
      } else {
        const errorData = await response.json();
        console.error("Booking error:", errorData.message);
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
    }
  }
  };
  const renderFlights = (trips, tripType) => {
    const expandedState =
      tripType === "outbound" ? expandedOutbound : expandedReturn;
    return trips.length > 0 ? (
      trips.map((flight, index) => (
        <Accordion
          key={index}
          expanded={expandedState === index}
          onChange={() => handleAccordionChange(flight, index, tripType)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid
              container
              spacing={2}
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", md: "center" },
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
              }}
            >
              <Grid item xs={12} md={4}>
                <Typography
                  variant="h6"
                  sx={{ color: "blue", fontWeight: "bold", textAlign: { xs: "left", md: "center" } }}
                >
                  {flight.flightName}
                </Typography>
              </Grid>
  
              <Grid item xs={12} md={4}>
                <Typography
                  variant="body1"
                  sx={{ color: "green", textAlign: { xs: "left", md: "center" } }}
                >
                  Route: {flight.source} to {flight.destination}
                </Typography>
              </Grid>
  
              <Grid item xs={12} md={4}>
                <Typography
                  variant="body1"
                  sx={{ color: "orange", textAlign: { xs: "left", md: "center" } }}
                >
                  Fare per seat: ${flight.baseFare}
                </Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
  
          <AccordionDetails>
            <RoundTicketStepper
              selectedFlight={flight}
              seatLayout={flight.layout}
              seatCategories={flight.seatCategories}
              outboundBookedSeats={outboundBookedSeats}
              returnBookedSeats={returnBookedSeats}
              selectedSeats={
                tripType === "outbound"
                  ? selectedSeats.outboundSeats
                  : selectedSeats.returnSeats
              }
              tripType={tripType}
              onTotalFareChange={handleTotalFareChange}
              onSeatsChange={handleSeatsChange}
              onFinish={() => handleFinish(tripType)}
            />
          </AccordionDetails>
        </Accordion>
      ))
    ) : (
      <Typography variant="h6" sx={{ color: "red" }}>
        No {tripType === "outbound" ? "Outbound" : "Return"} Flights Available
      </Typography>
    );
  };
  
  return (
    <Grid>
      <Box
        sx={{
          padding: 2,
          backgroundImage: "url(../../flight.webp)",
          backgroundSize: "cover",
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
          }}
        >
          Available Flights from {formData.source} to {formData.destination}
        </Typography>
        <Grid sx={{ padding: 2 }}>
          {renderFlights(outboundTrip, "outbound")}
        </Grid>
        <Grid sx={{ padding: 2 }}>{renderFlights(returnTrip, "return")}</Grid>
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button variant="contained" color="primary" onClick={confirmBooking}>
            Confirm Booking
          </Button>
        </Box>
      </Box>
    </Grid>
  );
};
export default RoundFlight;
