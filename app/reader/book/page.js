"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, BookOpen, Sparkles, ChevronRight, ExternalLink } from "lucide-react";

export default function ReaderPage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book_id");

  const [bookMetadata, setBookMetadata] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [searchType, setSearchType] = useState("semantic");
  const [semanticQuery, setSemanticQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleGetBookMetadata = async () => {
    if (!bookId) return;
    const response = await fetch(`/api/book?book_id=${bookId}`);
    const data = await response.json();
    setBookMetadata(data.data);
  };

  const handleGetChapters = async () => {
    const response = await fetch(`/api/chapters?book_id=${bookId}`);
    const data = await response.json();

    console.log(data)

    const { titles, chapters } = data;
    const chaptersWithTitle = chapters.map((chapter, index) => ({
      title: titles[index].key,
      chapter_number: chapter.key,
    }));
    console.log(chaptersWithTitle);
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
      book_id: bookId,
      chapter_number: chapterNumber,
      panel_number: panelNumber,
    });

    if (x && y && width && height) {
      params.set("x", x);
      params.set("y", y);
      params.set("width", width);
      params.set("height", height);
    }

    router.push(`/reader/chapter?${params.toString()}`);
  };

  const handleSemanticSearch = async () => {
    if (!semanticQuery) return;
    if (!bookId) return;
    
    setIsSearching(true);
    try {
      const response = await fetch("/api/search/semantic", {
        method: "POST",
        body: JSON.stringify({ query: semanticQuery, bookId }),
      });
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Book Header */}
        <div className="bg-[#0097B2] rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                className="w-40 h-60 object-cover rounded-xl shadow-xl ring-4 ring-gray-100"
                src={bookMetadata?.image_art_base_64}
                alt={bookMetadata?.title}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-3">
                {bookMetadata?.title}
              </h1>
              <p className="text-lg text-white mb-6">by {bookMetadata?.author}</p>
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg inline-flex">
                <BookOpen className="w-5 h-5 text-[#0097B2]" />
                <span className="text-sm font-medium text-[#0097B2]">{chapters.length} chapters</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chapters List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#0097B2]" />
                Chapters
              </h2>
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.chapter_number}
                    className="group flex items-center justify-between hover:m p-2 hover:bg-gradient-to-r hover:from-[#] hover:to-transparent rounded-xl transition-all duration-200 border border-transparent hover:border-blue-100"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="font-semibold text-[#0097B2] text-sm">
                        Chapter {chapter.chapter_number}
                      </span>
                      <span className="text-gray-700 font-medium">{chapter.title}</span>
                    </div>
                    <button
                      className="flex items-center gap-2 text-sm font-medium text-[#0097B2] hover:text-[#007A99] group-hover:translate-x-1 transition-transform"
                      onClick={() => handleReadChapter(chapter.chapter_number)}
                    >
                      Read
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#0097B2] to-[#007A99] rounded-2xl shadow-xl p-6 sticky top-4 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">AI Search</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Search Type
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-blue-200 transition-all"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <option value="semantic" className="text-gray-900">Semantic Search</option>
                    <option value="chat" className="text-gray-900">AI Chat</option>
                  </select>
                </div>

                {searchType === "semantic" && (
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2">
                      Search Query
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-blue-200 transition-all"
                      type="text"
                      placeholder="What are you looking for?"
                      value={semanticQuery}
                      onChange={(e) => setSemanticQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSemanticSearch()}
                    />
                  </div>
                )}

                <button
                  onClick={handleSemanticSearch}
                  disabled={isSearching || !semanticQuery}
                  className="w-full flex items-center justify-center gap-2 bg-white text-[#0097B2] hover:bg-blue-50 disabled:bg-white/30 disabled:text-white/50 disabled:cursor-not-allowed px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Search className="w-5 h-5" />
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Search Results
                </h2>
                <span className="px-4 py-2 bg-[#0097B2] text-white rounded-full text-sm font-semibold">
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {searchResults.map((panel) => (
                  <div
                    key={panel.id}
                    className="group border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0097B2] rounded-lg">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Chapter {panel.chapter_number} • Panel {panel.panel_number}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#0097B2] to-[#007A99] rounded-full"
                                style={{ width: `${Math.min(panel.score * 10, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                              {panel.score.toFixed(2)} relevance
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {panel.matched_bubbles?.filter((bubble) => bubble.score > 4)
                      .length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#0097B2]" />
                          Matched Text
                        </h4>
                        <div className="space-y-3">
                          {panel.matched_bubbles
                            .filter((bubble) => bubble.score > 4)
                            .map((bubble, idx) => (
                              <div
                                key={idx}
                                className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                              >
                                <p className="text-sm text-gray-900 mb-3 leading-relaxed font-medium">
                                  "{bubble.text}"
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                                        style={{ width: `${Math.min(bubble.score * 10, 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">
                                      {bubble.score.toFixed(2)}
                                    </span>
                                  </div>
                                  <button
                                    className="flex items-center gap-2 bg-[#0097B2] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    onClick={() =>
                                      handleReadChapter(
                                        panel.chapter_number,
                                        panel.panel_number,
                                        bubble.bbox
                                      )
                                    }
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Read
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <details className="mt-4 group/details">
                      <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 group-open/details:rotate-90 transition-transform" />
                        Show all text ({panel.bubble_text_coordinates?.length}{" "}
                        {panel.bubble_text_coordinates?.length === 1 ? 'bubble' : 'bubbles'})
                      </summary>
                      <div className="mt-3 space-y-2 pl-6 pt-3 border-l-2 border-gray-200">
                        {panel.bubble_text_coordinates?.map((bubble, idx) => (
                          <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                            • {bubble.text}
                          </p>
                        ))}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}