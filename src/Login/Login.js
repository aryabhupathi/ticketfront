import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Card,
} from "@mui/material";
const Login = ({ toggleSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsNewUser(false);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (err.message.includes("User not found")) {
        setIsNewUser(true);
        setError("User not found, please sign up.");
      } else if (err.message.includes("Invalid credentials")) {
        setError("Invalid credentials, please try again.");
      } else {
        setError(err.message || "Login failed");
      }
      console.error("Login failed:", err);
    }
  };
  const handleSignup = () => {
    navigate("/signup");
  };
  const handleResetPassword = () => {
    navigate("/forgot-password");
  };
  return (
    <Container maxWidth="lg">
      <Card
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          p: 2,
          marginTop: 5,
          width: "90%",
        }}
      >
        <Box sx={{ flex: 1, p: 2 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleLogin}>
            <Box mb={2}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Box>
            <Box mb={2}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            {isNewUser && (
              <Alert severity="info">New user detected! Please sign up.</Alert>
            )}
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </form>
          <Box mt={2}>
            <Button
              variant="text"
              color="secondary"
              onClick={isNewUser ? handleSignup : handleResetPassword}
              fullWidth
            >
              {isNewUser ? "Go to Signup" : "Forgot Password?"}
            </Button>
          </Box>
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              Don't have an account?{" "}
              <Button variant="text" color="primary" onClick={toggleSignup}>
                Sign up
              </Button>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};
export default Login;
