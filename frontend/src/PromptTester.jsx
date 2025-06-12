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
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// PromptEditor: simple wrapper for TextField, can be replaced with a more advanced editor if needed
const PromptEditor = ({ value, onChange }) => (
  <TextField
    label="Prompt"
    multiline
    minRows={4}
    fullWidth
    value={value}
    onChange={onChange}
    variant="outlined"
    sx={{ mt: 2 }}
  />
);

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
        setDocuments(docsRes.data || []);
        setTemplates(tempsRes.data || []);
        setAnalyses(analysesRes.data || []);
      } catch (err) {
        toast.error('Failed to fetch initial data.');
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
      <Typography variant="h4" align="center" gutterBottom>
        Prompt Tester
      </Typography>
      {fetching ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="doc-label">Document</InputLabel>
                <Select
                  labelId="doc-label"
                  value={selectedDoc}
                  label="Document"
                  onChange={e => setSelectedDoc(e.target.value)}
                >
                  {documents.map(doc => (
                    <MenuItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="template-label">Prompt Template</InputLabel>
                <Select
                  labelId="template-label"
                  value={selectedTemplate}
                  label="Prompt Template"
                  onChange={e => setSelectedTemplate(e.target.value)}
                >
                  <MenuItem value="">Custom</MenuItem>
                  {templates.map(t => (
                    <MenuItem key={t.id} value={t.id}>
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
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Run Analysis'}
              </Button>
            </Grid>
          </Grid>

          {response && (
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant="h6">Gemini Response</Typography>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(response, null, 2)}</pre>
              </CardContent>
              <CardActions>
                <Button startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                  Copy
                </Button>
                <Button startIcon={<DownloadIcon />} onClick={() => handleExport('json')}>
                  Export JSON
                </Button>
                <Button startIcon={<DownloadIcon />} onClick={() => handleExport('md')}>
                  Export Markdown
                </Button>
              </CardActions>
            </Card>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Past Analyses</Typography>
            <Grid container spacing={2}>
              {analyses.map(a => (
                <Grid item xs={12} md={6} key={a.id}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2">{a.prompt?.slice(0, 40)}...</Typography>
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 100, overflow: 'auto' }}>{JSON.stringify(a.response, null, 2)}</pre>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => setCompareIds([a.id, compareIds[1]])}>
                        Compare as 1
                      </Button>
                      <Button size="small" onClick={() => setCompareIds([compareIds[0], a.id])}>
                        Compare as 2
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {compareIds[0] && compareIds[1] && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Compare Analyses</Typography>
                {compareAnalyses()}
              </Box>
            )}
          </Box>
        </Box>
      )}
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
