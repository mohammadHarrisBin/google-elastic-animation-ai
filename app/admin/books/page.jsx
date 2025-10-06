"use client";
import React, { useState, useEffect } from "react";

function Page() {
  // store books from elastic search
  const [books, setBooks] = useState([]);

  // get all books for display to admin
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

  

  // store book metadata
  const [bookMetaData, setBookMetaData] = useState({
    title: "",
    author: "",
    language: "en",
    image_art_base_64: "",
    created_at: new Date().toISOString(),
  });

  // handle form input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image_art_base_64") {
      // if file is uploaded
      if (files && files[0]) {
        fileToBase64(files[0]).then((base64) => {
          setBookMetaData({ ...bookMetaData, [name]: base64 });
        });
      }
    } else {
      setBookMetaData({ ...bookMetaData, [name]: value });
    }
  };

  // handle form submit
  const handleSave = (e) => {
    e.preventDefault();
    // send book metadata to /api/books endpoint
    fetch("/api/books", {
      method: "POST",
      body: JSON.stringify({ bookMetaData }),
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        // clear form
        setBookMetaData({
          title: "",
          author: "",
          language: "en",
          image_art_base_64: "",
          created_at: new Date().toISOString(),
        });
        // add book to list
        setBooks([...books, data.data]);
      }
    });

    console.log("Book metadata submitted:", bookMetaData);

    // TODO: send to your /api/save endpoint
  };

  return (
    <div>
      {/* // create a books form  */}
      <p>Create a books form</p>
      
        <label htmlFor="bookTitle">Book Title:</label>
        <input
          type="text"
          id="bookTitle"
          name="title"
          required
          onChange={handleChange}
        />

        <label htmlFor="bookAuthor">Book Author:</label>
        <input
          type="text"
          id="bookAuthor"
          name="author"
          required
          onChange={handleChange}
        />

        {/* book art image */}
        <label htmlFor="bookArt">Book Cover:</label>
        <input
          type="file"
          id="bookArt"
          name="image_art_base_64"
          accept="image/*"
          required
          onChange={handleChange}
        />

        <input className="bg-blue-500 text-white px-4 py-2 rounded-md" type="submit" onClick={handleSave} value="Save Book" />


        {/* <p>{JSON.stringify(bookMetaData)}</p> */}

      {/* preview */}
      {bookMetaData.image_art_base_64 && (
        <div>
          <p>Preview:</p>
          <img
            src={bookMetaData.image_art_base_64}
            alt="Book_Art"
            style={{ maxWidth: "200px", border: "1px solid #ccc" }}
          />
          <p>Book Title: {bookMetaData.title}</p>
          <p>Book Author: {bookMetaData.author}</p>
          <p>Book Language: {bookMetaData.language}</p>
        </div>
      )}


    
      {/* // display all books */}
      <p>All Books:</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleGetBooks}>reload</button>
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
            {/* button to upload panels which is at /admin/panels?book_id={book._id} */}
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={() => window.location.href = `/admin/panels?book_id=${book._id}`}>manage panels</button>

          </li>
        ))}
      </ul>
    </div>
  );
}

export default Page;

// convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
