"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Book, User, Globe } from 'lucide-react';

function Page() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleGetBooks = async () => {
    try {
      const response = await fetch("/api/books");
      const data = await response.json();
      if (data.success) {
        setBooks(data.data);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetBooks();
  }, []);

  const handleReadBook = (book) => {
    const query = new URLSearchParams({
      book_id: book._id,
      title: book._source.title,
      author: book._source.author,
    }).toString();

    router.push(`/reader/book?${query}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading books...</div>
      </div>
    );
  }


  // read panel page
  return (
    <div className="min-h-screen w-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-600">{books.length} {books.length === 1 ? 'book' : 'books'} available</p>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No books uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map((book) => (
              <div
                key={book._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
                  <img
                    src={book._source.image_art_base_64}
                    alt={book._source.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                    {book._source.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 text-xs mb-1">
                    <User className="w-3 h-3 mr-1" />
                    <span className="line-clamp-1">{book._source.author}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-xs mb-4">
                    <Globe className="w-3 h-3 mr-1" />
                    <span>{book._source.language}</span>
                  </div>
                  
                  <button
                    onClick={() => handleReadBook(book)}
                    className="mt-auto w-full bg-[#0097B2] hover:bg-[#007A99] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm"
                  >
                    Read Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;