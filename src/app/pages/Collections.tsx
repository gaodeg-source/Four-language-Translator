import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Trash2, Maximize2 } from 'lucide-react';
import { t } from '../../i18n';
import { toast } from 'sonner';

export function Collections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<{ input: string; output: string; id: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('collections');
    if (saved) {
      try { setCollections(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleRemove = (id: string) => {
    const updated = collections.filter(c => c.id !== id);
    setCollections(updated);
    localStorage.setItem('collections', JSON.stringify(updated));
    toast.success(t('chat.uncollected'));
  };

  const handleExpand = (text: string) => {
    localStorage.setItem('flashcardText', text);
    navigate('/flashcard');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFBF5' }}>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid #E6E6FA', backgroundColor: '#FFFBF5' }}>
        <button onClick={() => navigate(-1)} className="p-2 transition-opacity hover:opacity-60">
          <ArrowLeft className="w-5 h-5" style={{ color: '#6B5B95' }} />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#6B5B95' }}>{t('chat.collection')}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-16">
        <div className="max-w-2xl mx-auto px-6 md:px-12 lg:px-24 py-6">
          {collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Star className="w-12 h-12 mb-4" style={{ color: '#D4C4E8' }} />
              <p style={{ fontSize: '15px', color: '#9B8FA6' }}>{t('chat.noCollections')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {collections.map((c) => (
                <div key={c.id} className="p-4" style={{ backgroundColor: '#F3EEFF', borderRadius: '16px' }}>
                  <div className="flex items-start gap-3">
                    <Star className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#E8A838', fill: '#E8A838' }} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate" style={{ fontSize: '13px', color: '#9B8FA6', marginBottom: '4px' }}>{c.input}</p>
                      <p className="truncate" style={{ fontSize: '15px', fontWeight: 500, color: '#6B5B95' }}>{c.output}</p>
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      <button onClick={() => handleExpand(c.output)} className="p-2 transition-opacity hover:opacity-60" aria-label="Expand">
                        <Maximize2 className="w-4 h-4" style={{ color: '#6B5B95' }} />
                      </button>
                      <button onClick={() => handleRemove(c.id)} className="p-2 transition-opacity hover:opacity-60">
                        <Trash2 className="w-4 h-4" style={{ color: '#E74C3C' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
