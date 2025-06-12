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
    console.log('selectedDoc:', selectedDoc, 'prompt:', prompt);
    if (!selectedDoc || !prompt.trim()) {
      toast.error('Select a document and enter a prompt.');
      return;
    }
    setLoading(true);
    setResponse(null);
    try {
      const res = await axios.post('/analyze', {
        file_id: selectedDoc, // Fix: backend expects file_id, not document_id
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
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">AI Analyzer</h2>
            <p className="mt-1 text-sm text-gray-500">Analyze documents with custom prompts and compare results</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              {fetching ? (
                <div className="flex justify-center items-center py-12">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Analysis Configuration</h3>
                      <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                            Document
                          </label>
                          <div className="mt-1">
                            <select
                              id="document"
                              name="document"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              value={selectedDoc}
                              onChange={e => {
                                setSelectedDoc(e.target.value);
                              }}
                            >
                              <option value="">Select Document</option>
                              {documents.map(doc => (
                                <option key={doc.id} value={doc.id || ''}>
                                  {doc.filename ? `${doc.filename} (${doc.id ? doc.id.slice(0, 8) : ''})` : doc.name || doc.id || 'No ID'}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                            Prompt Template
                          </label>
                          <div className="mt-1">
                            <select
                              id="template"
                              name="template"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                      </div>
                    </div>

                    <div>
                      <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                        Prompt
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="prompt"
                          name="prompt"
                          rows={5}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                          value={prompt}
                          onChange={e => setPrompt(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleRunAnalysis}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing
                          </>
                        ) : "Run Analysis"}
                      </button>
                    </div>
                  </div>

                  {response && (
                    <div className="rounded-md bg-white border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Gemini Response</h3>
                      </div>
                      <div className="px-4 py-5 sm:p-6 bg-white">
                        <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-72">
                          {typeof response.response === 'string' ? (
                            <div className="whitespace-pre-line break-words text-base">{response.response}</div>
                          ) : (
                            <pre className="whitespace-pre-wrap break-words text-base">{JSON.stringify(response, null, 2)}</pre>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end space-x-3">
                          <button onClick={handleCopy} className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Copy
                          </button>
                          <button onClick={() => handleExport('json')} className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Export JSON
                          </button>
                          <button onClick={() => handleExport('md')} className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Export Markdown
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-md bg-white border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Past Analyses</h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analyses.map(a => (
                          <div key={a.id} className="border border-gray-200 rounded-md shadow-sm p-3 flex flex-col justify-between bg-gray-50">
                            <div className="font-medium text-gray-900 mb-1 truncate">{a.prompt?.slice(0, 40)}...</div>
                            <div className="bg-white rounded p-2 text-xs max-h-24 overflow-auto mb-2 border border-gray-200">
                              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(a.response, null, 2)}</pre>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => setCompareIds([a.id, compareIds[1]])} 
                                className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                Compare as 1
                              </button>
                              <button 
                                onClick={() => setCompareIds([compareIds[0], a.id])} 
                                className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                Compare as 2
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {compareIds[0] && compareIds[1] && (
                        <div className="mt-6">
                          <h4 className="text-base font-medium text-gray-900 mb-2">Compare Analyses</h4>
                          {compareAnalyses()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default PromptTester;
