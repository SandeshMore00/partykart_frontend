import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

// Replace with your actual coordinates (from your Google Maps share link)
const center = {
  lat: 23.0225, // Ahmedabad latitude (example from previous map)
  lng: 72.5714, // Ahmedabad longitude (example from previous map)
};

const MapComponent = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'YOUR_API_KEY_HERE', // Replace with your Google Maps API key
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
      <Marker position={center} />
    </GoogleMap>
  );
};

export default MapComponent;
