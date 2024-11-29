/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  styled,
  StepConnector,
  stepConnectorClasses,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import PropTypes from "prop-types";
import FlightClassIcon from "@mui/icons-material/FlightClass";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import AccessibleIcon from "@mui/icons-material/Accessible";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import AirlineSeatReclineExtraIcon from "@mui/icons-material/AirlineSeatReclineExtra";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import DinnerDiningIcon from "@mui/icons-material/DinnerDining";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";
import GradeIcon from "@mui/icons-material/Grade";
import LuggageIcon from "@mui/icons-material/Luggage";
import WheelchairPickupIcon from "@mui/icons-material/WheelchairPickup";
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient(95deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient(95deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: "#eaeaf0",
    borderRadius: 1,
  },
}));
const ColorlibStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  backgroundColor: "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && {
    backgroundImage:
      "linear-gradient(136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
    boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
  }),
  ...(ownerState.completed && {
    backgroundImage:
      "linear-gradient(136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
  }),
}));
function ColorlibStepIcon(props) {
  const { active, completed, className } = props;
  const icons = {
    1: <FlightClassIcon />,
    2: <FastfoodIcon />,
    3: <AccessibleIcon />,
    4: <AirplaneTicketIcon />,
  };
  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}
ColorlibStepIcon.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
  completed: PropTypes.bool,
  icon: PropTypes.node,
};
const steps = ["Select Seats", "Select Meals", "Select Additionals", "Review"];
const Meals = [
  { name: "Drinks", price: 50, icon: <LocalBarIcon /> },
  { name: "Sweets & savoury", price: 70, icon: <BakeryDiningIcon /> },
  { name: "Full Meals", price: 120, icon: <DinnerDiningIcon /> },
];
const Benefits = [
  { name: "Priority", price: 250, icon: <GradeIcon /> },
  { name: "Extra Luggage", price: 350, icon: <LuggageIcon /> },
  { name: "Personal Assistance", price: 500, icon: <WheelchairPickupIcon /> },
];
export default function RoundTicketStepper({
  seatLayout,
  seatCategories,
  tripType,
  onSeatsChange,
  onFinish,
  onTotalFareChange,
  outboundBookedSeats,
  returnBookedSeats,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [seats, setSeats] = useState([]);
  const [seatFare, setSeatFare] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState(false);
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  const handleNext = () => {
    if (seats.length === 0) {
      return;
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };
  const handleFinish = () => {
    const tripData = {
      seats,
      meals: selectedMeals,
      benefits: selectedBenefits,
      totalFare: calculateTotal(),
      tripType,
    };
    onFinish(tripData);
  };
  const handleSeatClick = (seat) => {
    const isBooked =
      tripType === "outbound"
        ? outboundBookedSeats.includes(seat)
        : returnBookedSeats.includes(seat);
    setSelectedSeat(true);
    if (isBooked) return;
    setSeats((prev) => {
      const updatedSeats = prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat];
      onSeatsChange(updatedSeats, tripType);
      const newSeatFare = updatedSeats.reduce((total, selectedSeat) => {
        const seatLabel =
          typeof selectedSeat === "string" ? selectedSeat : selectedSeat.label;
        const rowIndex = parseInt(seatLabel.match(/\d+/)[0]);
        const category = seatCategories.find((cat) =>
          cat.rows?.includes(rowIndex)
        );
        return total + (category ? category.price : 0);
      }, 0);
      setSeatFare(newSeatFare);
      const totalFare = newSeatFare + calculateTotal();
      onTotalFareChange(totalFare, tripType);
      return updatedSeats;
    });
  };
  const getSeatBorderColor = (seat) => {
    const seatLabel = typeof seat === "string" ? seat : seat.label;
    const rowIndex = parseInt(seatLabel.match(/\d+/)[0]);
    const category = seatCategories.find((cat) => cat.rows?.includes(rowIndex));
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
  const calculateTotal = () => {
    const mealTotal = selectedMeals.reduce(
      (total, meal) => total + Meals.find((item) => item.name === meal).price,
      0
    );
    const benefitTotal = selectedBenefits.reduce(
      (total, benefit) =>
        total + Benefits.find((item) => item.name === benefit).price,
      0
    );
    return mealTotal + benefitTotal + seatFare;
  };
  const handleMeal = (mealName) => {
    setSelectedMeals((prev) =>
      prev.includes(mealName)
        ? prev.filter((meal) => meal !== mealName)
        : [...prev, mealName]
    );
  };
  const handleBenefit = (benefitName) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefitName)
        ? prev.filter((benefit) => benefit !== benefitName)
        : [...prev, benefitName]
    );
  };
  const renderSeats = () => {
    const columnCount = seatLayout.seatConfiguration[0].length;
    const transposedLayout = Array(columnCount)
      .fill()
      .map((_, colIndex) =>
        seatLayout.seatConfiguration.map((row) => row[colIndex])
      );
    return (
      <Grid container justifyContent="center" spacing={2}>
        <Box
          display="flex"
          flexDirection="row"
          mt={2}
          padding={2}
          mb={2}
          sx={{
            overflowX: "auto",
            overflowY: "hidden",
            columnGap: { xs: "8px", sm: "12px", md: "16px" },
          }}
        >
          {transposedLayout.map((seatColumn, columnIndex) => (
            <Box
              key={columnIndex}
              flexDirection="row"
              columnGap={{ xs: "8px", sm: "12px", md: "16px" }}
              mb={2}
            >
              {seatColumn.map((seat) => {
                const isBooked =
                  tripType === "outbound"
                    ? outboundBookedSeats.includes(seat)
                    : returnBookedSeats.includes(seat);
                return (
                  <Box
                    key={seat}
                    mb={2}
                    sx={{
                      width: { xs: "45px", sm: "55px", md: "65px" },
                      height: { xs: "45px", sm: "55px", md: "65px" },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${getSeatBorderColor(seat)}`,
                      bgcolor: seats.includes(seat)
                        ? "lightgreen"
                        : isBooked
                        ? "lightgray"
                        : "white",
                      pointerEvents: isBooked ? "none" : "auto",
                      cursor: isBooked ? "not-allowed" : "pointer",
                      color: isBooked ? "gray" : "black",
                      transition: "transform 0.2s",
                      borderRadius: "8px",
                      "&:hover": {
                        transform: !isBooked ? "scale(1.1)" : "none",
                      },
                    }}
                    onClick={() => !isBooked && handleSeatClick(seat)}
                  >
                    <AirlineSeatReclineExtraIcon
                      fontSize="small"
                      sx={{
                        color: getSeatBorderColor(seat),
                        marginRight: "4px",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" },
                      }}
                    >
                      {seat}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Grid>
    );
  };
  const renderMeals = () => {
    return (
      <Grid
        size={12}
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" paddingBottom={"6px"}>
          Refreshments
        </Typography>
        {Meals.map((meal) => (
          <FormControlLabel
            key={meal.name}
            control={
              <Checkbox
                checked={selectedMeals.includes(meal.name)}
                onChange={() => handleMeal(meal.name)}
              />
            }
            label={
              <Grid container alignItems="center" spacing={1}>
                <Grid item>{meal.icon}</Grid>
                <Grid item>
                  {meal.name}
                  <Typography
                    sx={{ textDecoration: "underline", display: "inline" }}
                  >
                    ({meal.price} INR)
                  </Typography>
                </Grid>
              </Grid>
            }
          />
        ))}
      </Grid>
    );
  };
  const renderBenefits = () => {
    return (
      <Grid
        size={12}
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" paddingBottom={"6px"}>
          Benefits
        </Typography>
        {Benefits.map((benefit) => (
          <FormControlLabel
            key={benefit.name}
            control={
              <Checkbox
                checked={selectedBenefits.includes(benefit.name)}
                onChange={() => handleBenefit(benefit.name)}
              />
            }
            label={
              <Grid container alignItems="center" spacing={1}>
                <Grid item>{benefit.icon}</Grid>
                <Grid item>
                  {benefit.name}
                  <Typography
                    sx={{ textDecoration: "underline", display: "inline" }}
                  >
                    ({benefit.price} INR)
                  </Typography>
                </Grid>
              </Grid>
            }
          />
        ))}
        ;
      </Grid>
    );
  };
  const total = calculateTotal();
  return (
    <Box>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<ColorlibConnector />}
      >
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box>
        {activeStep === 0 && renderSeats()}
        {activeStep === 1 && renderMeals()}
        {activeStep === 2 && renderBenefits()}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6">Review Your Selections</Typography>
            <Typography>Seats: {seats.join(", ")}</Typography>
            <Typography>Meals: {selectedMeals.join(", ") || "None"}</Typography>
            <Typography>
              Benefits: {selectedBenefits.join(", ") || "None"}
            </Typography>
            <Typography>Total Fare: {calculateTotal()} USD</Typography>
          </Box>
        )}
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Button
          variant="contained"
          color="primary"
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" color="primary" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button variant="contained" color="secondary" onClick={handleFinish}>
            Finish
          </Button>
        )}
      </Box>
    </Box>
  );
}
