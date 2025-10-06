"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Image, 
  ChevronLeft,
  BookOpen,
  Layers,
  FileUp,
  Trash2,
  Eye,
  Wand2,
  Save,
  RefreshCw,
  Volume2,
  MapPin
} from 'lucide-react';

export default function PanelsPage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book_id");

  if (!bookId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Book Selected</h2>
          <p className="text-gray-600">Please select a book to upload panels.</p>
        </div>
      </div>
    );
  }

  // Store book metadata
  const [bookMetadata, setBookMetadata] = useState(null);
  
  // Store uploaded panels from Elasticsearch
  const [uploadedPanels, setUploadedPanels] = useState([]);
  const [loadingPanels, setLoadingPanels] = useState(false);

  // Store chapters
  const [chapters, setChapters] = useState([]);

  // New panel upload workflow
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [panels, setPanels] = useState([]); // Preview images
  const [base64s, setBase64s] = useState([]);
  const [ocrResults, setOcrResults] = useState([]);
  const [comicMetadataList, setComicMetadataList] = useState([]);

  // Comic metadata for new uploads
  const [comicMetadata, setComicMetadata] = useState({
    book_id: bookId,
    chapter_title: '',
    chapter_number: 0,
    panel_number: 1,
    ocr_text: '',
    bubble_text_coordinates: '',
    image_url_base64: '',
    audio_url_base64: '',
    created_at: new Date().toISOString(),
  });

  // UI states
  const [uploading, setUploading] = useState(false);
  const [processingOCR, setProcessingOCR] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [activeStep, setActiveStep] = useState(1); // 1: Upload, 2: OCR, 3: Save

  // Get book metadata
  const handleGetBookMetadata = async () => {
    if (!bookId) return;
    
    try {
      const response = await fetch(`/api/book?book_id=${bookId}`);
      const data = await response.json();
      if (data.success) {
        setBookMetadata(data.data);
      }
    } catch (error) {
      console.error("Error fetching book metadata:", error);
    }
  };

  // Get chapters
  const handleGetChapters = async() => {
    try {
      const response = await fetch(`/api/chapters?book_id=${bookId}`);
      const data = await response.json();
      
      const {titles, chapters} = data;
      console.log(data);

      // Put titles and chapters together
      const chaptersWithTitle = chapters.map((chapter, index) => ({
        title: titles[index].key,
        chapter_number: chapter.key,
      }));
      setChapters(chaptersWithTitle);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  }

  // Get all panels for this book
  const handleGetPanels = async () => {
    if (!bookId) return;
    
    setLoadingPanels(true);
    try {
      const response = await fetch(`/api/panels?book_id=${bookId}`);
      const data = await response.json();
      console.log(data);
      if (data.success) {
        setUploadedPanels(data.data);
      }
    } catch (error) {
      console.error("Error fetching panels:", error);
    } finally {
      setLoadingPanels(false);
    }
  };

  useEffect(() => {
    handleGetBookMetadata();
    handleGetChapters();
    handleGetPanels();
  }, [bookId]);

  // Handle file selection and preview
  const handleUpload = async(e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // To preview the images - faster loading
    const previewImages = files.map((file) => {
      return URL.createObjectURL(file);
    })
    setPanels(previewImages);

    // To send to backend
    const base64s = await Promise.all(files.map(fileToBase64));
    setBase64s(base64s);
    setUploadStatus(null);
    setActiveStep(2);
  }

  // Handle OCR text extraction
  async function handleOCR() {
    console.log('OCR Text Extraction');
    setProcessingOCR(true);
    setUploadStatus(null);

    try {
      // Send request to backend for OCR text extraction
      const ocrResults = await Promise.all(
        base64s.map(async (base64, index) => {
          const response = await fetch('/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64 }),
          });
          const data = await response.json();
          console.log(`Panel ${index + 1} submitted`);
          return data; // return OCR text for this panel
        })
      );

      console.log('All OCR results:', ocrResults);
      setOcrResults(ocrResults);

      // Update comicMetadataList with OCR results
      const updatedMetadataList = ocrResults.map((result, index) => ({
        ...comicMetadata,
        panel_number: index + 1,
        ocr_text: result.text,
        image_url_base64: result.imageBase64,
        audio_url_base64: result.audioContent,
        bubble_text_coordinates: result.ocr_bubbles,
      }));

      setComicMetadataList(updatedMetadataList);
      setUploadStatus({ type: 'success', message: 'OCR processing completed!' });
      setActiveStep(3);
      
      return ocrResults;
    } catch (error) {
      console.error("OCR Error:", error);
      setUploadStatus({ type: 'error', message: 'OCR processing failed' });
    } finally {
      setProcessingOCR(false);
    }
  }

  // Handle save to Elasticsearch
  const handleSave = async() => {
    setSaving(true);
    setUploadStatus(null);

    try {
      const response = await fetch('/api/panels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panelMetaDataList: comicMetadataList }),
      });
      const data = await response.json();
      console.log(data);
      
      if (data.success) {
        setUploadStatus({ type: 'success', message: 'Panels saved successfully!' });
        
        // Reset form
        setPanels([]);
        setBase64s([]);
        setOcrResults([]);
        setComicMetadataList([]);
        setSelectedFiles([]);
        setActiveStep(1);
        
        // Reset file input
        const fileInput = document.getElementById('panels-upload');
        if (fileInput) fileInput.value = '';
        
        // Refresh panels and chapters
        setTimeout(() => {
          handleGetPanels();
          handleGetChapters();
        }, 1000);
      } else {
        setUploadStatus({ type: 'error', message: data.message || 'Failed to save panels' });
      }
    } catch (error) {
      console.error("Save Error:", error);
      setUploadStatus({ type: 'error', message: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  }

  // Handle delete panel
  const handleDeletePanel = async (panelId) => {
    if (!confirm('Are you sure you want to delete this panel?')) return;

    try {
      const response = await fetch(`/api/panel/${panelId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedPanels(uploadedPanels.filter(panel => panel._id !== panelId));
        setUploadStatus({ type: 'success', message: 'Panel deleted successfully' });
      } else {
        setUploadStatus({ type: 'error', message: data.message || 'Failed to delete panel' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'An error occurred while deleting' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-4">
                {bookMetadata?.image_art_base_64 && (
                  <img
                    src={bookMetadata.image_art_base_64}
                    alt={bookMetadata.title}
                    className="w-12 h-16 object-cover rounded-lg shadow-md ring-2 ring-gray-100"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {bookMetadata?.title || 'Loading...'}
                  </h1>
                  <p className="text-gray-600">by {bookMetadata?.author || '...'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0097B2]/10 rounded-lg">
                <Layers className="w-5 h-5 text-[#0097B2]" />
                <span className="text-sm font-semibold text-[#0097B2]">
                  {uploadedPanels.length} Panels
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-600">
                  {chapters.length} Chapters
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chapters List */}
        {chapters.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0097B2]" />
              Uploaded Chapters
            </h3>
            <div className="flex flex-wrap gap-2">
              {chapters.map((chapter) => (
                <a
                  key={chapter.chapter_number}
                  href={`#chapter-${chapter.chapter_number}`}
                  className="px-4 py-2 bg-gray-50 hover:bg-[#0097B2]/10 border border-gray-200 hover:border-[#0097B2] rounded-lg transition-all text-sm font-medium text-gray-700 hover:text-[#0097B2]"
                >
                  Ch {chapter.chapter_number}: {chapter.title}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Workflow Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-4">
              <div className="bg-gradient-to-r from-[#0097B2] to-[#00b8d4] px-6 py-5">
                <div className="flex items-center gap-3">
                  <FileUp className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Upload Workflow</h2>
                </div>
                <p className="text-blue-50 mt-1 text-sm">3-step process to add panels</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Chapter Metadata */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 text-[#0097B2]" />
                      Chapter Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter chapter title..."
                      value={comicMetadata.chapter_title}
                      onChange={(e) => setComicMetadata({ ...comicMetadata, chapter_title: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#0097B2] focus:ring-4 focus:ring-[#0097B2]/10 transition-all outline-none text-gray-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Layers className="w-4 h-4 text-[#0097B2]" />
                      Chapter Number
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      value={comicMetadata.chapter_number}
                      onChange={(e) => setComicMetadata({ ...comicMetadata, chapter_number: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#0097B2] focus:ring-4 focus:ring-[#0097B2]/10 transition-all outline-none text-gray-900 text-sm"
                    />
                  </div>
                </div>

                {/* Step 1: File Upload */}
                <div className={`p-4 rounded-xl border-2 ${activeStep >= 1 ? 'border-[#0097B2] bg-[#0097B2]/5' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep >= 1 ? 'bg-[#0097B2] text-white' : 'bg-gray-300 text-gray-600'}`}>
                      1
                    </div>
                    <span className="font-semibold text-gray-900">Upload Images</span>
                  </div>
                  
                  <input
                    id="panels-upload"
                    type="file"
                    onChange={handleUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <label
                    htmlFor="panels-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-all group"
                  >
                    {panels.length > 0 ? (
                      <div className="text-center px-4">
                        <CheckCircle2 className="w-8 h-8 text-[#0097B2] mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">
                          {panels.length} file(s) selected
                        </p>
                        <p className="text-xs text-[#0097B2] mt-1">Click to change</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#0097B2] mx-auto mb-2 transition-colors" />
                        <p className="text-sm font-medium text-gray-700">Select images</p>
                      </div>
                    )}
                  </label>

                  {/* Preview thumbnails */}
                  {panels.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {panels.slice(0, 4).map((panel, index) => (
                        <img key={index} src={panel} alt={`Preview ${index}`} className="w-12 h-12 object-cover rounded border-2 border-gray-200" />
                      ))}
                      {panels.length > 4 && (
                        <div className="w-12 h-12 bg-gray-100 rounded border-2 border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          +{panels.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 2: OCR Processing */}
                <div className={`p-4 rounded-xl border-2 ${activeStep >= 2 ? 'border-[#0097B2] bg-[#0097B2]/5' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep >= 2 ? 'bg-[#0097B2] text-white' : 'bg-gray-300 text-gray-600'}`}>
                      2
                    </div>
                    <span className="font-semibold text-gray-900">OCR Processing</span>
                  </div>
                  
                  <button
                    onClick={handleOCR}
                    disabled={panels.length === 0 || processingOCR || activeStep < 2}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:cursor-not-allowed transition-all text-sm"
                  >
                    {processingOCR ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Extract Text & Audio
                      </>
                    )}
                  </button>

                  {comicMetadataList.length > 0 && (
                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{comicMetadataList.length} panels processed</span>
                    </div>
                  )}
                </div>

                {/* Step 3: Save */}
                <div className={`p-4 rounded-xl border-2 ${activeStep >= 3 ? 'border-[#0097B2] bg-[#0097B2]/5' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep >= 3 ? 'bg-[#0097B2] text-white' : 'bg-gray-300 text-gray-600'}`}>
                      3
                    </div>
                    <span className="font-semibold text-gray-900">Save to Database</span>
                  </div>
                  
                  <button
                    onClick={handleSave}
                    disabled={comicMetadataList.length === 0 || saving || activeStep < 3}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0097B2] to-[#00b8d4] hover:from-[#00b8d4] hover:to-[#0097B2] disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:cursor-not-allowed transition-all text-sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Panels
                      </>
                    )}
                  </button>
                </div>

                {/* Status Message */}
                {uploadStatus && (
                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl ${
                      uploadStatus.type === 'success'
                        ? 'bg-green-50 border-2 border-green-200'
                        : 'bg-red-50 border-2 border-red-200'
                    }`}
                  >
                    {uploadStatus.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <p
                      className={`text-sm font-medium ${
                        uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {uploadStatus.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* OCR Results Preview */}
            {comicMetadataList.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-purple-600" />
                  Processed Panels Preview
                </h2>
                <div className="space-y-4">
                  {comicMetadataList.map((metadata, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-all">
                      <div className="flex gap-4">
                        <img 
                          src={metadata.image_url_base64} 
                          alt={`Panel ${metadata.panel_number}`} 
                          className="w-24 h-32 object-cover rounded-lg shadow-md flex-shrink-0"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-[#0097B2] text-white text-xs font-bold rounded">
                              Panel {metadata.panel_number}
                            </span>
                            <span className="text-sm text-gray-600">
                              Chapter {metadata.chapter_number}
                            </span>
                          </div>
                          
                          {metadata.ocr_text && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-1">Extracted Text:</p>
                              <p className="text-sm text-gray-700 line-clamp-3 bg-gray-50 p-2 rounded">
                                {metadata.ocr_text}
                              </p>
                            </div>
                          )}
                          
                          {metadata.audio_url_base64 && (
                            <div className="flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-[#0097B2]" />
                              <audio controls className="h-8 flex-1">
                                <source src={`data:audio/mp3;base64,${metadata.audio_url_base64}`} type="audio/mp3" />
                              </audio>
                            </div>
                          )}
                          
                          {metadata.bubble_text_coordinates && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>Speech bubbles detected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Panels Grid */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-6 h-6 text-[#0097B2]" />
                  All Uploaded Panels
                </h2>
                <button
                  onClick={handleGetPanels}
                  disabled={loadingPanels}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl font-medium text-gray-700 transition-all text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingPanels ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loadingPanels ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-[#0097B2] animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading panels...</p>
                </div>
              ) : uploadedPanels.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No panels yet</h3>
                  <p className="text-gray-600">Upload your first panel using the workflow on the left</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {uploadedPanels.map((panel, index) => (
                    <div
                      key={panel._id}
                      className="group bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#0097B2] transition-all duration-300 hover:shadow-lg"
                    >
                      {/* Panel Image */}
                      <div className="relative bg-white">
                        <img
                          src={panel._source?.image_url_base64 || panel._source?.image_url}
                          alt={`Panel ${index + 1}`}
                          className="w-full h-64 object-contain"
                        />
                        <div className="absolute top-2 left-2 px-3 py-1 bg-[#0097B2] text-white text-xs font-bold rounded-full shadow-lg">
                          Panel {panel._source?.panel_number || index + 1}
                        </div>
                      </div>

                      {/* Panel Info */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">
                              Ch {panel._source?.chapter_number || 'N/A'}: {panel._source?.chapter_title || 'Untitled'}
                            </span>
                          </div>
                          {panel._source?.ocr_text && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>OCR</span>
                            </div>
                          )}
                        </div>

                        {/* OCR Preview */}
                        {panel._source?.ocr_text && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Text:</p>
                            <p className="text-xs text-gray-700 line-clamp-2 bg-white p-2 rounded border border-gray-200">
                              {panel._source.ocr_text}
                            </p>
                          </div>
                        )}

                        {/* Audio Player */}
                        {panel._source?.audio_url_base64 && (
                          <div className="mb-3">
                            <audio controls className="w-full h-8">
                              <source src={`data:audio/mp3;base64,${panel._source.audio_url_base64}`} type="audio/mp3" />
                            </audio>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(panel._source?.image_url_base64 || panel._source?.image_url, '_blank')}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 hover:border-[#0097B2] text-gray-700 hover:text-[#0097B2] font-medium rounded-lg transition-all text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDeletePanel(panel._id)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 font-medium rounded-lg transition-all text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}