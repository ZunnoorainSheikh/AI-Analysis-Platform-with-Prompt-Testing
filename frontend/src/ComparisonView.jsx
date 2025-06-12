import React from 'react';
import { Grid, Card, CardContent, Typography, Divider, Box, useTheme, Paper, Stack } from '@mui/material';

const ScrollableBox = ({ children }) => (
  <Box sx={{ maxHeight: 120, overflow: 'auto', p: 1, background: '#f5f5f5', borderRadius: 1 }}>
    <Typography variant="body2" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{children}</Typography>
  </Box>
);

const ComparisonView = ({ analysisA, analysisB }) => {
  const theme = useTheme();
  return (
    <Paper elevation={4} sx={{ width: '100%', mt: 4, p: { xs: 2, md: 4 }, borderRadius: 4, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' }}>
      <Stack spacing={3}>
        <Typography variant="h4" align="center" fontWeight={700} color="primary.main" gutterBottom letterSpacing={1}>
          Compare AI Responses
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[analysisA, analysisB].map((analysis, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <Card elevation={3} sx={{ borderRadius: 3, background: idx === 0 ? 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)' : 'linear-gradient(135deg, #f1f8e9 0%, #fffde7 100%)', boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} color="primary.dark" gutterBottom>
                    Prompt
                  </Typography>
                  <ScrollableBox>{analysis?.prompt || '—'}</ScrollableBox>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="secondary.dark" gutterBottom>
                    Gemini Response
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto', background: '#fff', borderRadius: 2, p: 1, boxShadow: 1 }}>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontSize: 15 }}>
                      {typeof analysis?.response === 'object'
                        ? JSON.stringify(analysis.response, null, 2)
                        : analysis?.response || '—'}
                    </pre>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Paper>
  );
};

export default ComparisonView;
