import { useEffect, useRef } from 'react';

import { Loader } from '@googlemaps/js-api-loader';

// load firebase databse and pull property locations for map markers

function Map() {
  const googlemap = useRef(HTMLDivElement.prototype);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLEAPIS_KEY || '',
      version: 'weekly',
    });
    let map;
    loader.load().then(() => {
      const google = window.google;
      map = new google.maps.Map(googlemap.current, {
        center: { lat: 36.1716, lng: -115.1391 },
        zoom: 8,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
      });

      new google.maps.Marker({
        position: { lat: 36.1716, lng: -115.1391 },
        map,
        title: 'Hello World!',
      });
    });
  });

  return <div id="map" style={{width: '100%', height: '600px'}} ref={googlemap} />;
}

export default Map;
