import React from 'react';
import {Composition, Folder} from 'remotion';
import {AssetComp} from './AssetComp';
import {H, W} from './kit/types';
import {ASSETS} from './registry';

export const FPS = 30;
const THEMES = ['ui', 'science', 'business', 'nature'] as const;

export const Root: React.FC = () => (
  <>
    {THEMES.map((th) => (
      <Folder key={th} name={th}>
        {ASSETS.filter((a) => a.meta.theme === th).map(({meta}) => (
          <Composition key={meta.id} id={meta.id} component={AssetComp} width={W} height={H} fps={FPS} durationInFrames={Math.round(meta.seconds * FPS)} defaultProps={{id: meta.id}} />
        ))}
      </Folder>
    ))}
  </>
);
