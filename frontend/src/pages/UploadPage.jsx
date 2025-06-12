import React, { useState } from 'react';
import { Container, Typography, Box, Button, Input, Alert, CircularProgress, Paper, Stack, Card } from '@mui/material';
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
      <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' }}>
        <Stack spacing={3}>
          <Typography variant="h3" align="center" fontWeight={700} color="primary.main" gutterBottom letterSpacing={1}>
            Upload Document
          </Typography>
          <Card elevation={2} sx={{ p: 3, borderRadius: 3, background: '#fff' }}>
            <Stack spacing={2}>
              <Input
                type="file"
                inputProps={{ accept: '.pdf,.txt' }}
                onChange={handleFileChange}
                disabled={loading}
                sx={{ borderRadius: 2, background: '#f8fafc', p: 1 }}
              />
              {file && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </Alert>
              )}
              {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={loading || !file}
                fullWidth
                size="large"
                sx={{ borderRadius: 2, fontWeight: 600, fontSize: 18, py: 1.5, boxShadow: 2, transition: '0.2s', ':hover': { boxShadow: 6 } }}
              >
                {loading ? <CircularProgress size={28} color="inherit" /> : 'Upload'}
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Paper>
    </Container>
  );
};

export default UploadPage;
