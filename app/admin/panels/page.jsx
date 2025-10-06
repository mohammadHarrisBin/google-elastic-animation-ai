"use client";
import React, { useEffect, useState } from 'react'
import { useSearchParams } from "next/navigation";

// import { Client } from '@elastic/elasticsearch';

function page() {

  const searchParams = useSearchParams();
  const book_id = searchParams.get('book_id');

  if (!book_id) {
    return <div>Please select a book to upload panels.</div>;
  }

  // get chapters
  const handleGetChapters = async() => {
    const response = await fetch(`/api/chapters?book_id=${book_id}`);
    const data = await response.json();
    
    const {titles, chapters} = data;
    console.log(data);

    // put titles and chapter together like {title: hi, chapters: 1}
    // Cannot read properties of undefined (reading 'key')
    // "buckets": [
    //     {
    //       "key": "Test",
    //       "doc_count": 1
    //     },
    //     {
    //       "key": "Test2",
    //       "doc_count": 1
    //     },
    //     {
    //       "key": "What???",
    //       "doc_count": 1
    //     }
    //   ]
    // },
    // "chapters": {
    //   "doc_count_error_upper_bound": 0,
    //   "sum_other_doc_count": 0,
    //   "buckets": [
    //     {
    //       "key": 1,
    //       "doc_count": 1
    //     },
    //     {
    //       "key": 2,
    //       "doc_count": 1
    //     },
    //     {
    //       "key": 3,
    //       "doc_count": 1
    //     }
    const chaptersWithTitle = chapters.map((chapter, index) => ({
      title: titles[index].key,
      chapter_number: chapter.key,
    }));
    setChapters(chaptersWithTitle);

  }

  

  const [panels, setPanels] = useState([]);
  const [base64s, setBase64s] = useState([]);
  const [ocrResults, setOcrResults] = useState([]);
  const [uploadedPanels, setUploadedPanels] = useState([]);
  const [chapters, setChapters] = useState([]);

  // get panels
  const handleGetPanels = async() => {
    const response = await fetch(`/api/panels?book_id=${book_id}`);
    const data = await response.json();
    console.log(data);
    setUploadedPanels(data.data);
  }

  useEffect(() => {
    // handleGetPanels();
    handleGetChapters();
  }, []);



  const [comicMetadata, setComicMetadata] = useState({
    book_id: book_id,
    // comic_title: '',
    chapter_title: '',
    chapter_number: 0,
    panel_number: 1,
    // i also need the coordinates of the bubble text in the image to autoscroll to it
    ocr_text: '',
    bubble_text_coordinates: '',  // required for frontend display

    image_url_base64: '',  // required for frontend display
    audio_url_base64: '',  // required for frontend display

    

    created_at: new Date().toISOString(),
  });
 

  const [comicMetadataList, setComicMetadataList] = useState([]);


  const handleUpload = async(e) => {
    const files = Array.from(e.target.files); // use can select multipler files
    
    // to preview the images - faster loading
    const previewImages  = files.map((file) => {
      return URL.createObjectURL(file);
    })

    setPanels(previewImages);

    // to send backend
    const base64s = await Promise.all(files.map(fileToBase64));
    setBase64s(base64s);

  }

  async function handleOCR() {
      console.log('OCR Text Extraction');

      // send request to backend for OCR text extraction
      // const ocrResults = await Promise.all(
      //   base64s.map(async (base64, index) => {
      //     // console.log(base64);

      //     const {data: {text}} = await Tesseract.recognize(base64, 'eng');
      //     console.log(text);
      //     return text;
      //   }
      // ))

      const ocrResults = await Promise.all(
        base64s.map(async (base64, index) => {
          const response = await fetch('/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64 }),
          });
          const data = await response.json();
          // console.log(data); // optional, for debugging
          console.log(`panel ${index} submitted`);
          return data; // return OCR text for this panel
        })
      );

      console.log('All OCR results:', ocrResults);
      setOcrResults(ocrResults);

      // update comicMetadataList with OCR results
      const updatedMetadataList = ocrResults.map((result, index) => ({
        ...comicMetadata,
        panel_number: index + 1,
        ocr_text: result.text,
        image_url_base64: result.imageBase64,
        audio_url_base64: result.audioContent,
        bubble_text_coordinates: result.ocr_bubbles,
      }));

      setComicMetadataList(updatedMetadataList);

      return ocrResults;
  }

  // handleSave function
  const handleSave = async() => {
    
      const response = await fetch('/api/panels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panelMetaDataList: comicMetadataList }),
      });
      const data = await response.json();
      console.log(data); // optional, for debugging
      console.log('Save Panels to Elasticsearch');
    
  }


  const checkElasticClient = async() => {
    const response = await fetch('/api/panels', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    console.log(data); // optional, for debugging
    console.log('Check Elasticsearch Client');
  }



  return (
    <div>
      <h1>Upload your Panels</h1>

      {/* comic metadata edit */}
      {/* <input 
        type="text"
        placeholder="Comic Title"
        value={comicMetadata.comic_title}
        onChange={(e) => setComicMetadata({ ...comicMetadata, comic_title: e.target.value })}
        className="mt-4"
      /> */}

      <input 
        type="text"
        placeholder="Chapter Title"
        value={comicMetadata.chapter_title}
        onChange={(e) => setComicMetadata({ ...comicMetadata, chapter_title: e.target.value })}
        className="mt-4"
      />
      <input 
        type="number"
        placeholder="Chapter Number"
        value={comicMetadata.chapter_number}
        onChange={(e) => setComicMetadata({ ...comicMetadata, chapter_number: parseInt(e.target.value) })}
        className="mt-4"
      />
      

       <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleUpload}
        className="mt-4"
      />
      {/* preview images */}
      <div>
        {panels.map((panel, index) => (
          <img className='w-16 h-16 object-cover' key={index} src={panel} alt={`Preview ${index}`} />
        ))}
      </div>

      {panels.length > 0 && (
        <button onClick={handleOCR} className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md'>Step 1. OCR Text Extraction</button>
      )}

      {/* loading indicator */}
      {ocrResults.length === 0 && (
        <div>loading</div>
      )}
      
      {/* display OCR results */}
      <div>
        {comicMetadataList.map((metadata, index) => (
          <div key={index}>
            <p>{metadata.ocr_text}</p>
            <p>Panel {metadata.panel_number}</p>
            <p>Chapter {metadata.chapter_number}</p>
            {/* play audio */}
            <audio controls>
              <source src={`data:audio/mp3;base64,${metadata.audio_url_base64}`} type="audio/mp3" />
            </audio>

            {/* display image */}
            <img className='w-16 h-16 object-cover' src={`${metadata.image_url_base64}`} alt={`Preview ${index}`} />
          </div>
        ))}
      </div>
{/* <p>{JSON.stringify(client)}</p> */}
      {/* {comicMetadataList.length > 0 && ( */}
        <button onClick={handleSave} className='mt-4 px-4 py-2 bg-green-500 text-white rounded-md'>Step 2. Save to Elasticsearch</button>
        
        <button onClick={checkElasticClient} className='mt-4 px-4 py-2 bg-green-500 text-white rounded-md'>Step 3. Check Elasticsearch Client</button>
      {/* )} */}


      {/* display chapters uploaded */}
      <p className='mt-4'>Uploaded Chapters:</p>
      <ul className='list-disc'>
        {chapters.map((chapter) => (
          <a className='block' key={chapter.chapter_number} href={`#${chapter.title}`}>Chapter {chapter.chapter_number} - {chapter.title} </a>
        ))} 
      </ul>
      
    </div>
  )
}

export default page


function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

