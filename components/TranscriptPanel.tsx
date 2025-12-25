'use client';

import { TranscriptSegment } from '@/types';
import { formatTimestamp, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useEffect, useRef } from 'react';

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  highlightedSegments: string[];
  onSegmentClick: (segmentId: string) => void;
  activeSegmentId?: string;
}

export function TranscriptPanel({
  segments,
  highlightedSegments,
  onSegmentClick,
  activeSegmentId,
}: TranscriptPanelProps) {
  const segmentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (activeSegmentId && segmentRefs.current[activeSegmentId]) {
      segmentRefs.current[activeSegmentId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeSegmentId]);

  return (
    <div className="flex flex-col h-full lg:border-r">
      <div className="p-3 lg:p-4 border-b bg-muted/50">
        <h2 className="text-base lg:text-lg font-semibold">Session Transcript</h2>
        <p className="text-xs lg:text-sm text-muted-foreground mt-1">
          Click on a segment to see related notes
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 lg:p-4 space-y-3 lg:space-y-4">
          {segments.map((segment) => {
            const isHighlighted = highlightedSegments.includes(segment.id);
            const isActive = activeSegmentId === segment.id;
            
            return (
              <div
                key={segment.id}
                ref={(el) => {
                  segmentRefs.current[segment.id] = el;
                }}
                className={cn(
                  'p-3 lg:p-4 rounded-lg border transition-all cursor-pointer group',
                  'hover:border-primary/50 hover:shadow-sm',
                  isHighlighted && 'bg-primary/10 border-primary shadow-md',
                  isActive && 'ring-2 ring-primary',
                  !isHighlighted && 'bg-card'
                )}
                onClick={() => onSegmentClick(segment.id)}
                role="button"
                tabIndex={0}
                aria-label={`Transcript segment by ${segment.speaker} at ${formatTimestamp(segment.start_ms)}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSegmentClick(segment.id);
                  }
                }}
              >
                <div className="flex items-center gap-1.5 lg:gap-2 mb-1.5 lg:mb-2">
                  <Badge
                    variant={segment.speaker === 'clinician' ? 'default' : 'secondary'}
                    className={cn(
                      'text-[10px] lg:text-xs font-medium',
                      segment.speaker === 'clinician' 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    )}
                  >
                    {segment.speaker === 'clinician' ? 'Clinician' : 'Patient'}
                  </Badge>
                  <span className="text-[10px] lg:text-xs text-muted-foreground font-mono">
                    {formatTimestamp(segment.start_ms)}
                  </span>
                </div>
                <p className="text-xs lg:text-sm leading-relaxed">{segment.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

