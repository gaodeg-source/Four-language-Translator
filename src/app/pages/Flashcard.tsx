import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { X, Download } from 'lucide-react';
import { toast } from 'sonner';

export function Flashcard() {
  const navigate = useNavigate();
  const [text] = useState(localStorage.getItem('flashcardText') || '한국어');
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSaveToAlbum = async () => {
    if (!cardRef.current) return;

    try {
      // Create canvas from the flashcard
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 1080;
      canvas.height = 1920;

      // Draw white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 120px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Wrap text if needed
      const maxWidth = canvas.width - 200;
      const words = text.split('');
      let line = '';
      let y = canvas.height / 2;
      const lineHeight = 140;
      const lines: string[] = [];

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && line !== '') {
          lines.push(line);
          line = words[i];
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      // Center vertically
      y = (canvas.height - (lines.length - 1) * lineHeight) / 2;

      // Draw each line
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, y + index * lineHeight);
      });

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) return;

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `flashcard-${Date.now()}.png`;
        link.href = url;
        link.click();

        // Clean up
        URL.revokeObjectURL(url);
        toast.success('Saved to downloads!');
      }, 'image/png');
    } catch (error) {
      toast.error('Failed to save image');
      console.error(error);
    }
  };

  return (
    <div 
      ref={cardRef}
      className="h-screen flex flex-col items-center justify-center p-8 relative"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Top Actions */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button
          onClick={handleSaveToAlbum}
          className="w-12 h-12 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          style={{
            backgroundColor: '#B8A9D4',
            borderRadius: '24px',
          }}
          aria-label="Save to album"
        >
          <Download className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          style={{
            backgroundColor: '#FFD1DC',
            borderRadius: '24px',
          }}
          aria-label="Close"
        >
          <X className="w-6 h-6" style={{ color: '#6B5B95' }} />
        </button>
      </div>

      {/* Main Korean Text */}
      <div className="text-center max-w-4xl px-4">
        <p 
          className="break-words select-text"
          style={{
            fontSize: 'clamp(64px, 15vw, 128px)',
            fontWeight: 700,
            color: '#000000',
            lineHeight: '1.2',
            letterSpacing: '-0.03em',
          }}
        >
          {text}
        </p>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p style={{ fontSize: '14px', color: '#9B8FA6' }}>
          Tap the download icon to save this flashcard
        </p>
      </div>
    </div>
  );
}
