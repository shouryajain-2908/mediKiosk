'use client';

import { usePatientStore } from '@/lib/store';
import { mockOcrResults } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Upload, FileText, Loader2, CheckCircle, Camera, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  id: string;
  name: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  ocrData?: typeof mockOcrResults[0];
  progress: number;
}

export default function UploadPage() {
  const { setStep, uploadedDocs, addUploadedDoc, patientName } = usePatientStore();
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (fileName: string) => {
    const fileId = `file-${Date.now()}-${Math.random()}`;
    const newFile: UploadedFile = { id: fileId, name: fileName, status: 'uploading', progress: 0 };
    setFiles(prev => [...prev, newFile]);

    // Simulate upload progress
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += 20;
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress } : f));
      if (progress >= 100) {
        clearInterval(uploadInterval);
        // Move to OCR processing
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'processing' } : f));
        // Simulate OCR after 2 seconds
        setTimeout(() => {
          const ocrData = mockOcrResults[Math.floor(Math.random() * mockOcrResults.length)];
          setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'completed', ocrData } : f));
          addUploadedDoc(fileName);
          toast.success(`OCR completed for ${fileName}`);
        }, 2000);
      }
    }, 300);
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    Array.from(selectedFiles).forEach(file => {
      simulateUpload(file.name);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Button variant="ghost" onClick={() => { setStep('chat'); router.push('/patient/chat'); }} className="text-slate-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chat
          </Button>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700">{patientName}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100">
            <Upload className="h-8 w-8 text-sky-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800">Upload Documents</h1>
          <p className="text-slate-600">Upload prior prescriptions, lab reports, or discharge summaries. We'll extract the key information for you.</p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            dragActive
              ? 'border-sky-500 bg-sky-50'
              : 'border-slate-300 bg-white hover:border-sky-400 hover:bg-sky-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <FileText className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <p className="mb-2 text-lg font-medium text-slate-700">Drag & drop files here</p>
          <p className="text-sm text-slate-500">or click to browse — supports PDF, JPG, PNG</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" className="border-sky-300 text-sky-700">
              <Camera className="mr-2 h-4 w-4" /> Take Photo
            </Button>
          </div>
        </div>

        {/* Uploaded files */}
        {files.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Uploaded Documents ({files.length})</h2>
            {files.map((file) => (
              <Card key={file.id} className="overflow-hidden border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  {/* File header */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-sky-500" />
                      <span className="text-sm font-medium text-slate-700">{file.name}</span>
                    </div>
                    <button onClick={() => removeFile(file.id)} className="text-slate-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Status */}
                  <div className="p-4">
                    {file.status === 'uploading' && (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading... {file.progress}%
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${file.progress}%` }} />
                        </div>
                      </div>
                    )}

                    {file.status === 'processing' && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Running OCR to extract medical data...
                      </div>
                    )}

                    {file.status === 'completed' && file.ocrData && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-teal-600">
                          <CheckCircle className="h-4 w-4" />
                          OCR Complete — Review extracted data
                        </div>

                        {/* Extracted diagnosis */}
                        {file.ocrData.diagnosis && file.ocrData.diagnosis.length > 0 && (
                          <div>
                            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Diagnoses</h4>
                            <div className="flex flex-wrap gap-2">
                              {file.ocrData.diagnosis.map((d, i) => (
                                <span key={i} className="rounded-lg bg-sky-50 px-3 py-1 text-sm text-sky-700">{d}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Extracted medications */}
                        {file.ocrData.medications && file.ocrData.medications.length > 0 && (
                          <div>
                            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Medications</h4>
                            <div className="flex flex-wrap gap-2">
                              {file.ocrData.medications.map((m, i) => (
                                <span key={i} className="rounded-lg bg-teal-50 px-3 py-1 text-sm text-teal-700">{m}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Extracted lab values */}
                        {file.ocrData.labValues && file.ocrData.labValues.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Lab Values</h4>
                            <div className="space-y-2">
                              {file.ocrData.labValues.map((lv, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-700">{lv.name}</span>
                                    <span className="text-sm text-slate-600">{lv.value} {lv.unit}</span>
                                    <span className="text-xs text-slate-400">(Ref: {lv.referenceRange})</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {lv.confidence < 0.9 && (
                                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                                        <AlertCircle className="h-3 w-3" /> Low confidence
                                      </span>
                                    )}
                                    <span className="text-xs text-slate-400">{Math.round(lv.confidence * 100)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                          {file.ocrData.hospital && <span>Hospital: {file.ocrData.hospital}</span>}
                          {file.ocrData.date && <span>Date: {file.ocrData.date}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Continue */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => { setStep('summary'); router.push('/patient/summary'); }}
            className="h-14 flex-1 border-slate-300 text-base text-slate-700 hover:bg-slate-50"
          >
            Skip to Summary <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={() => { setStep('summary'); router.push('/patient/summary'); }}
            className="h-14 flex-1 bg-gradient-to-r from-sky-500 to-teal-500 text-base font-semibold hover:from-sky-600 hover:to-teal-600"
          >
            Review Summary <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
