import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000); // Navigate to login after success
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (error) {
      setError('Server error.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={4}>
        <Typography variant="h4" align="center" gutterBottom>
          Reset Password
        </Typography>

        <form onSubmit={handleSubmit}>
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
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Box>

          <Box mb={2}>
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Reset Password
          </Button>
        </form>

        <Box mt={2}>
          <Button
            variant="text"
            color="secondary"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
