import React, { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  Button,
  Typography,
  Divider,
  Box,
  CircularProgress,
  Snackbar,
  TextField,
  Checkbox,
  Grid,
  Paper,
  Stack,
} from '@mui/material';
import axios from './axios';
import { toast } from 'react-toastify';

function truncatePrompt(prompt) {
  if (!prompt) return '';
  const lines = prompt.split('\n');
  return lines.slice(0, 2).join(' ').slice(0, 80) + (lines.length > 2 || prompt.length > 80 ? '...' : '');
}

function getResponseSummary(response) {
  if (!response) return '';
  if (typeof response === 'string') return response.slice(0, 80) + (response.length > 80 ? '...' : '');
  if (typeof response === 'object') return JSON.stringify(response).slice(0, 80) + '...';
  return '';
}

const PromptHistoryList = ({ onCompare, onViewFull }) => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAnalyses = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/analyses');
        setAnalyses(res.data || []);
      } catch (err) {
        setError('Failed to fetch analyses');
        toast.error('Failed to fetch analyses');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyses();
  }, []);

  const handleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((sid) => sid !== id);
      } else if (prev.length < 2) {
        return [...prev, id];
      } else {
        return [prev[1], id]; // keep only last two
      }
    });
  };

  useEffect(() => {
    if (selected.length === 2 && onCompare) {
      const [a, b] = selected.map(id => analyses.find(an => an.id === id));
      if (a && b) onCompare(a, b);
    }
  }, [selected, analyses, onCompare]);

  const filtered = analyses.filter(a =>
    a.prompt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Paper elevation={3} sx={{ width: '100%', mt: 2, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' }}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
          Past Analyses
        </Typography>
        <TextField
          label="Search prompts"
          size="small"
          fullWidth
          sx={{ mb: 2, borderRadius: 2, background: '#fff' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
            <CircularProgress size={32} color="primary" />
          </Box>
        ) : (
          <List>
            {filtered.map((a) => (
              <React.Fragment key={a.id}>
                <ListItem alignItems="flex-start" sx={{ flexDirection: { xs: 'column', sm: 'row' }, background: '#fff', borderRadius: 2, boxShadow: 1, mb: 2, transition: '0.2s', ':hover': { boxShadow: 4, borderColor: 'primary.light' } }}>
                  <Checkbox
                    checked={selected.includes(a.id)}
                    onChange={() => handleSelect(a.id)}
                    disabled={selected.length === 2 && !selected.includes(a.id)}
                    sx={{ alignSelf: 'flex-start', mr: 1 }}
                  />
                  <Card variant="outlined" sx={{ width: '100%', borderRadius: 2, boxShadow: 0 }}>
                    <CardContent>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={8}>
                          <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                            {truncatePrompt(a.prompt)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {a.created_at ? new Date(a.created_at).toLocaleString() : ''}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {getResponseSummary(a.response)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                          <Button size="small" onClick={() => onViewFull && onViewFull(a)} sx={{ mb: 1, borderRadius: 2 }} variant="outlined" color="primary">
                            View Full
                          </Button>
                          <Button
                            size="small"
                            variant={selected.includes(a.id) ? 'contained' : 'outlined'}
                            onClick={() => handleSelect(a.id)}
                            disabled={selected.length === 2 && !selected.includes(a.id)}
                            sx={{ borderRadius: 2 }}
                          >
                            {selected.includes(a.id) ? 'Selected' : 'Compare'}
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError('')}
          message={error}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Stack>
    </Paper>
  );
};

export default PromptHistoryList;
