import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import api from '../../services/api';

const ResumeUploader = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return false;
    const validExtensions = ['pdf', 'docx', 'doc'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setErrorMessage('Unsupported file format. Please upload a PDF or DOCX file.');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5MB limit.');
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setResumeName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMessage('');

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setResumeName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(20);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      if (resumeName.trim()) {
        formData.append('name', resumeName.trim());
      }

      setUploadProgress(60);
      const res = await api.post('/resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadProgress(100);
      if (res.data.success) {
        setSelectedFile(null);
        setResumeName('');
        if (onUploadSuccess) {
          onUploadSuccess(res.data.data.resume);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload and parse resume.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="rounded-xl border border-[#ded6c5] bg-white p-6 shadow-xs dark:border-[#2A302D] dark:bg-[#101312]">
      <h3 className="text-base font-bold tracking-tight text-stone-900 dark:text-[#F5F4EF]">
        Upload Resume
      </h3>
      <p className="mt-1 text-xs text-stone-500 dark:text-[#A2AAA5]">
        Supports PDF and DOCX files up to 5MB. Your resume will be parsed and structured automatically.
      </p>

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#2A302D] bg-[#222825] p-3 text-xs text-[#F5F4EF]">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#D5B777]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            dragActive
              ? 'border-[#2A8278] bg-[#222825]'
              : 'border-[#2A302D] hover:border-[#2A8278] bg-[#191E1C] hover:bg-[#222825]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#222825] text-[#2A8278] border border-[#2A302D] mb-3 shadow-xs">
            <UploadCloud className="h-6 w-6" />
          </div>

          <p className="text-sm font-semibold text-[#F5F4EF]">
            Click to browse or drag & drop your resume here
          </p>
          <p className="mt-1 text-xs text-[#A2AAA5]">
            PDF, DOCX up to 5 MB
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4 rounded-xl border border-[#2A302D] bg-[#222825] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2A8278] text-[#F5F4EF]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F5F4EF]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[#A2AAA5]">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.name.split('.').pop().toUpperCase()}
                </p>
              </div>
            </div>

            {!uploading && (
              <button
                onClick={() => setSelectedFile(null)}
                className="rounded-lg p-1.5 text-[#A2AAA5] hover:bg-[#191E1C] hover:text-[#F5F4EF] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F5F4EF]">
              Resume Label / Version Name
            </label>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="e.g. Senior Full Stack Resume"
              className="mt-1.5 w-full rounded-lg border border-[#2A302D] bg-[#191E1C] py-2 px-3 text-xs text-[#F5F4EF] focus:border-[#2A8278] focus:outline-hidden"
            />
          </div>

          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#A2AAA5]">
                <span>Extracting & Parsing Structure...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#191E1C] border border-[#2A302D]">
                <div
                  className="h-full bg-[#2A8278] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setSelectedFile(null)}
              disabled={uploading}
              className="rounded-xl border border-[#2A302D] px-4 py-2 text-xs font-semibold text-[#A2AAA5] hover:bg-[#191E1C] hover:text-[#F5F4EF] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 rounded-xl bg-[#2A8278] px-4 py-2 text-xs font-semibold text-[#F5F4EF] shadow-xs hover:bg-[#236e66] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Parse & Save Resume</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
