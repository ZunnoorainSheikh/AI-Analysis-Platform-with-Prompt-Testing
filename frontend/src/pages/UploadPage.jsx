import React, { useState } from 'react';
import axios from '../axios';
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
    <div className="max-w-lg mx-auto mt-16 px-2">
      <ToastContainer />
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 md:p-10">
       
        <div className="bg-gray-50 rounded-xl shadow p-4 md:p-6">
          <div className="space-y-4">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg px-8 py-2 shadow hover:scale-105 transition-transform disabled:opacity-60 text-lg"
            >
              {loading ? (
                <span className="animate-spin inline-block w-6 h-6 border-b-2 border-white rounded-full"></span>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
