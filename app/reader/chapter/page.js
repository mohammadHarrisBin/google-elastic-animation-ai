"use client";
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

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
  const [audioPlaying, setAudioPlaying] = useState({});
  const panelRefs = useRef({});
  const audioRefs = useRef({});

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
    if (!bbox) return;
    if (!panelNumber) return;
    
    const panelElement = panelRefs.current[panelNumber];
    if (!panelElement) return;

    // Highlight bbox first, then scroll to it
    setTimeout(() => {
      const overlay = highlightBubble(panelElement, bbox);
      if (overlay) {
        // Scroll to the highlight instead of the panel
        setTimeout(() => {
          overlay.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 100);
      }
    }, 300);
  }, [panelNumber, panels, bbox]);

  function highlightBubble(panelElement, bbox) {
    const img = panelElement.querySelector('img');
    if (!img) return null;

    if (!img.complete) {
      img.onload = () => highlightBubble(panelElement, bbox);
      return null;
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
      border: 4px solid #0097B2;
      background-color: rgba(0, 151, 178, 0.15);
      box-shadow: 0 0 0 4px rgba(0, 151, 178, 0.2), 0 0 20px rgba(0, 151, 178, 0.4);
      pointer-events: none;
      z-index: 10;
      border-radius: 8px;
      animation: pulse 2s ease-in-out 3;
    `;

    container.style.position = 'relative';
    container.appendChild(overlay);

    setTimeout(() => {
      overlay.style.transition = 'opacity 1s ease-out';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 1000);
    }, 8000);

    return overlay;
  }

  const toggleAudio = (panelId) => {
    const audio = audioRefs.current[panelId];
    if (!audio) return;

    if (audioPlaying[panelId]) {
      audio.pause();
      setAudioPlaying(prev => ({ ...prev, [panelId]: false }));
    } else {
      // Pause all other audio
      Object.keys(audioRefs.current).forEach(id => {
        if (id !== panelId && audioRefs.current[id]) {
          audioRefs.current[id].pause();
        }
      });
      setAudioPlaying({ [panelId]: true });
      audio.play();
    }
  };

  const handleAudioEnded = (panelId) => {
    setAudioPlaying(prev => ({ ...prev, [panelId]: false }));
  };

  const handleNextChapter = () => {
    const bookId = searchParams.get('book_id');
    const nextChapter = parseInt(chapterNumber) + 1;
    
    const params = new URLSearchParams({
      book_id: bookId,
      chapter_number: nextChapter,
    });

    window.location.href = `/reader/chapter?${params.toString()}`;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'> 
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1; 
          }
          50% { 
            transform: scale(1.02);
            opacity: 0.7; 
          }
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-[#0097B2] transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-2 text-[#0097B2]">
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">Chapter {chapterNumber}</span>
          </div>
        </div>
      </div>

      {/* Panels Container */}
      <div className='max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8'>
        {panels.map((panel, index) => (
          <div 
            key={panel._id} 
            ref={(el) => panelRefs.current[panel._source.panel_number] = el}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Panel Number Badge */}
            <div className="bg-gradient-to-r from-[#0097B2] to-[#00b8d4] px-6 py-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-sm">
                  Panel {panel._source.panel_number}
                </span>
                {panel._source.audio_url_base64 && (
                  <button
                    onClick={() => toggleAudio(panel._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all backdrop-blur-sm text-white text-sm font-medium"
                  >
                    {audioPlaying[panel._id] ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        Play Audio
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Image Container */}
            <div className="relative bg-gray-50 p-4">
              <div className="relative mx-auto max-w-full">
                <img 
                  className='w-full h-auto rounded-lg shadow-md' 
                  src={panel._source.image_url_base64} 
                  alt={panel._source.ocr_text} 
                />
              </div>
            </div>

            {/* Hidden Audio Element */}
            {panel._source.audio_url_base64 && (
              <audio 
                ref={(el) => audioRefs.current[panel._id] = el}
                src={`data:audio/mp3;base64,${panel._source.audio_url_base64}`}
                onEnded={() => handleAudioEnded(panel._id)}
                className="hidden"
              />
            )}

            {/* Text Content */}
            {panel._source.ocr_text && (
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-1 h-full bg-[#0097B2] rounded-full"></div>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {panel._source.ocr_text}
                  </p>
                </div>
              </div>
            )}

            {/* Panel Progress Indicator */}
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0097B2] to-[#00b8d4] rounded-full transition-all duration-300"
                    style={{ width: `${((index + 1) / panels.length) * 100}%` }}
                  />
                </div>
                <span className="font-medium">{index + 1} / {panels.length}</span>
              </div>
            </div>
          </div>
        ))}

        {panels.length > 0 && (
          <div className="text-center py-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md text-gray-600">
              <BookOpen className="w-4 h-4 text-[#0097B2]" />
              <span className="text-sm font-medium">End of Chapter {chapterNumber}</span>
            </div>
            
            <button
              onClick={handleNextChapter}
              className="flex items-center gap-3 mx-auto px-8 py-4 bg-gradient-to-r from-[#0097B2] to-[#00b8d4] hover:from-[#00b8d4] hover:to-[#0097B2] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <span>Next Chapter</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page