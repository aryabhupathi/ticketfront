/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  DialogContentText,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useAuth } from "../authContext";
const RoundTrain = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { formData } = location.state;
  const apiUrl = process.env.REACT_APP_API_URL;
  const [outboundTrip, setOutboundTrip] = useState([]);
  const [returnTrip, setReturnTrip] = useState([]);
  const [error, setError] = useState("");
  const [selectedOutboundSeats, setSelectedOutboundSeats] = useState({});
  const [selectedReturnSeats, setSelectedReturnSeats] = useState({});
  const [totalFare, setTotalFare] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [reservationConfirmed, setReservationConfirmed] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [expandedOutbound, setExpandedOutbound] = useState(null);
  const [expandedReturn, setExpandedReturn] = useState(null);
  const [snackbarError, setSnackbarError] = useState("");
  const [reserveAlert, setReserveAlert] = useState(false);
  useEffect(() => {
    const fetchTrainData = async () => {
      try {
        const outboundResponse = await fetch(
          `${apiUrl}/api/train/search?source=${formData.source}&destination=${formData.destination}`
        );
        if (!outboundResponse.ok) {
          throw new Error("Error fetching outbound trains");
        }
        const outboundData = await outboundResponse.json();
        setOutboundTrip(outboundData);
        const returnResponse = await fetch(
          `${apiUrl}/api/train/search?source=${formData.destination}&destination=${formData.source}`
        );
        if (!returnResponse.ok) {
          throw new Error("Error fetching return trains");
        }
        const returnData = await returnResponse.json();
        setReturnTrip(returnData);
        const initialOutboundSeats = {};
        outboundData.forEach((train, trainIndex) => {
          train.coaches.forEach((coach, coachIndex) => {
            initialOutboundSeats[`${trainIndex}-${coachIndex}`] = 0;
          });
        });
        setSelectedOutboundSeats(initialOutboundSeats);
        const initialReturnSeats = {};
        returnData.forEach((train, trainIndex) => {
          train.coaches.forEach((coach, coachIndex) => {
            initialReturnSeats[`${trainIndex}-${coachIndex}`] = 0;
          });
        });
        setSelectedReturnSeats(initialReturnSeats);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchTrainData();
  }, [formData.source, formData.destination,apiUrl]);
  const handleSeatChange = (
    trainIndex,
    coachIndex,
    coachFare,
    increment,
    isReturn
  ) => {
    const coachKey = `${trainIndex}-${coachIndex}`;
    const selectedSeats = isReturn
      ? selectedReturnSeats
      : selectedOutboundSeats;
    const setSelectedSeats = isReturn
      ? setSelectedReturnSeats
      : setSelectedOutboundSeats;
    const availableSeats = isReturn
      ? returnTrip[trainIndex].coaches[coachIndex].noOfSeatsAvailable
      : outboundTrip[trainIndex].coaches[coachIndex].noOfSeatsAvailable;
    setSelectedSeats((prevState) => {
      const currentSelectedSeats = prevState[coachKey] || 0;
      const newSeatsSelected = Math.max(
        0,
        Math.min(currentSelectedSeats + increment, availableSeats)
      );
      const seatDifference = newSeatsSelected - currentSelectedSeats;
      if (seatDifference !== 0) {
        const fareChange = seatDifference * coachFare;
        setTotalFare((prevFare) => prevFare + fareChange);
      }
      return {
        ...prevState,
        [coachKey]: newSeatsSelected,
      };
    });
  };
  const handleAccordionChange = (isReturn, trainIndex) => {
    if (isReturn) {
      setSelectedReturnSeats({});
      setExpandedReturn(expandedReturn === trainIndex ? null : trainIndex);
    } else {
      setSelectedOutboundSeats({});
      setExpandedOutbound(expandedOutbound === trainIndex ? null : trainIndex);
    }
  };
  const totalSeatsSelectedForTrip = (trip, selectedSeats, tripIndex) => {
    return Object.keys(selectedSeats).reduce((total, key) => {
      if (key.startsWith(`${tripIndex}-`)) {
        total += selectedSeats[key];
      }
      return total;
    }, 0);
  };
  const handleReserve = () => {
    if (!user) {
      setSnackbarError("Please log in to reserve tickets.");
      setSnackbarOpen(true);
      return;
    }
    const outboundDetails = reservationDetails ? reservationDetails : [];
    const returnDetails = [];
    outboundTrip.forEach((train, trainIndex) => {
      train.coaches.forEach((coach, coachIndex) => {
        const reservedSeats =
          selectedOutboundSeats[`${trainIndex}-${coachIndex}`] || 0;
        if (reservedSeats > 0) {
          outboundDetails.push({
            coachName: coach.coachName,
            reservedSeats: reservedSeats,
            fare: coach.fare,
            total: reservedSeats * coach.fare,
          });
        }
      });
    });
    returnTrip.forEach((train, trainIndex) => {
      train.coaches.forEach((coach, coachIndex) => {
        const reservedSeats =
          selectedReturnSeats[`${trainIndex}-${coachIndex}`] || 0;
        if (reservedSeats > 0) {
          returnDetails.push({
            coachName: coach.coachName,
            reservedSeats: reservedSeats,
            fare: coach.fare,
            total: reservedSeats * coach.fare,
          });
        }
      });
    });
    if (outboundDetails.length === 0 && returnDetails.length === 0) {
      setError("Please select at least one seat before reserving.");
      return;
    }
    setReservationDetails({ outboundDetails, returnDetails });
    setModalOpen(true);
  };
  const confirmReservation = async () => {
    if (!reservationDetails) {
      setError("No seats to reserve.");
      return;
    }
    const { outboundDetails, returnDetails } = reservationDetails;
    try {
      if (outboundDetails.length > 0) {
        await updateTrainSeats(outboundDetails, false);
      }
      if (returnDetails.length > 0) {
        await updateTrainSeats(returnDetails, true);
      }
      setSnackbarOpen(true);
      resetSelectedSeats();
      setModalOpen(false);
      setReservationConfirmed(true);
    } catch (error) {
      setError(error.message);
    }
  };
  const updateTrainSeats = async (details, isReturn) => {
    const trains = isReturn ? returnTrip : outboundTrip;
    for (const detail of details) {
      const trainIndex = trains.findIndex((train) =>
        train.coaches.some((coach) => coach.coachName === detail.coachName)
      );
      const coachIndex = trains[trainIndex].coaches.findIndex(
        (coach) => coach.coachName === detail.coachName
      );
      const reservedSeats = isReturn
        ? selectedReturnSeats[`${trainIndex}-${coachIndex}`] || 0
        : selectedOutboundSeats[`${trainIndex}-${coachIndex}`] || 0;
      const response = await fetch(`${apiUrl}/api/train/update-train-seats`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trainId: trains[trainIndex]._id,
          updatedCoaches: [{ coachName: detail.coachName, reservedSeats }],
        }),
      });
      if (!response.ok) {
        throw new Error("Error reserving seats");
      }
    }
  };
  const areAllTripsSelected = () => {
    const outboundSelected = Object.values(selectedOutboundSeats).some(
      (seatCount) => seatCount > 0
    );
    const returnSelected = Object.values(selectedReturnSeats).some(
      (seatCount) => seatCount > 0
    );
    return outboundSelected && returnSelected;
  };
  const resetSelectedSeats = () => {
    setSelectedOutboundSeats({});
    setSelectedReturnSeats({});
    setTotalFare(0);
  };
  const downloadReservationDetails = () => {
    if (!reservationDetails) return;
    const data = {
      outbound: reservationDetails.outboundDetails,
      return: reservationDetails.returnDetails,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservation_details.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setReservationConfirmed(false);
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };
  const renderTrip = (trip, isReturn) => {
    const expandedAccordion = isReturn ? expandedReturn : expandedOutbound;
    return trip.map((train, trainIndex) => (
      <Accordion
        key={trainIndex}
        sx={{ width: "100%", mb: 2 }}
        expanded={expandedAccordion === trainIndex}
        onChange={() => handleAccordionChange(isReturn, trainIndex)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel${trainIndex}-content`}
          id={`panel${trainIndex}-header`}
        >
          <Typography variant="h6" sx={{ color: "blue", fontWeight: "bold" }}>
            {train.trainName}
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: "green", fontWeight: "light", fontStyle: "italic" }}
          >
            ({train.startTime} - {train.endTime})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            sx={{
              border: "1px solid lightgray",
              borderRadius: "4px",
              padding: 2,
              mb: 2,
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography variant="h6" sx={{ color: "blue", fontWeight: "bold" }}>
              {train.source} to {train.destination}
            </Typography>
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography variant="body1" sx={{ color: "red" }}>
                Start Time: {train.startTime}
              </Typography>
              <Typography variant="body1" sx={{ color: "green" }}>
                End Time: {train.endTime}
              </Typography>
              <Typography variant="body1" sx={{ color: "orange" }}>
                Stops: {train.stops.join(", ")}
              </Typography>
            </Box>
            <Grid
              sx={{
                backgroundColor: "#f8f8f8",
                padding: "16px",
                borderRadius: "5px",
              }}
            >
              <Grid container spacing={3}>
                {train.coaches.map((coach, coachIndex) => {
                  const coachKey = `${trainIndex}-${coachIndex}`;
                  return (
                    <Grid item xs={12} sm={6} md={2} key={coachIndex}>
                      <Box
                        sx={{
                          backgroundColor: "#f0f4ff",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          height: "150px",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <Typography variant="h6">{coach.coachName}</Typography>
                        <Typography variant="body2">
                          Seats Available: {coach.noOfSeatsAvailable}
                        </Typography>
                        <Typography variant="body2">
                          Fare: ${coach.fare}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-around",
                            alignItems: "center",
                            mt: 2,
                            border: "1px solid #ddd",
                            padding: "4px",
                            borderRadius: "8px",
                            backgroundColor: "#fff",
                          }}
                        >
                          <Button
                            variant="outlined"
                            onClick={() =>
                              handleSeatChange(
                                trainIndex,
                                coachIndex,
                                coach.fare,
                                -1,
                                isReturn
                              )
                            }
                            disabled={
                              (isReturn
                                ? selectedReturnSeats[coachKey]
                                : selectedOutboundSeats[coachKey]) === 0
                            }
                          >
                            <RemoveIcon fontSize="small" />
                          </Button>
                          <Typography
                            variant="body1"
                            sx={{ display: "inline", mx: 1 }}
                          >
                            {isReturn
                              ? selectedReturnSeats[coachKey] || 0
                              : selectedOutboundSeats[coachKey] || 0}
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              handleSeatChange(
                                trainIndex,
                                coachIndex,
                                coach.fare,
                                1,
                                isReturn
                              )
                            }
                            disabled={
                              (isReturn
                                ? selectedReturnSeats[coachKey] || 0
                                : selectedOutboundSeats[coachKey] || 0) >=
                              coach.noOfSeatsAvailable
                            }
                          >
                            <AddIcon fontSize="small" />
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
    ));
  };
  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        Round Train Booking
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography variant="h5" gutterBottom>
        Outbound Trip
      </Typography>
      {renderTrip(outboundTrip, false)}
      <Typography variant="h5" gutterBottom>
        Return Trip
      </Typography>
      {renderTrip(returnTrip, true)}
      {!reservationConfirmed ? (
        <Button
          variant="contained"
          onClick={handleReserve}
          disabled={!areAllTripsSelected()}
        >
          Reserve Seats for Both Trips
        </Button>
      ) : (
        <Button variant="outlined" onClick={downloadReservationDetails}>
          Download Reservation Details
        </Button>
      )}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Confirm Reservation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reserve the selected seats?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmReservation} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Reservation successful!
        </Alert>
      </Snackbar>
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={() => setError("")} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {snackbarError}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default RoundTrain;
