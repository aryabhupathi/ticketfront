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
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAuth } from "../authContext";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
const SingleTrain = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { formData } = location.state;
  const [trip, setTrip] = useState([]);
  const [error, setError] = useState("");
  const [selectedSeats, setSelectedSeats] = useState({});
  const [totalFare, setTotalFare] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [reservationConfirmed, setReservationConfirmed] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState("");
  const [reserveAlert, setReserveAlert] = useState(false);
  useEffect(() => {
    const fetchTrainData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/train/search?source=${formData.source}&destination=${formData.destination}`
        );
        if (!response.ok) {
          throw new Error("Error fetching trains");
        }
        const data = await response.json();
        setTrip(data);
        const initialSeats = {};
        data.forEach((train, trainIndex) => {
          train.coaches.forEach((coach, coachIndex) => {
            initialSeats[`${trainIndex}-${coachIndex}`] = 0;
          });
        });
        setSelectedSeats(initialSeats);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchTrainData();
  }, [formData.source, formData.destination]);
  const handleSeatChange = (trainIndex, coachIndex, coachFare, increment) => {
    const coachKey = `${trainIndex}-${coachIndex}`;
    setSelectedSeats((prevState) => {
      const newSeatsSelected = Math.max(0, prevState[coachKey] + increment);
      const fareChange = increment * coachFare;
      setTotalFare((prevFare) => prevFare + fareChange);
      return {
        ...prevState,
        [coachKey]: newSeatsSelected,
      };
    });
  };
  const totalSeatsSelectedForTrain = (trainIndex) => {
    return Object.keys(selectedSeats).reduce((total, key) => {
      if (key.startsWith(`${trainIndex}-`)) {
        total += selectedSeats[key];
      }
      return total;
    }, 0);
  };
  const handleReserve = (trainIndex) => {
    if (!user) {
      setSnackbarError("Please log in to reserve tickets.");
      setSnackbarOpen(true);
      return;
    }
    const selectedTrain = trip[trainIndex];
    const details = selectedTrain.coaches
      .map((coach, coachIndex) => {
        const reservedSeats = selectedSeats[`${trainIndex}-${coachIndex}`];
        return reservedSeats > 0
          ? {
              coachName: coach.coachName,
              reservedSeats: reservedSeats,
              fare: coach.fare,
              total: reservedSeats * coach.fare,
            }
          : null;
      })
      .filter(Boolean);
    if (details.length === 0) {
      setError("Please select at least one seat before reserving.");
      return;
    }
    setReservationDetails({ train: selectedTrain, details });
  };
  const confirmReservation = async () => {
    const selectedTrain = reservationDetails.train;
    const updatedCoaches = selectedTrain.coaches
      .map((coach, coachIndex) => {
        const reservedSeats =
          selectedSeats[`${trip.indexOf(selectedTrain)}-${coachIndex}`];
        return {
          coachName: coach.coachName,
          reservedSeats: reservedSeats > 0 ? reservedSeats : 0,
        };
      })
      .filter((coach) => coach.reservedSeats > 0);
    if (updatedCoaches.length === 0) {
      setError("No seats to reserve.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/train/update-train-seats`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trainId: selectedTrain._id,
            updatedCoaches: updatedCoaches,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Error reserving seats");
      }
      const result = await response.json();
      setReserveAlert(true);
      setTrip((prevTrip) => {
        const updatedTrip = [...prevTrip];
        const trainIndex = trip.indexOf(selectedTrain);
        updatedTrip[trainIndex].coaches.forEach((coach, coachIndex) => {
          const reservedSeats = selectedSeats[`${trainIndex}-${coachIndex}`];
          if (reservedSeats > 0) {
            coach.noOfSeatsAvailable -= reservedSeats;
          }
        });
        return updatedTrip;
      });
      setSelectedSeats((prevSeats) => {
        const updatedSeats = { ...prevSeats };
        Object.keys(updatedSeats).forEach((key) => {
          if (key.startsWith(`${trip.indexOf(selectedTrain)}-`)) {
            updatedSeats[key] = 0;
          }
        });
        return updatedSeats;
      });
      setTotalFare(0);
      setModalOpen(false);
      setReservationConfirmed(true);
    } catch (error) {
      setError(error.message);
    }
  };
  const downloadReservationDetails = () => {
    if (!reservationDetails) return;
    const data = {
      train: reservationDetails.train,
      details: reservationDetails.details,
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
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setReserveAlert(false);
  };
  const renderTrip = (trip) => {
    return trip.map((train, trainIndex) => (
      <Accordion key={trainIndex} sx={{ width: "100%", mb: 2 }}>
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
            sx={{
              color: "green",
              fontWeight: "light",
              fontStyle: "italic",
            }}
          >
            ({train.startTime} - {train.endTime})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid
            sx={{
              backgroundColor: "#f9f9f9",
              border: "1px solid lightgray",
              borderRadius: "4px",
              padding: 2,
            }}
          >
            <Typography variant="body1" sx={{ color: "red" }}>
              Route: {train.source} to {train.destination}
            </Typography>
            <Typography variant="body1" sx={{ color: "green" }}>
              Timings: {train.startTime} -- {train.endTime}
            </Typography>
            <Typography variant="body1" sx={{ color: "orange" }}>
              Stops: {train.stops.join(", ")}
            </Typography>
            <Grid container spacing={2}>
              {train.coaches.map((coach, coachIndex) => {
                const coachKey = `${trainIndex}-${coachIndex}`;
                return (
                  <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={coachIndex}>
                    <Box
                      sx={{
                        backgroundColor: "#f0f4ff",
                        padding: { xs: 2, sm: 3 },
                        borderRadius: "8px",
                        height: "70%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #ddd",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                            fontWeight: 500,
                          }}
                        >
                          Coach Name: {coach.coachName}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                            fontWeight: 500,
                          }}
                        >
                          Seats Available:{" "}
                          {coach.noOfSeatsAvailable - selectedSeats[coachKey]}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                            fontWeight: 500,
                          }}
                        >
                          Fare: ₹{coach.fare}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-around",
                          alignItems: "center",
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            handleSeatChange(
                              trainIndex,
                              coachIndex,
                              coach.fare,
                              -1
                            )
                          }
                          disabled={selectedSeats[coachKey] === 0}
                        >
                          <RemoveIcon fontSize="small" />
                        </Button>
                        <Typography sx={{ mx: 2 }}>
                          {selectedSeats[coachKey]}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            handleSeatChange(
                              trainIndex,
                              coachIndex,
                              coach.fare,
                              1
                            )
                          }
                          disabled={
                            selectedSeats[coachKey] >= coach.noOfSeatsAvailable
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
            {totalSeatsSelectedForTrain(trainIndex) > 0 &&
              !reservationConfirmed && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleReserve(trainIndex)}
                  sx={{ mt: 2 }}
                >
                  Reserve
                </Button>
              )}
            {reservationConfirmed && (
              <Button
                variant="contained"
                color="secondary"
                onClick={downloadReservationDetails}
                sx={{ mt: 2 }}
              >
                Download Reservation Details
              </Button>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    ));
  };
  return (
    <Grid container spacing={2}>
      <Typography variant="h5" gutterBottom>
        Train List:
      </Typography>
      {trip.length > 0 ? (
        renderTrip(trip)
      ) : (
        <Typography>No trains found.</Typography>
      )}
      <Snackbar
        open={reserveAlert}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Reservation successful!
        </Alert>
      </Snackbar>{" "}
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
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Confirm Reservation</DialogTitle>
        <DialogContent>
          {reservationDetails ? (
            <>
              <Typography variant="h6">
                {reservationDetails.train.trainName}
              </Typography>
              <Typography>Source: {reservationDetails.train.source}</Typography>
              <Typography>
                Destination: {reservationDetails.train.destination}
              </Typography>
              <Typography>Selected Coaches:</Typography>
              {reservationDetails.details.map((detail, index) => (
                <Typography key={index}>
                  {detail.coachName}: {detail.reservedSeats} seats (Total: ₹
                  {detail.total})
                </Typography>
              ))}
            </>
          ) : (
            <Typography>Loading...</Typography>
          )}
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
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message="Reservation successful!"
      />
    </Grid>
  );
};
export default SingleTrain;
