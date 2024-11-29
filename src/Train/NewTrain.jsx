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

const RoundTrain = () => {
  const location = useLocation();
  const { formData } = location.state;
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

  // Fetch train data
  useEffect(() => {
    const fetchTrainData = async () => {
      try {
        const outboundResponse = await fetch(
          `http://localhost:5000/api/train/search?source=${formData.source}&destination=${formData.destination}`
        );
        if (!outboundResponse.ok) {
          throw new Error("Error fetching outbound trains");
        }
        const outboundData = await outboundResponse.json();
        setOutboundTrip(outboundData);
        const returnResponse = await fetch(
          `http://localhost:5000/api/train/search?source=${formData.destination}&destination=${formData.source}`
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
  }, [formData.source, formData.destination]);

  const handleSeatChange = (trainIndex, coachIndex, coachFare, increment, isReturn) => {
    const coachKey = `${trainIndex}-${coachIndex}`;
    const selectedSeats = isReturn ? selectedReturnSeats : selectedOutboundSeats;
    const setSelectedSeats = isReturn ? setSelectedReturnSeats : setSelectedOutboundSeats;

    const availableSeats = isReturn
      ? returnTrip[trainIndex].coaches[coachIndex].noOfSeatsAvailable
      : outboundTrip[trainIndex].coaches[coachIndex].noOfSeatsAvailable;

    // Ensure the new seat count does not exceed the available seats or go below 0
    setSelectedSeats((prevState) => {
      const currentSelectedSeats = prevState[coachKey] || 0;
      const newSeatsSelected = Math.max(0, Math.min(currentSelectedSeats + increment, availableSeats));

      // Update total fare only if the seat count changes
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
      // Reset selections when switching accordions
      setSelectedReturnSeats({});
      setExpandedReturn(expandedReturn === trainIndex ? null : trainIndex);
    } else {
      // Reset selections when switching accordions
      setSelectedOutboundSeats({});
      setExpandedOutbound(expandedOutbound === trainIndex ? null : trainIndex);
    }
  };

  // Total seats selected for each trip
  const totalSeatsSelectedForTrip = (trip, selectedSeats, tripIndex) => {
    return Object.keys(selectedSeats).reduce((total, key) => {
      if (key.startsWith(`${tripIndex}-`)) {
        total += selectedSeats[key];
      }
      return total;
    }, 0);
  };

  // Handle reservations
  const handleReserve = () => {
    const outboundDetails = reservationDetails ? reservationDetails : [];
    const returnDetails = [];

    outboundTrip.forEach((train, trainIndex) => {
      train.coaches.forEach((coach, coachIndex) => {
        const reservedSeats = selectedOutboundSeats[`${trainIndex}-${coachIndex}`] || 0;
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
        const reservedSeats = selectedReturnSeats[`${trainIndex}-${coachIndex}`] || 0;
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
        await updateTrainSeats(outboundDetails, false); // false for outbound
      }
      if (returnDetails.length > 0) {
        await updateTrainSeats(returnDetails, true); // true for return
      }

      setSnackbarOpen(true);
      resetSelectedSeats();
      setModalOpen(false);
      setReservationConfirmed(true);
    } catch (error) {
      setError(error.message);
    }
  };

  // Modify the updateTrainSeats function to accept isReturn
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

      const response = await fetch(
        `http://localhost:5000/api/train/update-train-seats`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trainId: trains[trainIndex]._id,
            updatedCoaches: [{ coachName: detail.coachName, reservedSeats }],
          }),
        }
      );

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
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4">Select Your Train</Typography>
      <Typography variant="h5">Total Fare: {totalFare}</Typography>
      {outboundTrip.length > 0 && (
        <Box>
          <Typography variant="h5">Outbound Trip</Typography>
          {outboundTrip.map((train, trainIndex) => (
            <Accordion
              key={trainIndex}
              expanded={expandedOutbound === trainIndex}
              onChange={() => handleAccordionChange(false, trainIndex)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{train.trainName}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {train.coaches.map((coach, coachIndex) => (
                    <Grid item xs={12} sm={6} key={coachIndex}>
                      <Box>
                        <Typography>{coach.coachName}</Typography>
                        <Typography>
                          Fare: {coach.fare} Available Seats: {coach.noOfSeatsAvailable}
                        </Typography>
                        <Box>
                          <Button
                            onClick={() => handleSeatChange(trainIndex, coachIndex, coach.fare, 1)}
                            startIcon={<AddIcon />}
                          >
                            +
                          </Button>
                          <Typography>{selectedOutboundSeats[`${trainIndex}-${coachIndex}`] || 0}</Typography>
                          <Button
                            onClick={() => handleSeatChange(trainIndex, coachIndex, coach.fare, -1)}
                            startIcon={<RemoveIcon />}
                          >
                            -
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {returnTrip.length > 0 && (
        <Box>
          <Typography variant="h5">Return Trip</Typography>
          {returnTrip.map((train, trainIndex) => (
            <Accordion
              key={trainIndex}
              expanded={expandedReturn === trainIndex}
              onChange={() => handleAccordionChange(true, trainIndex)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{train.trainName}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {train.coaches.map((coach, coachIndex) => (
                    <Grid item xs={12} sm={6} key={coachIndex}>
                      <Box>
                        <Typography>{coach.coachName}</Typography>
                        <Typography>
                          Fare: {coach.fare} Available Seats: {coach.noOfSeatsAvailable}
                        </Typography>
                        <Box>
                          <Button
                            onClick={() => handleSeatChange(trainIndex, coachIndex, coach.fare, 1, true)}
                            startIcon={<AddIcon />}
                          >
                            +
                          </Button>
                          <Typography>{selectedReturnSeats[`${trainIndex}-${coachIndex}`] || 0}</Typography>
                          <Button
                            onClick={() => handleSeatChange(trainIndex, coachIndex, coach.fare, -1, true)}
                            startIcon={<RemoveIcon />}
                          >
                            -
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

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

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success">
          Reservation successful!
        </Alert>
      </Snackbar>

      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")}>
          <Alert onClose={() => setError("")} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default RoundTrain;
