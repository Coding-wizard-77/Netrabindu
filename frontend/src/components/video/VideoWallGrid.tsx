import React, { useState } from 'react';
import { Camera } from '../../types';
import { LiveVideoPlayer } from './LiveVideoPlayer';
import { useVideoWallStore, GridLayout } from '../../store/useVideoWallStore';
import { clsx } from 'clsx';
import { Plus, GripVertical, ArrowLeftRight, Move } from 'lucide-react';

interface VideoWallGridProps {
  onSlotClick?: (index: number) => void;
  onInspectCamera?: (camera: Camera) => void;
}

export const VideoWallGrid: React.FC<VideoWallGridProps> = ({ onSlotClick, onInspectCamera }) => {
  const {
    layout,
    slots,
    assignCameraToSlot,
    swapSlots,
    selectedSlotIndex,
    setSelectedSlotIndex,
  } = useVideoWallStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const gridLayoutClasses: Record<GridLayout, string> = {
    '1x1': 'grid-cols-1 grid-rows-1',
    '2x2': 'grid-cols-2 grid-rows-2',
    '3x3': 'grid-cols-3 grid-rows-3',
    '1+5': 'grid-cols-3 grid-rows-3',
    '4x4': 'grid-cols-2 sm:grid-cols-4 auto-rows-fr',
    '5x5': 'grid-cols-3 sm:grid-cols-5 auto-rows-fr',
    '6x6': 'grid-cols-3 sm:grid-cols-6 auto-rows-fr',
    '50-GRID': 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 auto-rows-fr',
  };

  const slotKeys = Object.keys(slots).map(Number);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!slots[index]) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ type: 'slot', sourceIndex: index, camera: slots[index] })
    );
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent, index: number) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    setDraggedIndex(null);

    try {
      const raw = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
      if (!raw) return;
      const data = JSON.parse(raw);

      if (data.type === 'slot' && typeof data.sourceIndex === 'number') {
        // Swap slots or move feed
        swapSlots(data.sourceIndex, targetIndex);
      } else if (data.type === 'camera' && data.camera) {
        // Dropped from drawer/sidebar
        assignCameraToSlot(targetIndex, data.camera);
        setSelectedSlotIndex(targetIndex);
      }
    } catch (err) {
      console.warn('Drop parsing failed:', err);
    }
  };

  return (
    <div
      className={clsx(
        'grid gap-2.5 w-full h-full min-h-[500px] overflow-y-auto p-3 bg-[#060a12] rounded-2xl border border-slate-800/90 shadow-2xl custom-scrollbar',
        gridLayoutClasses[layout]
      )}
    >
      {slotKeys.map((index) => {
        const camera = slots[index];
        const isMasterSlot = layout === '1+5' && index === 0;
        const isDragging = draggedIndex === index;
        const isOver = dragOverIndex === index && draggedIndex !== index;

        return (
          <div
            key={index}
            draggable={!!camera}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={(e) => handleDragLeave(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => {
              setSelectedSlotIndex(index);
              if (onSlotClick) onSlotClick(index);
            }}
            className={clsx(
              'relative rounded-xl overflow-hidden border transition-all select-none group aspect-video min-h-[110px]',
              camera ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
              selectedSlotIndex === index
                ? 'border-cyan-400 ring-2 ring-cyan-500/40 shadow-glow-cyan z-10'
                : 'border-slate-800/80 hover:border-slate-700',
              isDragging && 'opacity-40 scale-[0.98] border-dashed border-cyan-400',
              isOver && 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-950/50 shadow-glow-cyan scale-[1.02] z-20',
              isMasterSlot && 'col-span-2 row-span-2 min-h-[240px]'
            )}
          >
            {/* Drag Handle Indicator Pill for active cameras */}
            {camera && (
              <div
                className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 hover:bg-cyan-600/80 text-slate-300 hover:text-white px-1.5 py-0.5 rounded text-[9px] font-mono flex items-center gap-1 border border-slate-700 pointer-events-none shadow-md"
                title="Click and drag to rearrange or swap slots"
              >
                <GripVertical className="w-3 h-3" />
                <span className="hidden sm:inline">Drag to swap</span>
              </div>
            )}

            {/* Drop Target Overlay Indicator */}
            {isOver && (
              <div className="absolute inset-0 z-40 bg-cyan-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-cyan-300 pointer-events-none animate-in fade-in duration-150">
                <div className="p-2.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 mb-1.5 shadow-glow-cyan animate-bounce">
                  {camera ? <ArrowLeftRight className="w-5 h-5 text-cyan-300" /> : <Move className="w-5 h-5 text-cyan-300" />}
                </div>
                <span className="text-xs font-mono font-black tracking-wider uppercase text-cyan-200">
                  {camera ? `Swap with Slot ${index + 1}` : `Place in Slot ${index + 1}`}
                </span>
                <span className="text-[10px] font-mono text-cyan-400/80">
                  Release to assign
                </span>
              </div>
            )}

            {camera ? (
              <LiveVideoPlayer
                camera={camera}
                compact={!isMasterSlot}
                isSelected={selectedSlotIndex === index}
                onInspect={() => onInspectCamera && onInspectCamera(camera)}
                onRemove={() => assignCameraToSlot(index, null)}
              />
            ) : (
              /* Enhanced Empty Slot Drop Zone with Viewfinder Optics */
              <div className="relative w-full h-full flex flex-col items-center justify-center p-3 text-slate-500 hover:text-cyan-400 border border-dashed border-slate-800/90 hover:border-cyan-500/60 bg-gradient-to-b from-slate-950/60 to-slate-900/30 hover:bg-cyan-950/20 rounded-xl transition-all select-none group-hover:scale-[1.005]">
                {/* Tactical Corner Brackets */}
                <div className="pointer-events-none absolute inset-2 opacity-30 group-hover:opacity-70 transition-opacity">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/60"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/60"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500/60"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/60"></div>
                </div>

                <div className="p-2.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-500/60 group-hover:bg-cyan-500/10 mb-1.5 transition-all shadow-inner group-hover:scale-110">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-cyan-300">
                    Slot {index + 1}
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 group-hover:bg-cyan-950 group-hover:text-cyan-400">
                    EMPTY
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400 mt-0.5 text-center">
                  Drag camera here or click to assign
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
