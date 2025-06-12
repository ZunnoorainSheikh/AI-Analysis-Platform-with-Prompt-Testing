import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Switch, FormControlLabel, useTheme, Paper, Stack } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubLight } from '@uiw/codemirror-theme-github';

const variableHints = ['{document_content}', '{filename}'];

function replaceVariables(template, variables = {}) {
  return template.replace(/\{(.*?)\}/g, (match, key) => {
    return key in variables ? variables[key] : match;
  });
}

const PromptEditor = ({ value, onChange, previewVariables = {} }) => {
  const theme = useTheme();
  const [darkMode, setDarkMode] = useState(false);

  const editorTheme = darkMode ? oneDark : githubLight;

  return (
    <Paper elevation={2} sx={{ width: '100%', mt: 2, p: { xs: 2, md: 3 }, borderRadius: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' }}>
      <Stack spacing={2}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle1" fontWeight={600} color="primary.main">
            Prompt Editor
          </Typography>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={() => setDarkMode(v => !v)} size="small" />}
            label="Dark Mode"
            sx={{ ml: 2 }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" mb={1}>
          You can use variables: {variableHints.join(', ')}
        </Typography>
        <CodeMirror
          value={value}
          height="220px"
          minHeight="200px"
          maxHeight="300px"
          theme={editorTheme}
          extensions={[markdown({ base: markdownLanguage })]}
          onChange={onChange}
          basicSetup={{ lineNumbers: true }}
          style={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 16, background: '#fff' }}
        />
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="secondary.main" gutterBottom>
            Preview Output
          </Typography>
          <Card variant="outlined" sx={{ background: theme.palette.mode === 'dark' ? '#222' : '#f9f9f9', borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="body2" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {replaceVariables(value, previewVariables)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PromptEditor;
