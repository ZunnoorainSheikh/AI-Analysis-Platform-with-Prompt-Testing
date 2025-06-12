import React, { useState } from 'react';
import { Container, Typography, Box, Button, Input, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['application/pdf', 'text/plain'];

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setError('');
    const selected = e.target.files[0];
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('Only PDF and TXT files are allowed.');
      setFile(null);
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError('File size must be less than 5MB.');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setError('');
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Upload successful! File ID: ${res.data.file_id}`);
      setFile(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Upload failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <ToastContainer />
      <Typography variant="h4" align="center" gutterBottom>
        Upload Document
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 3,
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          background: '#fafafa',
        }}
      >
        <Input
          type="file"
          inputProps={{ accept: '.pdf,.txt' }}
          onChange={handleFileChange}
          disabled={loading}
        />
        {file && (
          <Alert severity="info">
            {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading || !file}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </Box>
    </Container>
  );
};

export default UploadPage;
