
// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   TextField,
//   Typography,
//   Paper,
//   List,
//   ListItem,
//   ListItemText,
//   Button,
// } from "@mui/material";
// import SendIcon from "@mui/icons-material/Send";

// const Chatbot = ({ open, onClose }) => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");

//   // Add a useEffect hook to display an initial message
//   useEffect(() => {
//     setMessages([
//       { text: "Hi there! Ask me something to get started.", sender: "bot" },
//     ]);
//   }, []);

//   // Add useEffect to manage scroll lock
//   useEffect(() => {
//     if (open) {
//       document.body.classList.add("no-scroll");
//     } else {
//       document.body.classList.remove("no-scroll");
//     }
//     return () => document.body.classList.remove("no-scroll"); // Cleanup on unmount
//   }, [open]);

//   const handleSend = () => {
//     if (input.trim()) {
//       setMessages([...messages, { text: input, sender: "user" }]);
//       setInput("");
//       // Simulate a response from the chatbot
//       setTimeout(() => {
//         const response = getResponse(input);
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { text: response, sender: "bot" },
//         ]);
//       }, 1000);
//     }
//   };

//   const getResponse = (userInput) => {
//     // Define your bot's responses
//     const responses = {
//       hello: "Hello! How can I assist you with your ticket reservation?",
//       "how to book a ticket":
//         "You can book a ticket by selecting the event and choosing the number of tickets.",
//       "what is the refund policy":
//         "Tickets are refundable up to 24 hours before the event.",
//       "thank you":
//         "You're welcome! Let me know if you have any other questions.",
//     };

//     // Normalize user input for matching
//     const normalizedInput = userInput.toLowerCase();
//     return responses[normalizedInput] || "I'm sorry, I didn't understand that.";
//   };

//   // New function to handle key presses
//   const handleKeyPress = (event) => {
//     if (event.key === "Enter") {
//       event.preventDefault(); // Prevents form submission
//       handleSend(); // Calls the send function
//     }
//   };

//   return (
//     <Box
//       sx={{
//         position: "fixed",
//         bottom: 80,
//         right: 20,
//         boxShadow: 3,
//         borderRadius: "8px",
//         overflow: "hidden",
//         width: { xs: "80%", sm: 300 }, // Full width on mobile, fixed width on larger screen
//         backgroundColor: "rgba(255, 255, 255, 0.9)", // Make background slightly transparent
//         backdropFilter: "blur(10px)", // Optional blur effect
//         zIndex: 1000, // Ensure it is on top
//       }}
//       open={open}
//       onClose={onClose}
//     >
//       <Paper elevation={3} sx={{ backgroundColor: "#b2edc6" }}>
//         <Box sx={{ padding: 2, maxHeight: 400, overflowY: "auto" }}>
//           <Typography variant="h6">Ask Me</Typography>
//           <List>
//             {messages.map((msg, index) => (
//               <ListItem key={index}>
//                 <ListItemText
//                   primary={msg.text}
//                   secondary={msg.sender === "user" ? "You" : "Bot"}
//                   sx={{ textAlign: msg.sender === "user" ? "right" : "left" }}
//                 />
//               </ListItem>
//             ))}
//           </List>
//         </Box>
//         <Box sx={{ display: "flex", padding: 1 }}>
//           <TextField
//             variant="outlined"
//             fullWidth
//             size="small"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyPress={handleKeyPress} // Add key press handler here
//             placeholder="Type a message..."
//           />
//           <Button
//             onClick={handleSend}
//             variant="contained"
//             size="small"
//             sx={{ ml: 1 }}
//           >
//             <SendIcon fontSize="small" />
//           </Button>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default Chatbot;


import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const Chatbot = ({ open, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef(null); // Ref to scroll to the last message

  // Add a useEffect hook to display an initial message
  useEffect(() => {
    setMessages([
      { text: "Hi there! Ask me something to get started.", sender: "bot" },
    ]);
  }, []);

  // Add useEffect to manage scroll lock
  useEffect(() => {
    if (open) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => document.body.classList.remove("no-scroll"); // Cleanup on unmount
  }, [open]);

  // Effect to scroll to the latest message
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // This will run every time messages change

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
      // Simulate a response from the chatbot
      setTimeout(() => {
        const response = getResponse(input);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: response, sender: "bot" },
        ]);
      }, 1000);
    }
  };

  const getResponse = (userInput) => {
    // Define your bot's responses
    const responses = {
      hello: "Hello! How can I assist you with your ticket reservation?",
      "how to book a ticket":
        "You can book a ticket by selecting the event and choosing the number of tickets.",
      "what is the refund policy":
        "Tickets are refundable up to 24 hours before the event.",
      "thank you":
        "You're welcome! Let me know if you have any other questions.",
    };

    // Normalize user input for matching
    const normalizedInput = userInput.toLowerCase();
    return responses[normalizedInput] || "I'm sorry, I didn't understand that.";
  };

  // New function to handle key presses
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevents form submission
      handleSend(); // Calls the send function
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 80,
        right: 20,
        boxShadow: 3,
        borderRadius: "8px",
        overflow: "hidden",
        width: { xs: "80%", sm: 300 }, // Full width on mobile, fixed width on larger screen
        backgroundColor: "rgba(255, 255, 255, 0.9)", // Make background slightly transparent
        backdropFilter: "blur(10px)", // Optional blur effect
        zIndex: 1000, // Ensure it is on top
      }}
      open={open}
      onClose={onClose}
    >
      <Paper elevation={3} sx={{ backgroundColor: "#b2edc6" }}>
        <Box sx={{ padding: 2, maxHeight: 400, overflowY: "auto" }}>
          <Typography variant="h6">Ask Me</Typography>
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={msg.text}
                  secondary={msg.sender === "user" ? "You" : "Bot"}
                  sx={{ textAlign: msg.sender === "user" ? "right" : "left" }}
                />
              </ListItem>
            ))}
            {/* Add an empty div as the scroll target */}
            <div ref={endOfMessagesRef} />
          </List>
        </Box>
        <Box sx={{ display: "flex", padding: 1 }}>
          <TextField
            variant="outlined"
            fullWidth
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress} // Add key press handler here
            placeholder="Type a message..."
          />
          <Button
            onClick={handleSend}
            variant="contained"
            size="small"
            sx={{ ml: 1 }}
          >
            <SendIcon fontSize="small" />
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chatbot;
