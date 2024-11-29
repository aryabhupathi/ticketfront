// export default function RoundTicketStepper({
//   seatLayout,
//   seatCategories,
//   bookedSeats = [],
//   selectedFlight,
//   onTotalFare,
//   setSelectedSeats, // Prop from parent
//   onFinish,
// }) {
//   const [activeStep, setActiveStep] = useState(0);
//   const [localSelectedSeats, setLocalSelectedSeats] = useState([]); // Rename local state
//   const [selectedMeals, setSelectedMeals] = useState([]);
//   const [selectedBenefits, setSelectedBenefits] = useState([]);
//   const [selectedSeatSelections, setSelectedSeatSelections] = useState({});
//   const [totalFare, setTotalFare] = useState(0);
//   const [complete, setComplete] = useState(false);

//   const handleSeatSelect = (seat) => {
//     const isSelected = Object.values(selectedSeatSelections)
//       .flat()
//       .includes(seat);
//     const rowMatch = seat.match(/^(\d+)/);
//     const rowIndex = rowMatch ? parseInt(rowMatch[1], 10) : null;
//     const seatCategory =
//       rowIndex !== null
//         ? seatCategories.find((category) => category.rows.includes(rowIndex))
//         : null;
//     if (!seatCategory) return;
//     const farePerSeat = seatCategory.price;
//     setSelectedSeatSelections((prev) => {
//       const updatedSeats = isSelected
//         ? Object.entries(prev).reduce((acc, [key, seats]) => {
//             const filteredSeats = seats.filter((s) => s !== seat);
//             if (filteredSeats.length > 0) {
//               acc[key] = filteredSeats; // Keep non-empty arrays
//             }
//             return acc;
//           }, {})
//         : {
//             ...prev,
//             [farePerSeat]: [...(prev[farePerSeat] || []), seat],
//           };
//       const seatFare = Object.entries(updatedSeats).reduce(
//         (total, [price, seats]) => total + price * seats.length,
//         0
//       );
//       const totalFare = seatFare + calculateMealAndBenefitFare();
//       setTotalFare(totalFare);
//       onTotalFare(totalFare); // Pass to parent
//       setSelectedSeats((prev) => ({
//         ...prev,
//         [selectedFlight._id]: Object.values(updatedSeats).flat(),
//       }));
//       return updatedSeats;
//     });
//   };
//   const handleNext = () => {
//     setActiveStep((prev) => prev + 1);
//   };
//   const handleBack = () => {
//     setActiveStep((prev) => prev - 1);
//   };
//   const handleReset = () => {
//     setActiveStep(0);
//     setSelectedSeats([]);
//     setSelectedMeals([]);
//     setSelectedBenefits([]);
//   };
//   const getSeatBorderColor = (seat) => {
//     const seatLabel = typeof seat === "string" ? seat : seat.label;
//     const rowIndex = parseInt(seatLabel.match(/\d+/)[0]);
//     const category = seatCategories.find((cat) => cat.rows.includes(rowIndex));
//     switch (category?.name) {
//       case "Business":
//         return "red";
//       case "First Class":
//         return "yellow";
//       case "Economy":
//         return "blue";
//       default:
//         return "gray";
//     }
//   };
//   const renderSeats = () => {
//     const columnCount = seatLayout.seatConfiguration[0].length;
//     const transposedLayout = Array(columnCount)
//       .fill()
//       .map((_, colIndex) =>
//         seatLayout.seatConfiguration.map((row) => row[colIndex])
//       );
//     return (
//       <Grid container spacing={2}>
//         <Box
//           display="flex"
//           flexDirection="column"
//           mt={2}
//           sx={{ overflow: "scroll" }}
//         >
//           {transposedLayout.map((seatColumn, columnIndex) => (
//             <Box
//               key={columnIndex}
//               display="flex"
//               flexDirection="row"
//               justifyContent="space-between"
//               mb={2}
//               flexGrow={1}
//             >
//               {seatColumn.map((seat, rowIndex) => {
//                 const isSelected = Object.values(selectedSeatSelections)
//                   .flat()
//                   .includes(seat);
                // const isBooked =
                //   Array.isArray(bookedSeats) && bookedSeats.includes(seat);
//                 return (
//                   <Box
//                     key={rowIndex}
//                     textAlign="center"
//                     width="60px"
//                     height="40px"
//                     display="flex"
//                     alignItems="center"
//                     justifyContent="center"
//                     border={`1px solid ${getSeatBorderColor(seat)}`}
//                     onClick={() => handleSeatSelect(seat)}
//                     bgcolor={
//                       isSelected
//                         ? "lightgreen"
//                         : isBooked
//                         ? "lightgray"
//                         : "white"
//                     }
//                     sx={{
//                       cursor: isBooked ? "not-allowed" : "pointer",
//                       opacity: isBooked ? 0.5 : 1,
//                     }}
//                     mx={1}
//                     borderRadius={1}
//                   >
//                     {seat}
//                   </Box>
//                 );
//               })}
//             </Box>
//           ))}
//         </Box>
//       </Grid>
//     );
//   };
//   const renderMeals = () => {
//     return (
//       <Box>
//         {Meals.map((product) => (
//           <Box key={product.name}>
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={selectedMeals[product.name]}
//                   onChange={() => handleMealSelect(product.name, product.price)}
//                 />
//               }
//               label={`${product.name} - $${product.price}`}
//             />
//           </Box>
//         ))}
//       </Box>
//     );
//   };
//   const renderBenefits = () => {
//     return (
//       <Box>
//         {Benefits.map((product) => (
//           <Box key={product.name}>
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={selectedBenefits[product.name]}
//                   onChange={() =>
//                     handleBenefitSelect(product.name, product.price)
//                   }
//                 />
//               }
//               label={`${product.name} - $${product.price}`}
//             />
//           </Box>
//         ))}
//       </Box>
//     );
//   };
//   const handleMealSelect = (product) => {
//     setSelectedMeals((prev) => {
//       const updatedMeals = prev.includes(product)
//         ? prev.filter((item) => item !== product) // Remove if selected
//         : [...prev, product]; // Add if not selected
//       const totalFare = calculateMealAndBenefitFare() + calculateSeatFare();
//       setTotalFare(totalFare);
//       onTotalFare(totalFare); // Pass to parent
//       return updatedMeals;
//     });
//   };
//   const handleBenefitSelect = (product) => {
//     setSelectedBenefits((prev) => {
//       const updatedBenefits = prev.includes(product)
//         ? prev.filter((item) => item !== product) // Remove if selected
//         : [...prev, product]; // Add if not selected
//       const totalFare = calculateMealAndBenefitFare() + calculateSeatFare();
//       setTotalFare(totalFare);
//       onTotalFare(totalFare); // Pass to parent
//       return updatedBenefits;
//     });
//   };
//   const calculateMealAndBenefitFare = () => {
//     const mealsFare = selectedMeals.reduce((total, mealName) => {
//       const meal = Meals.find((m) => m.name === mealName);
//       return total + (meal ? meal.price : 0);
//     }, 0);
//     const benefitsFare = selectedBenefits.reduce((total, benefitName) => {
//       const benefit = Benefits.find((b) => b.name === benefitName);
//       return total + (benefit ? benefit.price : 0);
//     }, 0);
//     return mealsFare + benefitsFare;
//   };
//   const calculateSeatFare = () => {
//     return Object.entries(selectedSeatSelections).reduce(
//       (total, [price, seats]) => total + price * seats.length,
//       0
//     );
//   };
//   const renderStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return (
//           <Box>
//             <Typography>Select your seats</Typography>
//             {renderSeats()}
//           </Box>
//         );
//       case 1:
//         return (
//           <Box>
//             <Typography>Select your meals</Typography>
//             {renderMeals()}
//           </Box>
//         );
//       case 2:
//         return (
//           <Box>
//             <Typography>Select additional services</Typography>
//             {renderBenefits()}
//           </Box>
//         );
//       case 3:
//         const allSelectedSeats = Object.values(localSelectedSeats).flat();
//         return (
//           <Box>
//             <Typography>Review Your Selections:</Typography>
//             <Typography>Seats: {allSelectedSeats.join(", ")}</Typography>
//             <Typography>Meals: {selectedMeals.join(", ")}</Typography>
//             <Typography>Additionals: {selectedBenefits.join(", ")}</Typography>
//             {totalFare}
//           </Box>
//         );
//       default:
//         return "Unknown step";
//     }
//   };
//   return (
//     <Stack sx={{ width: "100%" }} spacing={4}>
//       <Stepper
//         alternativeLabel
//         activeStep={activeStep}
//         connector={<ColorlibConnector />}
//       >
//         {steps.map((label) => (
//           <Step key={label}>
//             <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
//           </Step>
//         ))}
//       </Stepper>
//       <Box sx={{ p: 3 }}>
//         {activeStep === steps.length ? (
//           <Box>
//             <Button onClick={handleReset}>Reset</Button>
//           </Box>
//         ) : (
//           <Box>
//             {renderStepContent(activeStep)}
//             <Box sx={{ mt: 2 }}>
//               <Button
//                 disabled={activeStep === 0}
//                 onClick={handleBack}
//                 sx={{ mr: 1 }}
//               >
//                 Back
//               </Button>
//               <Button
//   variant="contained"
//   onClick={() => {
//     handleNext(); // Handle the next step
//     if (activeStep === steps.length - 1) {
//       onFinish(); // Notify the parent that the process is finished
//     }
//   }}
// >
//   {activeStep === steps.length - 1 ? "Finish" : "Next"}
// </Button>
//             </Box>
//           </Box>
//         )}
//       </Box>
//     </Stack>
//   );
// }