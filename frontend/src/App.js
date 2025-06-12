import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import PromptTester from './pages/PromptTester';
import { Container, AppBar, Toolbar, Button, Typography } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Document AI Platform
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Upload
          </Button>
          <Button color="inherit" component={Link} to="/prompt">
            Prompt Tester
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/prompt" element={<PromptTester />} />
        </Routes>
      </Container>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
