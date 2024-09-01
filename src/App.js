import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Select from 'react-select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './App.css';
import Header from './header';
import Footer from './footer';
import { jsPDF } from 'jspdf';

const locations = [
  { value: [-33.9249, 18.4241], label: 'Cape Town' },
  { value: [-33.5821, 19.4475], label: 'Worcester' },
  { value: [-34.0469, 24.6906], label: 'Oudtshoorn' },
  { value: [-34.0833, 18.8667], label: 'Stellenbosch' },

];

const downloadPDF = () => {
  const link = document.createElement('a');
  link.href = `${process.env.PUBLIC_URL}/data.pdf`; 
  link.download = 'data.pdf'; 
  link.click(); 
};


function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState(null);
  const selectRef = useRef(null);


  const fetchWeatherData = async (latitude, longitude) => {
    try {
      const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude,
          longitude,
          hourly: ['temperature_2m', 'precipitation', 'soil_temperature_0cm', 'soil_moisture_0_to_10cm'],
          timezone: 'auto'
        }
      });
      setWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const handleLocationSelect = (selectedOption) => {
    if (selectedOption) {
      const [lat, lon] = selectedOption.value;
      setLocation([parseFloat(lat), parseFloat(lon)]);
      fetchWeatherData(lat, lon);
    } else {
      setLocation(null);
    }
  };

  const prepareGraphData = () => {
    if (!weatherData) return [];
    const hours = weatherData.hourly.time;
    
    const temperatures = weatherData.hourly.temperature_2m;
    const precipitations = weatherData.hourly.precipitation;
    const soilTemperatures = weatherData.hourly.soil_temperature_0cm;
    const soilMoistures = weatherData.hourly.soil_moisture_0_to_10cm;

    console.log("hours: ", hours);
    console.log("temparatures: ", temperatures);
    console.log("precipatitions: ", precipitations);
    console.log("soil temparatures: ", soilTemperatures);
    console.log("soil moistures: ", soilMoistures);




    return hours.map((hour, index) => ({
      hour: hour,
      temperature: temperatures[index],
      precipitation: precipitations[index],
      soilTemperature: soilTemperatures[index],
      soilMoisture: soilMoistures[index],
    }));
  };

  
  

  const graphData = prepareGraphData();



  return (
    <div className="app">
      <Header />
      <div className="app-header">
        <div className="select-container">
          <Select
            ref={selectRef}
            placeholder="Select a location..."
            options={locations}
            onChange={handleLocationSelect}
            isClearable
            menuPortalTarget={document.body}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: 'black',
                fontWeight: 'bold',
                zIndex: 1000,
                position: 'absolute',
                top: '10px',
                left: '10px'
              }),
              singleValue: (base) => ({
                ...base,
                color: 'black'
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999
              })
            }}
          />
        </div>
      </div>
      {location && weatherData && (
        <main>
          <div className="map-container">
            <MapContainer center={location} zoom={8} className="map">
              
              <Marker position={location}>
                <Popup>
                  <h3>Weather Data</h3>
                  <p>Temperature: {weatherData.hourly.temperature_2m[0]} °C</p>
                  <p>Precipitation: {weatherData.hourly.precipitation[0]} mm</p>
                  <p>Soil Temperature: {weatherData.hourly.soil_temperature_0cm[0]} °C</p>
                  <p>Soil Moisture: {weatherData.hourly.soil_moisture_0_to_10cm[0]}</p>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="carousel-container">
            <Carousel showArrows={true} infiniteLoop={true} showThumbs={false}>
              {/* Temperature Chart */}
              <div className="chart-container">
                <h3>Temperature</h3>
                <LineChart
                  width={600}
                  height={300}
                  data={graphData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
                </LineChart>
              </div>
              {/* Precipitation Chart */}
              <div className="chart-container">
                <h3>Precipitation</h3>
                <LineChart
                  width={600}
                  height={300}
                  data={graphData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="precipitation" stroke="#82ca9d" />
                </LineChart>
              </div>
              {/* Soil Temperature & Moisture Chart */}
              <div className="chart-container">
                <h3>Soil Temperature & Moisture</h3>
                <LineChart
                  width={600}
                  height={300}
                  data={graphData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="soilTemperature" stroke="#ff7300" />
                  <Line type="monotone" dataKey="soilMoisture" stroke="#ff0000" />
                </LineChart>
              </div>
            </Carousel>
          </div>
          <button onClick={downloadPDF}>Generate Report</button>
          </main>
      )}
      {/* <Footer /> */}
    </div>
  );
}

export default App;
