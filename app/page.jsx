"use client";
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';

function page() {
  
  const [books, setBooks] = useState([]);
  
  // get books from elasticsearch for user to read
  const handleGetBooks = async () => {
    const response = await fetch("/api/books");
    const data = await response.json();
    if (data.success) {
      console.log(data)
      setBooks(data.data);
    }
  };

  useEffect(() => {
    handleGetBooks();
  }, []);
  // user click and select chapter uploaded 
  const router = useRouter();
  //path.startsWith is not a function
  const handleReadBook = (book) => {
  const query = new URLSearchParams({
    book_id: book._id,
    title: book._source.title,
    author: book._source.author,
    
  }).toString();

  router.push(`/reader/book?${query}`);
};



  // read panel page
  return (
    <div>
      <h1>Uploaded Books</h1>
      <ul>
        {books.map((book) => (
          <li key={book._id}>
            <img
              src={book._source.image_art_base_64}
              alt={book._source.title}
              style={{ maxWidth: "100px", border: "1px solid #ccc" }}
            />
            <p>{book._source.title}</p>
            <p>{book._source.author}</p>
            <p>{book._source.language}</p>
            
            <button onClick={() => handleReadBook(book)}>read</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default page