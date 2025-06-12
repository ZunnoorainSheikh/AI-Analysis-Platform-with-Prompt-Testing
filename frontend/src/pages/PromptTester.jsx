import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Card,
  CardContent,
  CardActions,
  Grid,
  CircularProgress,
  Snackbar,
  IconButton,
  Paper,
  Stack,
  Chip,
  Avatar,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import axios from '../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PromptEditor from '../PromptEditor';

const PromptTester = () => {
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [compareIds, setCompareIds] = useState([null, null]);

  // Fetch documents, templates, and analyses
  useEffect(() => {
    const fetchAll = async () => {
      setFetching(true);
      try {
        const [docsRes, tempsRes, analysesRes] = await Promise.all([
          axios.get('/documents'),
          axios.get('/prompt-templates'),
          axios.get('/analyses'),
        ]);
        setDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);
        setTemplates(Array.isArray(tempsRes.data) ? tempsRes.data : []);
        setAnalyses(Array.isArray(analysesRes.data) ? analysesRes.data : []);
      } catch (err) {
        toast.error('Failed to fetch initial data.');
        setDocuments([]);
        setTemplates([]);
        setAnalyses([]);
      } finally {
        setFetching(false);
      }
    };
    fetchAll();
  }, []);

  // Autofill prompt when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      setPrompt(template ? template.content : '');
    }
  }, [selectedTemplate, templates]);

  const handleRunAnalysis = async () => {
    if (!selectedDoc || !prompt.trim()) {
      setSnackbar({ open: true, message: 'Select a document and enter a prompt.', severity: 'error' });
      return;
    }
    setLoading(true);
    setResponse(null);
    try {
      const res = await axios.post('/analyze', {
        document_id: selectedDoc,
        prompt,
      });
      setResponse(res.data);
      toast.success('Analysis complete!');
      // Optionally refresh analyses
      const analysesRes = await axios.get('/analyses');
      setAnalyses(analysesRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      toast.info('Copied to clipboard!');
    }
  };

  const handleExport = (type) => {
    if (!response) return;
    let dataStr, fileName;
    if (type === 'json') {
      dataStr = JSON.stringify(response, null, 2);
      fileName = 'analysis.json';
    } else {
      // Markdown export: simple conversion
      dataStr = `# Analysis Result\n\n\`\`\`json\n${JSON.stringify(response, null, 2)}\n\`\`\``;
      fileName = 'analysis.md';
    }
    const blob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Compare two analyses side by side
  const compareAnalyses = () => {
    if (!compareIds[0] || !compareIds[1]) return null;
    const a1 = analyses.find(a => a.id === compareIds[0]);
    const a2 = analyses.find(a => a.id === compareIds[1]);
    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1">Analysis 1</Typography>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(a1?.response, null, 2)}</pre>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1">Analysis 2</Typography>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(a2?.response, null, 2)}</pre>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <ToastContainer />
      <div className="glass-card prompt-tester-main">
        <Stack spacing={3}>
          <Typography variant="h3" align="center" fontWeight={700} color="primary.main" gutterBottom letterSpacing={1} className="prompt-tester-title">
            <Chip label="Prompt Tester" color="primary" avatar={<Avatar>P</Avatar>} sx={{ fontWeight: 700, fontSize: 20, mb: 1 }} />
          </Typography>
          {fetching ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress size={40} color="primary" />
            </Box>
          ) : (
            <Stack spacing={4}>
              <div className="glass-section">
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="doc-label">Document</InputLabel>
                      <Select
                        labelId="doc-label"
                        value={selectedDoc}
                        label="Document"
                        onChange={e => setSelectedDoc(e.target.value)}
                        sx={{ borderRadius: 2, fontWeight: 500 }}
                      >
                        {documents.map(doc => (
                          <MenuItem key={doc.id} value={doc.id}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.light' }}>{doc.name?.[0]?.toUpperCase()}</Avatar>
                            {doc.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="template-label">Prompt Template</InputLabel>
                      <Select
                        labelId="template-label"
                        value={selectedTemplate}
                        label="Prompt Template"
                        onChange={e => setSelectedTemplate(e.target.value)}
                        sx={{ borderRadius: 2, fontWeight: 500 }}
                      >
                        <MenuItem value="">Custom</MenuItem>
                        {templates.map(t => (
                          <MenuItem key={t.id} value={t.id}>
                            <Chip label={t.name} color="secondary" size="small" sx={{ mr: 1 }} />
                            {t.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <PromptEditor value={prompt} onChange={e => setPrompt(e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleRunAnalysis}
                      disabled={loading}
                      fullWidth
                      size="large"
                      className="btn-animate"
                    >
                      {loading ? <CircularProgress size={28} color="inherit" /> : 'Run Analysis'}
                    </Button>
                  </Grid>
                </Grid>
              </div>

              {response && (
                <div className="glass-section glass-response">
                  <CardContent>
                    <Typography variant="h5" fontWeight={600} color="primary.dark" gutterBottom>
                      Gemini Response
                    </Typography>
                    <Box sx={{ background: '#fff', borderRadius: 2, p: 2, boxShadow: 1 }}>
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontSize: 16 }}>{JSON.stringify(response, null, 2)}</pre>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', gap: 2 }}>
                    <Button startIcon={<ContentCopyIcon />} onClick={handleCopy} color="primary" variant="outlined" className="btn-animate">
                      Copy
                    </Button>
                    <Button startIcon={<DownloadIcon />} onClick={() => handleExport('json')} color="secondary" variant="outlined" className="btn-animate">
                      Export JSON
                    </Button>
                    <Button startIcon={<DownloadIcon />} onClick={() => handleExport('md')} color="success" variant="outlined" className="btn-animate">
                      Export Markdown
                    </Button>
                  </CardActions>
                </div>
              )}

              <div className="glass-section">
                <Box sx={{ p: 2 }}>
                  <Typography variant="h5" fontWeight={600} color="primary.main" gutterBottom>
                    Past Analyses
                  </Typography>
                  <Grid container spacing={2}>
                    {analyses.map(a => (
                      <Grid item xs={12} md={6} key={a.id}>
                        <div className="glass-mini-card">
                          <CardContent>
                            <Typography variant="subtitle2" fontWeight={500} color="text.secondary">
                              {a.prompt?.slice(0, 40)}...
                            </Typography>
                            <Box sx={{ background: '#f4f6fa', borderRadius: 1, p: 1, mt: 1, maxHeight: 100, overflow: 'auto' }}>
                              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{JSON.stringify(a.response, null, 2)}</pre>
                            </Box>
                          </CardContent>
                          <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
                            <Button size="small" onClick={() => setCompareIds([a.id, compareIds[1]])} variant="text" color="primary" className="btn-animate">
                              Compare as 1
                            </Button>
                            <Button size="small" onClick={() => setCompareIds([compareIds[0], a.id])} variant="text" color="secondary" className="btn-animate">
                              Compare as 2
                            </Button>
                          </CardActions>
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                  {compareIds[0] && compareIds[1] && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                        Compare Analyses
                      </Typography>
                      {compareAnalyses()}
                    </Box>
                  )}
                </Box>
              </div>
            </Stack>
          )}
        </Stack>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default PromptTester;
