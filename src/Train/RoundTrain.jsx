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
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useAuth } from "../authContext";
import DoubleArrowTwoToneIcon from "@mui/icons-material/DoubleArrowTwoTone";
import ExpandCircleDownTwoToneIcon from "@mui/icons-material/ExpandCircleDownTwoTone";
import CurrencyRupeeTwoToneIcon from "@mui/icons-material/CurrencyRupeeTwoTone";
import { PiSeatDuotone } from "react-icons/pi";
import AcUnitTwoToneIcon from "@mui/icons-material/AcUnitTwoTone";
import AirlineSeatLegroomReducedTwoToneIcon from "@mui/icons-material/AirlineSeatLegroomReducedTwoTone";
import AirlineSeatIndividualSuiteRoundedIcon from "@mui/icons-material/AirlineSeatIndividualSuiteRounded";
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
  console.log(reservationDetails, "ppppp");
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
  }, [formData.source, formData.destination, apiUrl]);
  const getCoachIcons = (coachName) => {
    switch (coachName.toLowerCase()) {
      case "sleeper":
        return (
          <AirlineSeatIndividualSuiteRoundedIcon
            fontSize="small"
            sx={{ color: "#00b0ff" }}
          />
        );
      case "ac tier 2":
        return (
          <>
            <PiSeatDuotone style={{ fontSize: "small", color: "#00b0ff" }} />
            <PiSeatDuotone style={{ fontSize: "small", color: "#00b0ff" }} />
            <AcUnitTwoToneIcon fontSize={"small"} sx={{ color: "#00b0ff" }} />
          </>
        );
      case "ac tier 3":
        return (
          <>
            <PiSeatDuotone style={{ fontSize: "small", color: "#00b0ff" }} />
            <PiSeatDuotone style={{ fontSize: "small", color: "#00b0ff" }} />
            <PiSeatDuotone style={{ fontSize: "small", color: "#00b0ff" }} />
            <AcUnitTwoToneIcon fontSize={"small"} sx={{ color: "#00b0ff" }} />
          </>
        );
      case "general":
        return (
          <AirlineSeatLegroomReducedTwoToneIcon
            fontSize={"small"}
            sx={{ color: "#00b0ff" }}
          />
        );
      default:
        return null;
    }
  };
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
  const handleReserve = () => {
    if (!user) {
      setSnackbarError("Please log in to reserve tickets.");
      setSnackbarOpen(true);
      return;
    }
    const outboundDetails = [];
    const returnDetails = [];
    outboundTrip.forEach((train, trainIndex) => {
      train.coaches.forEach((coach, coachIndex) => {
        const reservedSeats =
          selectedOutboundSeats[`${trainIndex}-${coachIndex}`] || 0;
        if (reservedSeats > 0) {
          outboundDetails.push({
            trainName: train.trainName,
            source: train.source,
            destination: train.destination,
            startTime: train.startTime,
            endTime: train.endTime,
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
            trainName: train.trainName,
            source: train.source,
            destination: train.destination,
            startTime: train.startTime,
            endTime: train.endTime,
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
        <AccordionSummary expandIcon={<ExpandCircleDownTwoToneIcon />}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              width: "100%",
              gap: 2,
              ml: 5,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#2196f3",
                fontWeight: "bold",
                textAlign: "center",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {train.trainName}
            </Typography>
            <span style={{ color: "red", marginLeft: "8px" }}>
              <DoubleArrowTwoToneIcon fontSize="small" />
            </span>
            <Typography
              variant="body1"
              sx={{
                color: "#76ff03",
                textAlign: "center",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {train.source} -- {train.destination}
            </Typography>
            <span
              style={{
                color: "red",
                marginLeft: "8px",
                fontWeight: "bold",
              }}
            >
              <DoubleArrowTwoToneIcon fontSize="small" />
            </span>
            <Typography
              variant="body1"
              sx={{
                color: "orange",
                textAlign: "center",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              Duration : {""}
              {train.startTime} -- {train.endTime}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            sx={{
              border: "1px solid light#bdbdbd",
              borderRadius: "4px",
              padding: 2,
              mb: 2,
              backgroundColor: "#f9f9f9",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ color: "#2196f3", mr: 1 }}>
                Start Time: {train.startTime}
              </Typography>
              <Typography variant="body2" sx={{ color: "#2196f3" }}>
                | End Time: {train.endTime}{" "}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#76ff03", mt: 1 }}>
              Stops: {train.stops.join(", ")}
            </Typography>
            <Grid container spacing={2} mt={2}>
              {train.coaches.map((coach, coachIndex) => {
                const coachKey = `${trainIndex}-${coachIndex}`;
                return (
                  <Grid
                    item
                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    key={coachIndex}
                  >
                    <Box
                      sx={{
                        background: "linear-gradient(135deg, #d9f2ff, #f0f4ff)",
                        padding: { xs: 2, sm: 3 },
                        borderRadius: "12px",
                        height: "75%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #ccc",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: "1rem", sm: "1.2rem" },
                            fontWeight: 600,
                            color: "#00509e",
                          }}
                        >
                          {coach.coachName}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            alignItems: "center",
                          }}
                        >
                          {getCoachIcons(coach.coachName)}
                        </Box>
                      </Box>
                      <Typography variant="body2">
                        Seats Available: {coach.noOfSeatsAvailable}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: "0.85rem", sm: "1rem" },
                          fontWeight: 500,
                          color: "#333",
                          mt: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        Fare:{" "}
                        <CurrencyRupeeTwoToneIcon
                          fontSize="small"
                          sx={{ marginLeft: "4px" }}
                        />{" "}
                        {coach.fare}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 2,
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
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
                          sx={{
                            minWidth: "40px",
                            borderRadius: "50%",
                            border: "1px solid #f44336",
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </Button>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "1rem", sm: "1.1rem" },
                            color: "#00509e",
                          }}
                        >
                          {isReturn
                            ? selectedReturnSeats[coachKey] || 0
                            : selectedOutboundSeats[coachKey] || 0}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
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
                          sx={{
                            minWidth: "40px",
                            borderRadius: "50%",
                            color: "#00e676",
                            border: "1px solid #00e676",
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
    ));
  };
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            background: "linear-gradient(to right, black, red, black)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
            margin: 0,
          }}
        >
          Available Buses from {formData.source} to {formData.destination}
        </Typography>
      </Box>
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
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "12px",
            padding: "16px",
            background: "linear-gradient(135deg, #fefefe, #f5f5f5)",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
            maxWidth: "600px",
            border: "2px dashed #00509e",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.5rem",
            color: "#00509e",
            borderBottom: "1px solid #ddd",
            paddingBottom: "8px",
            mb: 2,
          }}
        >
          Confirm Ticket
        </DialogTitle>
        <DialogContent>
          {reservationDetails &&
            reservationDetails.outboundDetails?.length > 0 && (
              <>
                <Typography
                  variant="h6"
                  sx={{ textAlign: "center", fontWeight: "600", mb: 1 }}
                >
                  Outbound Trip
                </Typography>
                {reservationDetails.outboundDetails.map((trip, index) => (
                  <Box
                    key={index}
                    sx={{ padding: "8px 0", borderBottom: "1px solid #eee" }}
                  >
                    <Typography sx={{ fontWeight: "bold", color: "#333" }}>
                      Train: {trip.trainName} ({trip.source} →{" "}
                      {trip.destination})
                    </Typography>
                    <Typography sx={{ color: "#666" }}>
                      Departure: {trip.startTime} | Arrival: {trip.endTime}
                    </Typography>
                    <Typography sx={{ color: "#333" }}>
                      Coach: {trip.coachName}, Seats: {trip.reservedSeats},
                      Total Fare: ₹{trip.total}
                    </Typography>
                  </Box>
                ))}
              </>
            )}
          {reservationDetails &&
            reservationDetails.returnDetails?.length > 0 && (
              <>
                <Typography
                  variant="h6"
                  sx={{ textAlign: "center", fontWeight: "600", mb: 1 }}
                >
                  Return Trip
                </Typography>
                {reservationDetails.returnDetails.map((trip, index) => (
                  <Box
                    key={index}
                    sx={{ padding: "8px 0", borderBottom: "1px solid #eee" }}
                  >
                    <Typography sx={{ fontWeight: "bold", color: "#333" }}>
                      Train: {trip.trainName} ({trip.source} →{" "}
                      {trip.destination})
                    </Typography>
                    <Typography sx={{ color: "#666" }}>
                      Departure: {trip.startTime} | Arrival: {trip.endTime}
                    </Typography>
                    <Typography sx={{ color: "#333" }}>
                      Coach: {trip.coachName}, Seats: {trip.reservedSeats},
                      Total Fare: ₹{trip.total}
                    </Typography>
                  </Box>
                ))}
              </>
            )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
          <Button
            onClick={() => setModalOpen(false)}
            sx={{
              backgroundColor: "#f44336",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#d32f2f",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmReservation}
            sx={{
              backgroundColor: "#4caf50",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#388e3c",
              },
            }}
          >
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
