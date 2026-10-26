import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {H, W} from './kit/types';
import {ASSETS} from './registry';

/** Satu aset: latar transparan, p = frame / durasi (loop mulus). */
export const AssetComp: React.FC<{id: string; bg?: string}> = ({id, bg}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const mod = ASSETS.find((a) => a.meta.id === id);
  if (!mod) throw new Error(`Aset ${id} tidak ada`);
  const {Draw} = mod;
  return (
    <AbsoluteFill style={{background: bg ?? 'transparent'}}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{display: 'block'}}>
        <Draw p={frame / durationInFrames} />
      </svg>
    </AbsoluteFill>
  );
};
