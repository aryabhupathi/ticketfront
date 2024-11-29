import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../authContext";
import {
  Typography,
  RadioGroup,
  FormControlLabel,
  Button,
  Box,
  TextField,
  Radio,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Signup = () => {
  const { signup, checkUserExists } = useContext(AuthContext); // Assume checkUserExists is provided by AuthContext
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState(""); // For user input
  const [captcha, setCaptcha] = useState("");
  const [enteredCaptcha, setEnteredCaptcha] = useState(""); // For user input
  const [signupMode, setSignupMode] = useState("Email"); // Default to "Email"
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // To toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userExists, setUserExists] = useState(false); // New state for user existence

  // Function to generate a random OTP (mock)
  const getOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    setOtp(newOtp);
    setOtpSent(true);
    setTimeout(() => {
      setOtpSent(false); // Change button back after 2 seconds
    }, 2000);
  };

  // Function to generate CAPTCHA (letters and numbers)
  const generateCaptcha = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newCaptcha = '';
    for (let i = 0; i < 6; i++) {
      newCaptcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCaptcha(newCaptcha);
  };

  // Generate CAPTCHA on component load
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;
    return re.test(password);
  };

  const validateMobile = (mobile) => {
    const re = /^[0-9]{10}$/; // Adjust according to the mobile format you want
    return re.test(mobile);
  };

  const validateUsername = (name) => {
    return name.length >= 3;
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    // Basic validations
    if (!validateUsername(name)) {
        setError("Username must be at least 3 characters long.");
        return;
    }

    if (signupMode === "Email") {
        if (!validateEmail(email)) {
            setError("Invalid email format.");
            return;
        }
    } else {
        if (!validateMobile(mobile)) {
            setError("Invalid mobile number format.");
            return;
        }
    }

    if (!validatePassword(password)) {
        setError("Password must be at least 5 characters long, and include a number, a capital letter, and a special character.");
        return;
    }

    if (enteredCaptcha !== captcha) {
        setError("Captcha does not match.");
        return;
    }

    // Check if the user exists based on signup mode
    const userExists = await checkUserExists(signupMode === "Email" ? email : null, signupMode === "Mobile" ? mobile : null);
    if (userExists) {
        setError("User already exists. Please reset your password.");
        setUserExists(true);
        return;
    }

    // Proceed with signup
    if (signupMode === "Email") {
        await signup(name, email, password);
    } else {
        await signup(name, mobile, password);
    }

    setError(""); // Clear any errors after validation passes
};


  return (
    <Card sx={{ maxWidth: 500, margin: "auto", marginTop: 4, padding: 2 }}>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom>
          Sign Up
        </Typography>
        <RadioGroup
          row
          aria-labelledby="signup-mode"
          name="signup-mode"
          value={signupMode}
          onChange={(e) => setSignupMode(e.target.value)}
        >
          <FormControlLabel value="Email" control={<Radio />} label="Email" />
          <FormControlLabel value="Mobile" control={<Radio />} label="Mobile" />
        </RadioGroup>

        <TextField
          fullWidth
          margin="normal"
          variant="outlined"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {signupMode === "Email" ? (
          <>
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box display="flex" alignItems="center" marginY={2}>
              <TextField
                margin="normal"
                variant="outlined"
                label="Enter Captcha"
                value={enteredCaptcha}
                onChange={(e) => setEnteredCaptcha(e.target.value)}
                required
                autoComplete="off"
              />
              <Box
                marginLeft={2}
                padding={1}
                border="1px solid #ccc"
                display="inline-block"
              >
                <Typography variant="h6">{captcha}</Typography>
              </Box>
              <Button
                onClick={generateCaptcha}
                variant="outlined"
                sx={{ marginLeft: 2 }}
              >
                Reset Captcha
              </Button>
            </Box>
          </>
        ) : (
          <>
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              label="Mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button onClick={getOtp} variant="contained" disabled={otpSent}>
              {otpSent ? "Resend OTP" : "Get OTP"}
            </Button>

            {otp && <Typography variant="body1">Your OTP is: {otp}</Typography>}

            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              label="Enter OTP"
              type="text"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              required
            />
          </>
        )}

        {error && <Typography color="error">{error}</Typography>}
      </CardContent>
      <CardActions>
        <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleSubmit}>
          {userExists ? "Reset Password" : "Sign Up"}
        </Button>
      </CardActions>
    </Card>
  );
};

export default Signup;
