import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Check, X } from 'lucide-react';
import { t } from '../../i18n';

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}

interface CropModalProps {
  imageSrc: string;
  onConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export function CropModal({ imageSrc, onConfirm, onCancel }: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const screenAspect = window.innerWidth / window.innerHeight;

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
    onConfirm(cropped);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ backgroundColor: '#000' }}
    >
      {/* Crop area */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={screenAspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { borderRadius: 0 },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div
        className="px-6 py-3 flex items-center gap-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      >
        <span style={{ fontSize: '12px', color: '#9B8FA6' }}>−</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="flex-1"
          style={{ accentColor: '#B8A9D4' }}
        />
        <span style={{ fontSize: '12px', color: '#9B8FA6' }}>+</span>
      </div>

      {/* Action buttons */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.9)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-3 transition-opacity hover:opacity-70"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px' }}
        >
          <X className="w-4 h-4 text-white" />
          <span style={{ fontSize: '14px', color: '#fff' }}>{t('settings.back')}</span>
        </button>

        <button
          onClick={() => { void handleConfirm(); }}
          className="flex items-center gap-2 px-5 py-3 transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#B8A9D4', borderRadius: '20px' }}
        >
          <Check className="w-4 h-4 text-white" />
          <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{t('settings.save')}</span>
        </button>
      </div>
    </div>
  );
}
