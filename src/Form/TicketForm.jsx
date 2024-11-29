import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TrainIcon from "@mui/icons-material/Train";
import FlightIcon from "@mui/icons-material/Flight";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { IoSwapVerticalOutline } from "react-icons/io5";
import { RiSwapBoxFill } from "react-icons/ri";
import Layout from "../Layout";
import Grid from "@mui/material/Grid2";
const TicketReservationForm = () => {
  const [formData, setFormData] = useState({
    transportType: "bus",
    tripType: "single",
    source: "",
    destination: "",
    departureDate: "",
    returnDate: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleTransportChange = (event, newValue) => {
    setFormData({
      ...formData,
      transportType: newValue,
    });
  };
  const handleTripTypeChange = (event, newValue) => {
    setFormData({
      ...formData,
      tripType: newValue,
      returnDate: "",
    });
  };
  const handleReverse = () => {
    setFormData((prev) => ({
      ...prev,
      source: prev.destination,
      destination: prev.source,
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.source ||
      !formData.destination ||
      !formData.departureDate ||
      (formData.tripType === "round" && !formData.returnDate)
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all fields.",
        severity: "error",
      });
      return;
    }
    const currentDate = new Date();
    const departureDate = new Date(formData.departureDate);
    const returnDate =
      formData.tripType === "round" ? new Date(formData.returnDate) : null;
    if (departureDate < currentDate.setHours(0, 0, 0, 0)) {
      setSnackbar({
        open: true,
        message: "Departure date must be in the future.",
        severity: "error",
      });
      return;
    }
    if (formData.tripType === "round" && returnDate <= departureDate) {
      setSnackbar({
        open: true,
        message: "Return date must be greater than departure date.",
        severity: "error",
      });
      return;
    }
    if (formData.transportType === "bus") {
      navigate("/results/bus", { state: { formData } });
    } else if (formData.transportType === "train") {
      navigate("/results/train", { state: { formData } });
    } else if (formData.transportType === "flight") {
      navigate("/results/flight", { state: { formData } });
    }
  };
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const today = new Date().toISOString().split("T")[0];
  return (
    <Layout>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          height: "86vh",
          position: "relative",
          backgroundImage: "url(../../home.webp)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
        mt={1}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#f7f3d7",
            border: "2px solid red",
            padding: 3,
            borderRadius: 2,
            boxShadow: 2,
            width: "90%",
            maxWidth: "600px",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              background:
                "linear-gradient(to right, violet, indigo, blue, green)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
              margin: 0,
            }}
          >
            Online Ticket Reservation
          </Typography>
          <form onSubmit={handleSubmit}>
            <Tabs
              value={formData.transportType}
              onChange={handleTransportChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 2, border: "1px solid #ccc", borderRadius: 1 }}
            >
              <Tab
                label={
                  <>
                    <DirectionsBusIcon
                      sx={{
                        color:
                          formData.transportType === "bus"
                            ? "green"
                            : "inherit",
                      }}
                    />
                    Bus
                  </>
                }
                value="bus"
              />
              <Tab
                label={
                  <>
                    <TrainIcon
                      sx={{
                        color:
                          formData.transportType === "train"
                            ? "green"
                            : "inherit",
                      }}
                    />
                    Train
                  </>
                }
                value="train"
              />
              <Tab
                label={
                  <>
                    <FlightIcon
                      sx={{
                        color:
                          formData.transportType === "flight"
                            ? "green"
                            : "inherit",
                      }}
                    />
                    Flight
                  </>
                }
                value="flight"
              />
            </Tabs>
            <Tabs
              value={formData.tripType}
              onChange={handleTripTypeChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 2, border: "1px solid #ccc", borderRadius: 1 }}
            >
              <Tab
                label={
                  <>
                    <ArrowUpwardIcon
                      sx={{
                        color:
                          formData.tripType === "single" ? "green" : "inherit",
                        fontSize: "1.5rem",
                      }}
                    />
                    Single Trip
                  </>
                }
                value="single"
              />
              <Tab
                label={
                  <>
                    <IoSwapVerticalOutline
                      style={{
                        color:
                          formData.tripType === "round" ? "green" : "inherit",
                        fontSize: "1.5rem",
                      }}
                    />
                    Round Trip
                  </>
                }
                value="round"
              />
            </Tabs>
            <Grid container spacing={2} alignItems="center">
              <Grid item size={{ xs: 12, sm: 5 }}>
                <TextField
                  fullWidth
                  label="Source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="Enter source city"
                  required
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 2 }} textAlign="center">
                <Button variant="contained" onClick={handleReverse} fullWidth>
                  <RiSwapBoxFill />
                </Button>
              </Grid>
              <Grid item size={{ xs: 12, sm: 5 }}>
                <TextField
                  fullWidth
                  label="Destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter destination city"
                  required
                />
              </Grid>
            </Grid>
            {formData.tripType === "round" ? (
              <Grid container spacing={2} sx={{ mt: 2, mb: 2 }}>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Departure Date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    inputProps={{ min: today }}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Return Date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    inputProps={{ min: formData.departureDate || today }}
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container sx={{ mt: 2, mb: 2 }}>
                <Grid item size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Departure Date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                    inputProps={{ min: today }}
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>
            )}
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Search
            </Button>
          </form>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={2000}
            onClose={handleSnackbarClose}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Grid>
    </Layout>
  );
};
export default TicketReservationForm;
