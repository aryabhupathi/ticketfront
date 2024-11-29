// import React from 'react';
// import { useLocation } from 'react-router-dom';
// import { Box, Typography } from '@mui/material';
// import { bus, train, flight } from '../data'; // Import your data

// const SearchResults = () => {
//   const location = useLocation();
//   const { formData } = location.state; // Get form data from the state

//   // Function to find matching transport details
//   const findTransportDetails = () => {
//     let details = null;

//     // Check based on transport type
//     switch (formData.transportType) {
//       case 'bus':
//         if (bus.source === formData.source && bus.destination === formData.destination) {
//           details = bus;
//         }
//         break;
//       case 'train':
//         if (train.source === formData.source && train.destination === formData.destination) {
//           details = train;
//         }
//         break;
//       case 'flight':
//         if (flight.source === formData.source && flight.destination === formData.destination) {
//           details = flight;
//         }
//         break;
//       default:
//         break;
//     }

//     return details;
//   };

//   const transportDetails = findTransportDetails();

//   return (
//     <Box sx={{ padding: 3 }}>
//       <Typography variant="h4" gutterBottom>
//         Search Results
//       </Typography>

//       {transportDetails ? (
//         <Box>
//           <Typography variant="h6">Transport Type: {formData.transportType}</Typography>
//           <Typography variant="body1">Source: {formData.source}</Typography>
//           <Typography variant="body1">Destination: {formData.destination}</Typography>
//           <Typography variant="body1">Departure Date: {formData.departureDate}</Typography>
//           {formData.tripType === 'round' && (
//             <Typography variant="body1">Return Date: {formData.returnDate}</Typography>
//           )}
//           <Typography variant="body1">Number of Passengers: {formData.passengers}</Typography>

//           {/* Display specific details based on transport type */}
//           {formData.transportType === 'bus' && (
//             <Box>
//               <Typography variant="h6">Bus Details:</Typography>
//               <Typography>Bus Name: {transportDetails.busName}</Typography>
//               <Typography>Stops: {transportDetails.stops.join(', ')}</Typography>
//               <Typography>Fare: ${transportDetails.fare}</Typography>
//               <Typography>Seats Available: {transportDetails.noOfSeatsAvailable}</Typography>
//             </Box>
//           )}
//           {formData.transportType === 'train' && (
//             <Box>
//               <Typography variant="h6">Train Details:</Typography>
//               <Typography>Train Name: {transportDetails.trainName}</Typography>
//               <Typography>Stops: {transportDetails.stops.join(', ')}</Typography>
//               <Typography>Available Coaches:</Typography>
//               {transportDetails.coaches.map((coach) => (
//                 <Typography key={coach.coachName}>
//                   {coach.coachName} - Seats Available: {coach.noOfSeatsAvailable}, Fare: ${coach.fare}
//                 </Typography>
//               ))}
//             </Box>
//           )}
//           {formData.transportType === 'flight' && (
//             <Box>
//               <Typography variant="h6">Flight Details:</Typography>
//               <Typography>Flight Name: {transportDetails.flightName}</Typography>
//               <Typography>Stops: {transportDetails.stops.join(', ')}</Typography>
//               <Typography>Available Categories:</Typography>
//               {transportDetails.categories.map((category) => (
//                 <Typography key={category.categoryName}>
//                   {category.categoryName} - Seats Available: {category.noOfSeatsAvailable}, Fare: ${category.fare}
//                 </Typography>
//               ))}
//             </Box>
//           )}
//         </Box>
//       ) : (
//         <Typography variant="body1">No transport details found for the selected route.</Typography>
//       )}
//     </Box>
//   );
// };

// export default SearchResults;


import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { bus, train, flight } from '../data'; // Import your transport data

const SearchResults = () => {
  const location = useLocation();
  const { formData } = location.state; // Retrieve form data from the state

  // Function to find matching transport details
  const findTransportDetails = () => {
    let details = null;

    // Check based on transport type
    switch (formData.transportType) {
      case 'bus':
        if (bus.source === formData.source && bus.destination === formData.destination) {
          details = bus;
        }
        break;
      case 'train':
        if (train.source === formData.source && train.destination === formData.destination) {
          details = train;
        }
        break;
      case 'flight':
        if (flight.source === formData.source && flight.destination === formData.destination) {
          details = flight;
        }
        break;
      default:
        break;
    }

    return details;
  };

  const transportDetails = findTransportDetails();

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Search Results
      </Typography>

      {transportDetails ? (
        <Box>
          <Typography variant="body1">Source: {formData.source}</Typography>
          <Typography variant="body1">Destination: {formData.destination}</Typography>
          <Typography variant="body1">Departure Date: {formData.departureDate}</Typography>
          {formData.tripType === 'round' && (
            <Typography variant="body1">Return Date: {formData.returnDate}</Typography>
          )}
          <Typography variant="body1">Number of Passengers: {formData.passengers}</Typography>

          {/* Display specific details based on transport type */}
          {formData.transportType === 'bus' && (
            <Box>
              <Typography variant="h6">Bus Details:</Typography>
              <Typography>Bus Name: {transportDetails.busName}</Typography>
              <Typography>Stops: {transportDetails.stops.join(', ')}</Typography>
              <Typography>Fare: ${transportDetails.fare}</Typography>
              <Typography>Seats Available: {transportDetails.noOfSeatsAvailable}</Typography>
            </Box>
          )}
          {formData.transportType === 'train' && (
            <Box>
              <Typography variant="h6">Train Details:</Typography>
              <Typography>Train Name: {transportDetails.trainName}</Typography>
              <Typography>Stops: {transportDetails.stops.join(', ')}</Typography>
              <Typography>Available Coaches:</Typography>
              {transportDetails.coaches.map((coach) => (
                <Typography key={coach.coachName}>
                  {coach.coachName} - Seats Available: {coach.noOfSeatsAvailable}, Fare: ${coach.fare}
                </Typography>
              ))}
            </Box>
          )}
          {formData.transportType === 'flight' && (
            <Box>
              <Typography variant="h6">Flight Details:</Typography>
              <Typography>Flight Name: {transportDetails.flightName}</Typography>
              <Typography>Stops: {transportDetails.stops.join(', ')}</Typography>
              <Typography>Available Categories:</Typography>
              {transportDetails.categories.map((category) => (
                <Typography key={category.categoryName}>
                  {category.categoryName} - Seats Available: {category.noOfSeatsAvailable}, Fare: ${category.fare}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Typography variant="body1">No transport details found for the selected route.</Typography>
      )}
    </Box>
  );
};

export default SearchResults;
