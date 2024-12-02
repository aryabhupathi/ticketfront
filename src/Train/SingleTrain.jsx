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
import { useAuth } from "../authContext";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DoubleArrowTwoToneIcon from "@mui/icons-material/DoubleArrowTwoTone";
import ExpandCircleDownTwoToneIcon from "@mui/icons-material/ExpandCircleDownTwoTone";
import CurrencyRupeeTwoToneIcon from "@mui/icons-material/CurrencyRupeeTwoTone";
import { PiSeatDuotone } from "react-icons/pi";
import AcUnitTwoToneIcon from "@mui/icons-material/AcUnitTwoTone";
import AirlineSeatLegroomReducedTwoToneIcon from "@mui/icons-material/AirlineSeatLegroomReducedTwoTone";
import AirlineSeatIndividualSuiteRoundedIcon from "@mui/icons-material/AirlineSeatIndividualSuiteRounded";
const SingleTrain = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { formData } = location.state;
  const apiUrl = process.env.REACT_APP_API_URL;
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
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const fetchTrainData = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/train/search?source=${formData.source}&destination=${formData.destination}`
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
  const handleAccordionChange = (index) => {
    setExpanded(expanded === index ? false : index);
    if (expanded === index) {
      handleTrainSelect(index);
    }
  };
  const handleTrainSelect = (trainIndex) => {
    const updatedSelectedSeats = { ...selectedSeats };
    Object.keys(updatedSelectedSeats).forEach((key) => {
      if (key.startsWith(trainIndex.toString())) {
        updatedSelectedSeats[key] = 0;
      }
    });
    setSelectedSeats(updatedSelectedSeats);
    setTotalFare(0);
    setReservationConfirmed(false);
  };
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
    setModalOpen(true);
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
    console.log("Starting reservation process...");
    const selectedTrain = reservationDetails.train;
    console.log("Selected Train:", selectedTrain);
    const updatedCoaches = selectedTrain.coaches
      .map((coach, coachIndex) => {
        const reservedSeats =
          selectedSeats[`${trip.indexOf(selectedTrain)}-${coachIndex}`];
        console.log(
          `Coach ${coach.coachName}: Reserved Seats = ${reservedSeats}`
        );
        return {
          coachName: coach.coachName,
          reservedSeats: reservedSeats > 0 ? reservedSeats : 0,
        };
      })
      .filter((coach) => coach.reservedSeats > 0);
    console.log("Updated Coaches (with reserved seats):", updatedCoaches);
    if (updatedCoaches.length === 0) {
      console.log("No seats to reserve.");
      setError("No seats to reserve.");
      return;
    }
    try {
      console.log("Sending request to update seats...");
      const response = await fetch(`${apiUrl}/api/train/update-train-seats`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trainId: selectedTrain._id,
          updatedCoaches: updatedCoaches,
        }),
      });
      if (!response.ok) {
        console.error("API Response Error:", response);
        throw new Error("Error reserving seats");
      }
      const result = await response.json();
      console.log("Reservation result:", result);
      setReserveAlert(true);
      setTrip((prevTrip) => {
        const updatedTrip = [...prevTrip];
        const trainIndex = trip.indexOf(selectedTrain);
        updatedTrip[trainIndex].coaches.forEach((coach, coachIndex) => {
          const reservedSeats = selectedSeats[`${trainIndex}-${coachIndex}`];
          if (reservedSeats > 0) {
            console.log(
              `Updating seats for Coach ${coach.coachName}: ${reservedSeats} seats reserved.`
            );
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
        console.log("Updated Selected Seats after reservation:", updatedSeats);
        return updatedSeats;
      });
      setTotalFare(0);
      setModalOpen(false);
      setReservationConfirmed(true);
      console.log("Reservation confirmed successfully.");
    } catch (error) {
      console.error("Error during reservation:", error);
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
      <Accordion
        key={trainIndex}
        sx={{ width: "100%", height: "auto", mb: 2 }}
        expanded={expanded === trainIndex}
        onChange={() => handleAccordionChange(trainIndex)}
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
                      <Box>
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
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: { xs: "0.85rem", sm: "1rem" },
                            fontWeight: 500,
                            color: "#333",
                          }}
                        >
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
                      </Box>
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
                              -1
                            )
                          }
                          disabled={selectedSeats[coachKey] === 0}
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
          </Box>
        </AccordionDetails>
      </Accordion>
    ));
  };
  return (
    <Box container sx={{
      padding: 2,
      backgroundImage: "url(../../train12.webp)",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      minHeight: "100vh",}}>
      
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
          Available Trains from {formData.source} to {formData.destination}
        </Typography>
      </Box>
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
          {reservationDetails ? (
            <>
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "1.4rem",
                  color: "#00509e",
                  mb: 1,
                }}
              >
                {reservationDetails.train.trainName}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px dashed #ddd",
                  pb: 1,
                  mb: 2,
                }}
              >
                <Typography sx={{ fontWeight: 500, color: "#555" }}>
                  Source: <strong>{reservationDetails.train.source}</strong>
                </Typography>
                <Typography sx={{ fontWeight: 500, color: "#555" }}>
                  Destination:{" "}
                  <strong>{reservationDetails.train.destination}</strong>
                </Typography>
              </Box>
              <Typography sx={{ mb: 1, fontWeight: "bold", color: "#00509e" }}>
                Selected Coaches:
              </Typography>
              {reservationDetails.details.map((detail, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <Typography sx={{ fontWeight: 500, color: "#333" }}>
                    {detail.coachName}: {detail.reservedSeats} seats
                  </Typography>
                  <Typography sx={{ fontWeight: 500, color: "#ff5722" }}>
                    Total: ₹{detail.total}
                  </Typography>
                </Box>
              ))}
            </>
          ) : (
            <Typography>Loading...</Typography>
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
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message="Reservation successful!"
      />
    </Box>
  );
};
export default SingleTrain;
