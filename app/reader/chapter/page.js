"use client";
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react'

function Page() {
  const searchParams = useSearchParams();
  const chapterNumber = searchParams.get('chapter_number');
  const panelNumber = searchParams.get('panel_number');
  
  // Parse bbox from URL parameters
  const x = parseFloat(searchParams.get('x'));
  const y = parseFloat(searchParams.get('y'));
  const width = parseFloat(searchParams.get('width'));
  const height = parseFloat(searchParams.get('height'));
  const bbox = (x && y && width && height) ? { x, y, width, height } : null;
  
  const [panels, setPanels] = useState([]);
  const [searchType, setSearchType] = useState('semantic');
  const [semanticQuery, setSemanticQuery] = useState('');
  const panelRefs = useRef({});

  const handleGetPanels = async () => {
    if (!chapterNumber) return;
    const bookId = searchParams.get('book_id');
    if (!bookId) return;

    const response = await fetch(`/api/panels?book_id=${bookId}&chapter_number=${chapterNumber}`);
    const data = await response.json();
    setPanels(data.data);
  }

  useEffect(() => {
    handleGetPanels();
  }, [chapterNumber]);
  
  // Scroll to panel and highlight bbox
useEffect(() => {
  if (!panels.length) return;
  
  // Only scroll if we have bbox coordinates
  if (!bbox) return;
  
  if (!panelNumber) return;
  
  const panelElement = panelRefs.current[panelNumber];
  if (!panelElement) return;

  // Scroll to panel
  panelElement.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });

  // Highlight bbox
  setTimeout(() => {
    highlightBubble(panelElement, bbox);
  }, 500);
}, [panelNumber, panels, bbox]);

  function highlightBubble(panelElement, bbox) {
    const img = panelElement.querySelector('img');
    if (!img) return;

    if (!img.complete) {
      img.onload = () => highlightBubble(panelElement, bbox);
      return;
    }

    const container = img.parentElement;
    
    // Remove existing highlights
    const existingHighlight = container.querySelector('.bubble-highlight');
    if (existingHighlight) existingHighlight.remove();

    // Create highlight overlay
    const overlay = document.createElement('div');
    overlay.className = 'bubble-highlight';
    overlay.style.cssText = `
      position: absolute;
      left: ${bbox.x * img.offsetWidth}px;
      top: ${bbox.y * img.offsetHeight}px;
      width: ${bbox.width * img.offsetWidth}px;
      height: ${bbox.height * img.offsetHeight}px;
      border: 3px solid #fbbf24;
      background-color: rgba(251, 191, 36, 0.3);
      pointer-events: none;
      z-index: 10;
      animation: pulse 1s ease-in-out 3;
    `;

    container.style.position = 'relative';
    container.appendChild(overlay);

    setTimeout(() => overlay.remove(), 10000);
  }
  
  const handleSemanticSearch = async () => {
    if (!semanticQuery) return;
    const response = await fetch('/api/search/semantic', {
      method: 'POST',
      body: JSON.stringify({ query: semanticQuery }),
    });
    const data = await response.json();
    console.log(data);
  }

  return (
    <div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {panels.map((panel) => (
        <div 
          key={panel._id} 
          ref={(el) => panelRefs.current[panel._source.panel_number] = el}
          className="mb-4"
        >
          <div className="relative">
            <img 
              className='w-[800px]' 
              src={panel._source.image_url_base64} 
              alt={panel._source.ocr_text} 
            />
          </div>
          <audio src={`data:audio/mp3;base64,${panel._source.audio_url_base64}`} controls />
          <p className="mt-2 text-sm">{panel._source.ocr_text}</p>
        </div>
      ))}

      {/* <div className="fixed bottom-4 right-4 bg-white p-4 shadow-lg rounded">
        <label htmlFor="search_type">AI Search type:</label>
        <select 
          id="search_type" 
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
          className="ml-2"
        >
          <option value="semantic">Semantic Search</option>
          <option value="chat">AI Chat</option>
        </select>
        
        {searchType === 'semantic' && (
          <div className="mt-2">
            <input 
              id="semantic_query" 
              value={semanticQuery} 
              onChange={(e) => setSemanticQuery(e.target.value)}
              placeholder="Search..."
              className="border p-1 w-full"
            />
          </div>
        )}

        <button 
          onClick={handleSemanticSearch}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div> */}
    </div>
  )
}

export default Page