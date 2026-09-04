import React from 'react';
import { Camera } from '../../types';
import { LiveVideoPlayer } from './LiveVideoPlayer';
import { useVideoWallStore, GridLayout } from '../../store/useVideoWallStore';
import { clsx } from 'clsx';
import { Plus, X } from 'lucide-react';

interface VideoWallGridProps {
  onSlotClick?: (index: number) => void;
}

export const VideoWallGrid: React.FC<VideoWallGridProps> = ({ onSlotClick }) => {
  const { layout, slots, assignCameraToSlot, selectedSlotIndex, setSelectedSlotIndex } = useVideoWallStore();

  const gridLayoutClasses: Record<GridLayout, string> = {
    '1x1': 'grid-cols-1 grid-rows-1',
    '2x2': 'grid-cols-2 grid-rows-2',
    '3x3': 'grid-cols-3 grid-rows-3',
    '1+5': 'grid-cols-3 grid-rows-3',
    '4x4': 'grid-cols-4 grid-rows-4',
  };

  const slotKeys = Object.keys(slots).map(Number);

  return (
    <div className={clsx('grid gap-2 w-full h-full min-h-[600px] p-2 bg-[#090d16] rounded-xl border border-slate-800', gridLayoutClasses[layout])}>
      {slotKeys.map((index) => {
        const camera = slots[index];
        const isMasterSlot = layout === '1+5' && index === 0;

        return (
          <div
            key={index}
            onClick={() => {
              setSelectedSlotIndex(index);
              if (onSlotClick) onSlotClick(index);
            }}
            className={clsx(
              'relative rounded-lg overflow-hidden border transition-all cursor-pointer bg-slate-950/80 group',
              selectedSlotIndex === index ? 'border-cyan-500 shadow-lg shadow-cyan-950/50' : 'border-slate-800 hover:border-slate-700',
              isMasterSlot && 'col-span-2 row-span-2'
            )}
          >
            {camera ? (
              <div className="relative w-full h-full">
                <LiveVideoPlayer camera={camera} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    assignCameraToSlot(index, null);
                  }}
                  className="absolute top-2 right-2 p-1 rounded bg-black/70 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors z-20 opacity-0 group-hover:opacity-100"
                  title="Remove Camera"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 hover:text-slate-400 border border-dashed border-slate-800 hover:border-slate-700 rounded-lg p-4">
                <Plus className="w-8 h-8 mb-1" />
                <span className="text-xs font-mono font-medium">Slot {index + 1} Empty</span>
                <span className="text-[10px] text-slate-500">Click to assign camera</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
