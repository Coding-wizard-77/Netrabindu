import React, { useState } from 'react';
import { Camera } from '../../types';
import { LiveVideoPlayer } from './LiveVideoPlayer';
import { useVideoWallStore, GridLayout } from '../../store/useVideoWallStore';
import { clsx } from 'clsx';
import { Plus, GripVertical, ArrowLeftRight, Move } from 'lucide-react';

interface VideoWallGridProps {
  onSlotClick?: (index: number) => void;
  onInspectCamera?: (camera: Camera) => void;
  activeAnomalies?: Record<string, { type: string; severity: string; description?: string }>;
}

export const VideoWallGrid: React.FC<VideoWallGridProps> = ({ onSlotClick, onInspectCamera, activeAnomalies = {} }) => {
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

  // We explicitly use auto-rows-max and NO fixed grid-rows-N / auto-rows-fr so that
  // row heights naturally match aspect-video (16:9) cards and NEVER overlap vertically.
  const gridLayoutClasses: Record<GridLayout, string> = {
    '1x1': 'grid-cols-1 max-w-5xl mx-auto w-full auto-rows-max',
    '2x2': 'grid-cols-2 auto-rows-max',
    '3x3': 'grid-cols-3 auto-rows-max',
    '1+5': 'grid-cols-1 lg:grid-cols-12 auto-rows-max',
    '4x4': 'grid-cols-2 sm:grid-cols-4 auto-rows-max',
    '5x5': 'grid-cols-3 sm:grid-cols-5 auto-rows-max',
    '6x6': 'grid-cols-3 sm:grid-cols-6 auto-rows-max',
    '50-GRID': 'grid-cols-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 auto-rows-max',
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
        swapSlots(data.sourceIndex, targetIndex);
      } else if (data.type === 'camera' && data.camera) {
        assignCameraToSlot(targetIndex, data.camera);
        setSelectedSlotIndex(targetIndex);
      }
    } catch (err) {
      console.warn('Drop parsing failed:', err);
    }
  };

  const renderSlot = (index: number, isMaster: boolean = false) => {
    const camera = slots[index];
    const isDragging = draggedIndex === index;
    const isOver = dragOverIndex === index && draggedIndex !== index;
    const isSelected = selectedSlotIndex === index;

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
        onDoubleClick={() => {
          if (camera && onInspectCamera) {
            onInspectCamera(camera);
          }
        }}
        className={clsx(
          'relative rounded-xl overflow-hidden border transition-all select-none group w-full',
          isMaster ? 'h-full min-h-[300px]' : 'aspect-video min-h-[90px]',
          camera ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
          isSelected
            ? 'border-cyan-400 ring-2 ring-cyan-500/50 shadow-glow-cyan z-10'
            : 'border-slate-800/80 hover:border-slate-700',
          isDragging && 'opacity-40 scale-[0.98] border-dashed border-cyan-400',
          isOver && 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-950/50 shadow-glow-cyan scale-[1.01] z-20'
        )}
      >
        {/* Drag Handle Indicator Pill for active cameras */}
        {camera && (
          <div
            className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 hover:bg-cyan-600/80 text-slate-300 hover:text-white px-1.5 py-0.5 rounded text-[9px] font-mono flex items-center gap-1 border border-slate-700 pointer-events-none shadow-md"
            title="Click & drag to swap; Double click to inspect"
          >
            <GripVertical className="w-3 h-3" />
            <span className="hidden sm:inline">Drag to swap</span>
          </div>
        )}

        {/* Drop Target Overlay Indicator */}
        {isOver && (
          <div className="absolute inset-0 z-40 bg-cyan-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-cyan-300 pointer-events-none animate-in fade-in duration-150">
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
            compact={!isMaster}
            isSelected={isSelected}
            activeAnomaly={activeAnomalies[camera.id] || activeAnomalies[camera.camera_code] || activeAnomalies[(camera as any).code]}
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
  };

  return (
    <div className="w-full h-full min-h-0 p-3 bg-[#060a12] rounded-2xl border border-slate-800/90 shadow-2xl flex flex-col overflow-hidden">
      {layout === '1+5' ? (
        /* Dedicated 1+5 Master + 5 Satellites Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full h-full min-h-0 overflow-y-auto lg:overflow-hidden p-0.5 custom-scrollbar">
          {/* Master Channel (Slot 0) - Takes 8 columns on large displays */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-[340px]">
            {renderSlot(0, true)}
          </div>
          {/* 5 Satellites (Slots 1-5) - Takes 4 columns on large displays */}
          <div 
            style={{ gridAutoRows: 'max-content' }}
            className="lg:col-span-4 grid grid-cols-2 gap-2.5 auto-rows-max min-h-0 overflow-y-auto custom-scrollbar pr-0.5"
          >
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="w-full">
                {renderSlot(idx, false)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Standard Matrix Grid (1x1, 2x2, 3x3, 4x4, 5x5, 6x6, 50-GRID) */
        <div
          style={{ gridAutoRows: 'max-content' }}
          className={clsx(
            'grid gap-2.5 w-full flex-1 min-h-0 overflow-y-auto p-0.5 custom-scrollbar auto-rows-max',
            gridLayoutClasses[layout]
          )}
        >
          {slotKeys.map((index) => renderSlot(index, false))}
        </div>
      )}
    </div>
  );
};
