import React, { useEffect, useState } from 'react';
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-semibold mb-2">Analysis 1</div>
          <pre className="whitespace-pre-wrap break-words text-sm">{JSON.stringify(a1?.response, null, 2)}</pre>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-semibold mb-2">Analysis 2</div>
          <pre className="whitespace-pre-wrap break-words text-sm">{JSON.stringify(a2?.response, null, 2)}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-2">
      <ToastContainer />
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 md:p-10">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-2xl shadow">Prompt Tester</span>
        </div>
        {fetching ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-xl shadow p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-1">Document</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                    value={selectedDoc}
                    onChange={e => setSelectedDoc(e.target.value)}
                  >
                    <option value="">Select Document</option>
                    {documents.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Prompt Template</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-400"
                    value={selectedTemplate}
                    onChange={e => setSelectedTemplate(e.target.value)}
                  >
                    <option value="">Custom</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <PromptEditor value={prompt} onChange={e => setPrompt(e.target.value)} />
              </div>
              <div className="flex justify-center">
                <button
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg px-8 py-2 shadow hover:scale-105 transition-transform disabled:opacity-60"
                  onClick={handleRunAnalysis}
                  disabled={loading}
                >
                  {loading ? <span className="animate-spin inline-block w-6 h-6 border-b-2 border-white rounded-full"></span> : 'Run Analysis'}
                </button>
              </div>
            </div>

            {response && (
              <div className="bg-gray-100 rounded-xl shadow p-4 md:p-6">
                <div className="font-bold text-lg text-indigo-700 mb-2">Gemini Response</div>
                <div className="bg-white rounded-lg p-3 shadow mb-3 min-h-[120px]">
                  <pre className="whitespace-pre-wrap break-words text-base">{JSON.stringify(response, null, 2)}</pre>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <button onClick={handleCopy} className="border border-blue-500 text-blue-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-blue-50 transition">Copy</button>
                  <button onClick={() => handleExport('json')} className="border border-indigo-500 text-indigo-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-indigo-50 transition">Export JSON</button>
                  <button onClick={() => handleExport('md')} className="border border-green-500 text-green-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-green-50 transition">Export Markdown</button>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl shadow p-4 md:p-6">
              <div className="font-bold text-lg text-blue-700 mb-2">Past Analyses</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyses.map(a => (
                  <div key={a.id} className="bg-white rounded-lg shadow p-3 flex flex-col justify-between">
                    <div className="font-semibold text-gray-700 mb-1 truncate">{a.prompt?.slice(0, 40)}...</div>
                    <div className="bg-gray-100 rounded p-2 text-xs max-h-24 overflow-auto mb-2">
                      <pre className="whitespace-pre-wrap break-words">{JSON.stringify(a.response, null, 2)}</pre>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setCompareIds([a.id, compareIds[1]])} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-xs">Compare as 1</button>
                      <button onClick={() => setCompareIds([compareIds[0], a.id])} className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition text-xs">Compare as 2</button>
                    </div>
                  </div>
                ))}
              </div>
              {compareIds[0] && compareIds[1] && (
                <div className="mt-6">
                  <div className="font-semibold text-blue-700 mb-2">Compare Analyses</div>
                  {compareAnalyses()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {snackbar.open && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default PromptTester;
