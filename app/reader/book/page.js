"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getHighlightedSnippet } from "../../services/helper";

export default function ReaderPage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book_id");

  const [bookMetadata, setBookMetadata] = useState(null);
  const [chapters, setChapters] = useState([]);

  const [searchType, setSearchType] = useState("semantic");
  const [semanticQuery, setSemanticQuery] = useState("");

  const [searchResults, setSearchResults] = useState([]);

  const handleGetBookMetadata = async () => {
    if (!bookId) return;
    const response = await fetch(`/api/book?book_id=${bookId}`);
    const data = await response.json();
    console.log(data);
    setBookMetadata(data.data);
  };

  const handleGetChapters = async () => {
    const response = await fetch(`/api/chapters?book_id=${bookId}`);
    const data = await response.json();

    const { titles, chapters } = data;
    console.log(data);
    const chaptersWithTitle = chapters.map((chapter, index) => ({
      title: titles[index].key,
      chapter_number: chapter.key,
    }));
    setChapters(chaptersWithTitle);
  };

  useEffect(() => {
    handleGetBookMetadata();
    handleGetChapters();
  }, [bookId]);

  const router = useRouter();

const handleReadChapter = (chapterNumber, panelNumber = 1, bbox = {}) => {
  const { x, y, width, height } = bbox;
  
  const params = new URLSearchParams({
    // just return thse 3 params if empty bbox  
    book_id: bookId,
    chapter_number: chapterNumber,
    panel_number: panelNumber,
    x,
    y,
    width,
    height,
  });

    // if bbox is empty, just return the 3 params
    if (!x && !y && !width && !height) {
      params.delete("x");
      params.delete("y");
      params.delete("width");
      params.delete("height");
    }
  
  router.push(`/reader/chapter?${params.toString()}`);
};

  // handle semantic search
  const handleSemanticSearch = async () => {
    if (!semanticQuery) return;
    if (!bookId) return;
    const response = await fetch("/api/search/semantic", {
      method: "POST",
      body: JSON.stringify({ query: semanticQuery, bookId }),
    });
    const data = await response.json();
    console.log(data);
    setSearchResults(data.results);
  };

  return (
    <div>
      <img
        className="w-10"
        src={bookMetadata?.image_art_base_64}
        alt={bookMetadata?.title}
      />
      <h1>{bookMetadata?.title}</h1>
      <p>{bookMetadata?.author}</p>
      <p>Chapters</p>
      <ul>
        {chapters.map((chapter) => (
          <li key={chapter.chapter_number}>
            {chapter.chapter_number}.{chapter.title}
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => handleReadChapter(chapter.chapter_number)}
            >
              Read
            </button>
          </li>
        ))}
      </ul>

      {/* AI conversation to search the ocr text and identify the chapter */}
      <div>
        {/* user can choose if want semantic search or AI chat */}
        <div>
          <label htmlFor="search_type">AI Search type:</label>
          <select
            id="search_type"
            name="search_type"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="semantic">Semantic Search</option>
            <option value="chat">AI Chat</option>
          </select>
        </div>

        {searchType === "semantic" && (
          <div>
            <label htmlFor="semantic_query">Semantic Query:</label>
            <input
              className="w-[300px]"
              id="semantic_query"
              name="semantic_query"
              type="text"
              value={semanticQuery}
              onChange={(e) => setSemanticQuery(e.target.value)}
            />
          </div>
        )}

        <button onClick={handleSemanticSearch}>Search</button>
      </div>

      {/* display search results */}
      <div>
        <h2>Search Results</h2>
        
        {searchResults?.map((panel) => (
  <div key={panel.id} className="border rounded-lg p-4 mb-4">
    {/* Panel Image */}
    <div className="mb-4">
      {/* <img 
        src={panel.image_url_base64} 
        alt={`Panel ${panel.panel_number}`}
        className="w-full h-auto"
      /> */}
    </div>

    {/* Panel Info */}
    <div className="mb-2">
      <p className="text-sm text-gray-600">
        Chapter {panel.chapter_number} - Panel {panel.panel_number}
      </p>
      <p className="text-xs text-gray-500">Score: {panel.score.toFixed(2)}</p>
    </div>

    {/* Matched Bubbles */}
    {panel.matched_bubbles?.length > 0 && (
      <div className="mt-3">
        <h4 className="font-semibold text-sm mb-2">Matched Text:</h4>
        {/* only if score is higher than 4 */}
        {panel.matched_bubbles.filter(bubble => bubble.score > 4).map((bubble, idx) => (
          <div 
            key={idx} 
            className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-2"
          >
            <p className="text-sm text-black">{bubble.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              Position: x={bubble.bbox.x.toFixed(2)}, y={bubble.bbox.y.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              Match score: {bubble.score.toFixed(2)}
            </p>
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => handleReadChapter(panel.chapter_number, panel.panel_number, bubble.bbox)}
            >
              Read
            </button>
          </div>
        ))}
      </div>
    )}

    {/* All Bubbles (optional - if you want to show all text) */}
    <details className="mt-3">
      <summary className="text-sm text-gray-600 cursor-pointer">
        Show all text ({panel.bubble_text_coordinates?.length} bubbles)
      </summary>
      <div className="mt-2 space-y-1">
        {panel.bubble_text_coordinates?.map((bubble, idx) => (
          <p key={idx} className="text-xs text-gray-700">
            {bubble.text}
          </p>
        ))}
      </div>
    </details>
  </div>
))}
          {/* <p>{JSON.stringify(searchResults)}</p> */}


      </div>
    </div>
  );
}
