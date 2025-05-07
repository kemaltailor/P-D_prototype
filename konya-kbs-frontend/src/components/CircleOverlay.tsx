import React from 'react';
import { Source, Layer } from 'react-map-gl';
import * as turf from '@turf/turf';

interface CircleOverlayProps {
  center: [number, number];
  radiusInKm: number;
}

const CircleOverlay: React.FC<CircleOverlayProps> = ({ center, radiusInKm }) => {
  // Turf ile çember oluştur
  const circle = turf.circle(center, radiusInKm, {
    steps: 64,
    units: 'kilometers',
  });

  return (
    <Source id="circle-source" type="geojson" data={circle}>
      <Layer
        id="circle-fill"
        type="fill"
        paint={{
          'fill-color': '#007cbf',
          'fill-opacity': 0.3,
        }}
      />
      <Layer
        id="circle-outline"
        type="line"
        paint={{
          'line-color': '#007cbf',
          'line-width': 2,
        }}
      />
    </Source>
  );
};

export default CircleOverlay; 