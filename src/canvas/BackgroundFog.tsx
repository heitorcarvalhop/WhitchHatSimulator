import './background-fog.css';

export interface BackgroundFogProps {
  intensity: 'low' | 'medium' | 'high' | 'ultra';
  reducedMotion: boolean;
}

export function BackgroundFog({ intensity, reducedMotion }: BackgroundFogProps) {
  const blobCount = intensity === 'low' ? 2 : intensity === 'medium' ? 3 : 4;

  return (
    <div
      className={`background-fog ${reducedMotion ? 'background-fog--static' : ''}`}
      aria-hidden="true"
    >
      <div className="background-fog__stars" />
      {Array.from({ length: blobCount }, (_, i) => (
        <div key={i} className={`background-fog__blob background-fog__blob--${i + 1}`} />
      ))}
      <div className="background-fog__vignette" />
    </div>
  );
}
