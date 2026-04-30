'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Spot {
  id: number;
  name: string;
  chinese: string;
  category: string;
  price: string;
  rating: number;
  neighborhood: string;
  lat: number;
  lng: number;
  tip?: string;
}

const spots: Spot[] = [
  { id: 1, name: 'Lost Heaven', chinese: '花马天堂', category: 'Food', price: '$$', rating: 4.8, neighborhood: 'French Concession', lat: 31.2150, lng: 121.4550, tip: 'Try the Yunnan-style mushroom hot pot' },
  { id: 2, name: 'Apartment Coffee', chinese: '公寓咖啡', category: 'Coffee', price: '$', rating: 4.9, neighborhood: "Jing'an", lat: 31.2280, lng: 121.4450, tip: 'Hidden in a residential building - ring the bell' },
  { id: 3, name: 'Speak Low', chinese: '低语', category: 'Nightlife', price: '$$', rating: 4.7, neighborhood: 'French Concession', lat: 31.2120, lng: 121.4680, tip: 'Enter through the fake bookshelf' },
  { id: 4, name: 'Yang\'s Dumplings', chinese: '小杨生煎', category: 'Food', price: '$', rating: 4.6, neighborhood: 'Huangpu', lat: 31.2350, lng: 121.4750, tip: 'Go early to avoid the lunch rush' },
  { id: 5, name: 'M50 Art District', chinese: 'M50创意园', category: 'Culture', price: '$', rating: 4.5, neighborhood: 'Putuo', lat: 31.2450, lng: 121.4380, tip: 'Free entry to most galleries' },
  { id: 6, name: 'Tianzifang', chinese: '田子坊', category: 'Shopping', price: '$$', rating: 4.4, neighborhood: 'Xuhui', lat: 31.2080, lng: 121.4650, tip: 'Skip the main alleys, explore the back lanes' },
  { id: 7, name: 'Fuxing Park', chinese: '复兴公园', category: 'Culture', price: '$', rating: 4.7, neighborhood: 'French Concession', lat: 31.2180, lng: 121.4580, tip: 'Come at dawn for tai chi with locals' },
  { id: 8, name: 'Bar Rouge', chinese: '外滩红酒吧', category: 'Nightlife', price: '$$$', rating: 4.6, neighborhood: 'The Bund', lat: 31.2400, lng: 121.4900, tip: 'Best views of Pudong skyline at sunset' },
  { id: 9, name: 'Jia Jia Tang Bao', chinese: '佳家汤包', category: 'Food', price: '$', rating: 4.8, neighborhood: 'Huangpu', lat: 31.2320, lng: 121.4720, tip: 'The crab roe xiaolongbao is worth the wait' },
  { id: 10, name: 'Seesaw Coffee', chinese: 'Seesaw咖啡', category: 'Coffee', price: '$$', rating: 4.6, neighborhood: "Jing'an", lat: 31.2250, lng: 121.4500, tip: 'Local specialty coffee pioneer' },
  { id: 11, name: 'The Nest', chinese: '雀巢', category: 'Nightlife', price: '$$', rating: 4.5, neighborhood: 'French Concession', lat: 31.2100, lng: 121.4520, tip: 'Great rooftop vibes on weekends' },
  { id: 12, name: 'Propaganda', chinese: '前进', category: 'Nightlife', price: '$', rating: 4.3, neighborhood: 'French Concession', lat: 31.2140, lng: 121.4490, tip: 'Student favorite - cheap drinks Wednesday' },
  { id: 13, name: 'Din Tai Fung', chinese: '鼎泰丰', category: 'Food', price: '$$', rating: 4.7, neighborhood: 'Xuhui', lat: 31.1950, lng: 121.4350, tip: 'More upscale xiaolongbao experience' },
  { id: 14, name: 'Power Station of Art', chinese: '上海当代艺术博物馆', category: 'Culture', price: '$', rating: 4.6, neighborhood: 'Huangpu', lat: 31.2050, lng: 121.4950, tip: 'Free on most days, check the exhibitions' },
];

interface LeafletMapProps {
  selectedCategory: string;
  selectedBudget: string | null;
}

export default function LeafletMap({ selectedCategory, selectedBudget }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const filteredSpots = spots.filter(spot => {
    const categoryMatch = selectedCategory === 'All' || spot.category === selectedCategory;
    const budgetMatch = !selectedBudget || spot.price === selectedBudget;
    return categoryMatch && budgetMatch;
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [31.2222, 121.4580],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Position zoom control
    map.zoomControl.setPosition('topright');

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Custom icon
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #000;
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add markers for filtered spots
    filteredSpots.forEach(spot => {
      const marker = L.marker([spot.lat, spot.lng], { icon: customIcon });
      
      // Popup content
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 180px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <div>
              <div style="font-weight: 600; font-size: 14px; color: #000;">${spot.name}</div>
              <div style="font-size: 12px; color: #666;">${spot.chinese}</div>
            </div>
            <span style="font-size: 11px; padding: 2px 8px; background: #f0f0f0; border-radius: 12px; font-weight: 500;">
              ${spot.price}
            </span>
          </div>
          <div style="font-size: 11px; color: #888; display: flex; gap: 8px;">
            <span>★ ${spot.rating}</span>
            <span>•</span>
            <span>${spot.category}</span>
          </div>
          ${spot.tip ? `<div style="font-size: 11px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">💡 ${spot.tip}</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-popup',
        closeButton: false,
        offset: [0, -5],
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [filteredSpots]);

  return (
    <>
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 12px 14px;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
        }
        .leaflet-control-zoom a {
          background: #1a1a1a !important;
          color: white !important;
          border: none !important;
        }
        .leaflet-control-zoom a:hover {
          background: #333 !important;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
}
