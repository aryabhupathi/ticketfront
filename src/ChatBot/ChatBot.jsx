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
  const endOfMessagesRef = useRef(null); 
  useEffect(() => {
    setMessages([
      { text: "Hi there! Ask me something to get started.", sender: "bot" },
    ]);
  }, []);
  useEffect(() => {
    if (open) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => document.body.classList.remove("no-scroll"); 
  }, [open]);
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
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
    const responses = {
      hello: "Hello! How can I assist you with your ticket reservation?",
      "how to book a ticket":
        "You can book a ticket by selecting the event and choosing the number of tickets.",
      "what is the refund policy":
        "Tickets are refundable up to 24 hours before the event.",
      "thank you":
        "You're welcome! Let me know if you have any other questions.",
    };
    const normalizedInput = userInput.toLowerCase();
    return responses[normalizedInput] || "I'm sorry, I didn't understand that.";
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
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
        width: { xs: "80%", sm: 300 },
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
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
            onKeyPress={handleKeyPress}
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
