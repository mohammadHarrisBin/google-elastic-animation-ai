"use client";
import React, { useState, useEffect } from "react";
import { Upload, BookOpen, Loader2, CheckCircle2, AlertCircle, FileText, Image, Settings, BarChart3, Plus, Trash2, Edit, Eye, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  // Store books from elastic search
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  
  // Store book metadata
  const [bookMetaData, setBookMetaData] = useState({
    title: "",
    author: "",
    language: "en",
    image_art_base_64: "",
    created_at: new Date().toISOString(),
  });

  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('create');

  // Get all books for display to admin
  const handleGetBooks = async () => {
    setLoadingBooks(true);
    try {
      const response = await fetch("/api/books");
      const data = await response.json();
      if (data.success) {
        console.log(data);
        setBooks(data.data);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    handleGetBooks();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image_art_base_64") {
      // If file is uploaded
      if (files && files[0]) {
        fileToBase64(files[0]).then((base64) => {
          setBookMetaData({ ...bookMetaData, [name]: base64 });
        });
      }
    } else {
      setBookMetaData({ ...bookMetaData, [name]: value });
    }
  };

  // Handle form submit
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!bookMetaData.title || !bookMetaData.author || !bookMetaData.image_art_base_64) {
      setUploadStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        body: JSON.stringify({ bookMetaData }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUploadStatus({ type: 'success', message: 'Book created successfully!' });
        
        // Clear form
        setBookMetaData({
          title: "",
          author: "",
          language: "en",
          image_art_base_64: "",
          created_at: new Date().toISOString(),
        });
        
        // Reset file input
        const fileInput = document.getElementById('book-cover-upload');
        if (fileInput) fileInput.value = '';
        
        // Add book to list
        setBooks([...books, data.data]);
        
        // Switch to books tab after 2 seconds
        setTimeout(() => {
          setActiveTab('books');
        }, 2000);
      } else {
        setUploadStatus({ type: 'error', message: data.message || 'Failed to create book' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'An error occurred while creating the book' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      {/* <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#0097B2] to-[#00b8d4] rounded-xl shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your comic books and content</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'create'
                  ? 'border-[#0097B2] text-[#0097B2]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Plus className="w-4 h-4" />
              Create Book
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'books'
                  ? 'border-[#0097B2] text-[#0097B2]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              All Books ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-[#0097B2] text-[#0097B2]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CREATE BOOK TAB */}
        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#0097B2] to-[#00b8d4] px-8 py-6">
                  <div className="flex items-center gap-3">
                    <Plus className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">Create New Book</h2>
                  </div>
                  <p className="text-blue-50 mt-2">Add book metadata and cover art</p>
                </div>

                <div className="p-8 space-y-6">
                  {/* Book Title Input */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 text-[#0097B2]" />
                      Book Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={bookMetaData.title}
                      onChange={handleChange}
                      placeholder="Enter book title..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0097B2] focus:ring-4 focus:ring-[#0097B2]/10 transition-all outline-none text-gray-900"
                    />
                  </div>

                  {/* Author Input */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 text-[#0097B2]" />
                      Author Name *
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={bookMetaData.author}
                      onChange={handleChange}
                      placeholder="Enter author name..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0097B2] focus:ring-4 focus:ring-[#0097B2]/10 transition-all outline-none text-gray-900"
                    />
                  </div>

                  {/* Language Select */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <BookOpen className="w-4 h-4 text-[#0097B2]" />
                      Language
                    </label>
                    <select
                      name="language"
                      value={bookMetaData.language}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0097B2] focus:ring-4 focus:ring-[#0097B2]/10 transition-all outline-none text-gray-900"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>

                  {/* Cover Upload */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Image className="w-4 h-4 text-[#0097B2]" />
                      Book Cover *
                    </label>
                    <input
                      id="book-cover-upload"
                      type="file"
                      name="image_art_base_64"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="book-cover-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all group"
                    >
                      {bookMetaData.image_art_base_64 ? (
                        <div className="text-center">
                          <CheckCircle2 className="w-10 h-10 text-[#0097B2] mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">Cover uploaded</p>
                          <p className="text-xs text-[#0097B2] mt-1">Click to change</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-10 h-10 text-gray-400 group-hover:text-[#0097B2] mx-auto mb-2 transition-colors" />
                          <p className="text-sm font-medium text-gray-700">Upload cover image</p>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG (MAX. 5MB)</p>
                        </div>
                      )}
                    </label>
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

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={uploading || !bookMetaData.title || !bookMetaData.author || !bookMetaData.image_art_base_64}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#0097B2] to-[#00b8d4] hover:from-[#00b8d4] hover:to-[#0097B2] disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Book...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Create Book
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Preview Section */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-8 py-6">
                  <div className="flex items-center gap-3">
                    <Eye className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">Preview</h2>
                  </div>
                  <p className="text-gray-300 mt-2">How your book will appear</p>
                </div>

                <div className="p-8">
                  {bookMetaData.image_art_base_64 || bookMetaData.title || bookMetaData.author ? (
                    <div className="space-y-6">
                      {bookMetaData.image_art_base_64 && (
                        <div className="flex justify-center">
                          <img
                            src={bookMetaData.image_art_base_64}
                            alt="Book Cover Preview"
                            className="w-48 h-72 object-cover rounded-xl shadow-2xl ring-4 ring-gray-100"
                          />
                        </div>
                      )}
                      <div className="space-y-3">
                        {bookMetaData.title && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Title</p>
                            <p className="text-xl font-bold text-gray-900">{bookMetaData.title}</p>
                          </div>
                        )}
                        {bookMetaData.author && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Author</p>
                            <p className="text-lg text-gray-700">{bookMetaData.author}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Language</p>
                          <p className="text-sm text-gray-600">{bookMetaData.language.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Fill in the form to see preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ALL BOOKS TAB */}
        {activeTab === 'books' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Books</h2>
              <button
                onClick={handleGetBooks}
                disabled={loadingBooks}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl font-medium text-gray-700 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loadingBooks ? 'animate-spin' : ''}`} />
                Reload
              </button>
            </div>

            {loadingBooks ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <Loader2 className="w-12 h-12 text-[#0097B2] animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading books...</p>
              </div>
            ) : books.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No books yet</h3>
                <p className="text-gray-600 mb-6">Create your first book to get started</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0097B2] to-[#00b8d4] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Create Book
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                { books && books.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
                  >
                    <div className="relative">
                      <img
                        src={book._source?.image_art_base_64 || 'https://via.placeholder.com/400x600?text=No+Image'}
                        alt={book._source?.title || 'No Title'}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-1 text-lg truncate">
                        {book._source?.title || 'No Title'}   
                      </h3>
                      <p className="text-sm text-gray-600 mb-1 truncate">by {book._source?.author || 'No Author'}</p>
                      <p className="text-xs text-gray-500 mb-4">{book._source?.language?.toUpperCase() || 'No Language'}</p>
                      
                      <button
                        onClick={() => window.location.href = `/admin/panels?book_id=${book._id}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0097B2] to-[#00b8d4] hover:from-[#00b8d4] hover:to-[#0097B2] text-white font-semibold rounded-xl transition-all transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                      >
                        <Upload className="w-4 h-4" />
                        Manage Panels
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">Coming soon - View reading statistics and insights</p>
            </div>
          </div>
        )}
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