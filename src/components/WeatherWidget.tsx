import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Cloud, CloudLightning, Wind, Droplets, ShieldAlert, CheckCircle, Search, MapPin, Loader2, Sparkles, Sprout, Thermometer } from 'lucide-react';

interface WeatherDay {
  day: string;
  temp: number;
  condition: 'Sunny' | 'Rainy' | 'Overcast' | 'Thunderstorm';
  humidity: number;
  wind: number;
  rainChance: number;
}

interface RegionData {
  id: string;
  name: string;
  state: string;
  cropSpecialty: string;
  currentTemp: number;
  condition: 'Sunny' | 'Rainy' | 'Overcast' | 'Thunderstorm';
  humidity: number;
  wind: number;
  soilMoisture: string;
  advisory: {
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
  };
  forecast: WeatherDay[];
}

// Pre-seeded Indian cities with coordinates
const PRESEEDED_CITIES = [
  { name: 'Bhatinda', state: 'Punjab', lat: 30.2068, lon: 74.9517, specialty: 'Wheat & Cotton Belt' },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898, specialty: 'Grape & Onion Capital' },
  { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365, specialty: 'Chili & Tobacco Hub' },
  { name: 'Hassan', state: 'Karnataka', lat: 13.0072, lon: 76.1026, specialty: 'Cardamom & Coffee Belt' },
  { name: 'Bareilly', state: 'Uttar Pradesh', lat: 28.364, lon: 79.415, specialty: 'Sugarcane & Rice Zone' },
  { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734, specialty: 'Premium Temperate Orchards' },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lon: 72.8777, specialty: 'Coastal Rice & Vegetables' },
  { name: 'Delhi', state: 'Delhi', lat: 28.6139, lon: 77.209, specialty: 'Horticulture & Dairy Belt' },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, specialty: 'Ragi, Coconut & Silk Hub' }
];

function getCropSpecialtyAndSoil(cityName: string, stateName: string): { cropSpecialty: string; soilMoisture: string } {
  const city = cityName.toLowerCase();
  const state = stateName?.toLowerCase() || '';

  if (city.includes('bhatinda') || state.includes('punjab') || state.includes('h हरियाणा') || state.includes('haryana')) {
    return { cropSpecialty: 'Wheat, Cotton & Rice Belt', soilMoisture: 'Adequate (18%)' };
  }
  if (city.includes('nashik') || city.includes('pune') || state.includes('maharashtra')) {
    return { cropSpecialty: 'Grape, Onion & Sugarcane Capital', soilMoisture: 'High (26%)' };
  }
  if (city.includes('guntur') || state.includes('andhra') || state.includes('telangana')) {
    return { cropSpecialty: 'Chili, Tobacco & Cotton Hub', soilMoisture: 'Optimal (21%)' };
  }
  if (state.includes('karnataka') || city.includes('bengaluru') || city.includes('hassan')) {
    return { cropSpecialty: 'Coffee, Cardamom, Ragi & Silk', soilMoisture: 'Moderate (23%)' };
  }
  if (state.includes('himachal') || state.includes('jammu') || city.includes('shimla') || state.includes('uttarakhand')) {
    return { cropSpecialty: 'Premium Apple & Temperate Orchards', soilMoisture: 'Excellent (19%)' };
  }
  if (state.includes('uttar pradesh') || state.includes('bihar') || city.includes('bareilly') || city.includes('lucknow')) {
    return { cropSpecialty: 'Sugarcane, Wheat & Mustard Hub', soilMoisture: 'Adequate (20%)' };
  }
  if (state.includes('gujarat') || city.includes('ahmedabad') || city.includes('surat')) {
    return { cropSpecialty: 'Groundnut, Cotton & Castor Belt', soilMoisture: 'Dry (14%)' };
  }
  if (state.includes('tamil nadu') || city.includes('chennai') || city.includes('coimbatore')) {
    return { cropSpecialty: 'Paddy, Coconut & Turmeric Zone', soilMoisture: 'Optimal (22%)' };
  }
  if (state.includes('assam') || state.includes('west bengal') || city.includes('darjeeling') || city.includes('kolkata')) {
    return { cropSpecialty: 'Tea Gardens & Rice Paddy Fields', soilMoisture: 'High (29%)' };
  }
  return { cropSpecialty: 'Diversified Agri-Climate Zone', soilMoisture: 'Optimal (20%)' };
}

function generateDynamicAdvisory(
  cityName: string,
  temp: number,
  humidity: number,
  condition: string,
  windSpeed: number
): { type: 'success' | 'warning' | 'info'; title: string; description: string } {
  if (condition === 'Rainy' || condition === 'Thunderstorm') {
    return {
      type: 'warning',
      title: `Precipitation Protection for ${cityName}`,
      description: 'Active rainfall detected. Postpone any scheduled fertilizer drenching or chemical sprays immediately. Ensure all drain ditches are clear to prevent waterlogging around root systems.'
    };
  }

  if (temp > 38) {
    return {
      type: 'warning',
      title: 'Heat Stress Advisory',
      description: `Extreme temperature of ${temp}°C detected. Increase watering cycles for early-stage seedlings. Apply organic straw mulch to protect topsoil from drying and cracking.`
    };
  }

  if (humidity > 80) {
    return {
      type: 'info',
      title: 'Fungal Pathogen Risk',
      description: `High atmospheric relative humidity (${humidity}%) poses elevated risk of downy mildew or blast disease. Monitor leaf undersides closely and maintain adequate plant spacing.`
    };
  }

  if (windSpeed > 18) {
    return {
      type: 'warning',
      title: 'High Wind Foliar Alert',
      description: `Wind speed is currently high (${windSpeed} km/h). Avoid foliar fertilizer application as wind drift will significantly reduce absorption and lead to expensive chemical waste.`
    };
  }

  return {
    type: 'success',
    title: 'Optimal Farming Window',
    description: `Highly favorable weather at ${temp}°C with moderate humidity. Perfect conditions for general tilling, transplanting vegetable crops, organic weeding, and harvesting.`
  };
}

// Convert WMO code to friendly conditions
function mapWmoToCondition(code: number): 'Sunny' | 'Rainy' | 'Overcast' | 'Thunderstorm' {
  if (code === 0 || code === 1) return 'Sunny';
  if ([2, 3, 45, 48, 71, 73, 75, 77, 85, 86].includes(code)) return 'Overcast';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Rainy'; // fallback for all rain and shower codes
}

export default function WeatherWidget() {
  const [activeCity, setActiveCity] = useState(PRESEEDED_CITIES[0]);
  const [weatherData, setWeatherData] = useState<RegionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFahrenheit, setIsFahrenheit] = useState(false);

  // Fetch Weather for selected coordinates
  const fetchWeather = async (cityName: string, stateName: string, lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,weather_code,precipitation_probability_max&timezone=Asia%2FKolkata`
      );
      if (!response.ok) throw new Error('Failed to retrieve forecast data from Open-Meteo');
      const data = await response.json();

      const currentTemp = Math.round(data.current.temperature_2m);
      const humidity = Math.round(data.current.relative_humidity_2m);
      const wind = Math.round(data.current.wind_speed_10m);
      const condition = mapWmoToCondition(data.current.weather_code);

      const { cropSpecialty, soilMoisture } = getCropSpecialtyAndSoil(cityName, stateName);
      const advisory = generateDynamicAdvisory(cityName, currentTemp, humidity, condition, wind);

      // Generate 5-day forecast
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const forecast: WeatherDay[] = data.daily.time.slice(0, 5).map((dateStr: string, idx: number) => {
        const date = new Date(dateStr);
        const dayName = days[date.getDay()];
        return {
          day: dayName,
          temp: Math.round(data.daily.temperature_2m_max[idx]),
          condition: mapWmoToCondition(data.daily.weather_code[idx]),
          humidity: Math.max(45, humidity - (idx * 3)),
          wind: Math.max(6, wind + (idx % 2 === 0 ? 2 : -2)),
          rainChance: Math.round(data.daily.precipitation_probability_max[idx] || 0)
        };
      });

      setWeatherData({
        id: `lat-${lat.toFixed(2)}-lon-${lon.toFixed(2)}`,
        name: cityName,
        state: stateName || 'India',
        cropSpecialty,
        currentTemp,
        condition,
        humidity,
        wind,
        soilMoisture,
        advisory,
        forecast
      });
    } catch (err: any) {
      console.error(err);
      setError('Weather service temporarily busy. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on query change
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=10&language=en&format=json`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.results) {
            // Filter only results from India
            const indianResults = data.results.filter((res: any) => res.country_code === 'IN' || res.country === 'India');
            setSearchResults(indianResults);
            setShowDropdown(indianResults.length > 0);
          } else {
            setSearchResults([]);
          }
        }
      } catch (err) {
        console.error('Error searching cities:', err);
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Initial fetch
  useEffect(() => {
    fetchWeather(activeCity.name, activeCity.state, activeCity.lat, activeCity.lon);
  }, [activeCity]);

  const handleSelectCity = (city: any) => {
    const selected = {
      name: city.name,
      state: city.admin1 || 'India',
      lat: city.latitude,
      lon: city.longitude,
      specialty: getCropSpecialtyAndSoil(city.name, city.admin1 || '').cropSpecialty
    };
    setActiveCity(selected);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const formatTemp = (celsius: number) => {
    if (isFahrenheit) {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  const getWeatherIcon = (condition: string, className = "h-6 w-6") => {
    switch (condition) {
      case 'Sunny':
        return <Sun className={`${className} text-amber-500 animate-spin-slow`} />;
      case 'Rainy':
        return <CloudRain className={`${className} text-sky-500`} />;
      case 'Thunderstorm':
        return <CloudLightning className={`${className} text-indigo-500`} />;
      case 'Overcast':
      default:
        return <Cloud className={`${className} text-stone-400`} />;
    }
  };

  const getCardBg = (condition: string) => {
    switch (condition) {
      case 'Sunny':
        return 'bg-gradient-to-br from-amber-50/70 via-stone-50 to-emerald-50/40 border-amber-100';
      case 'Rainy':
        return 'bg-gradient-to-br from-sky-50/70 via-stone-50 to-teal-50/40 border-sky-100';
      case 'Thunderstorm':
        return 'bg-gradient-to-br from-indigo-50/70 via-stone-50 to-slate-50 border-indigo-100';
      case 'Overcast':
      default:
        return 'bg-gradient-to-br from-stone-50 via-stone-50/80 to-stone-100/50 border-stone-200/60';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md overflow-hidden transition-all duration-300">
      {/* Header section with live search */}
      <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl shadow-xs">
            <Sprout className="h-6 w-6 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-stone-900 leading-tight flex items-center gap-2">
              Farmer Weather & Agronomy Portal
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-md tracking-wider">
                <Sparkles className="h-3 w-3 animate-bounce" /> Live India API
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">Search and view real-time meteorological advisories for any Indian agricultural city</p>
          </div>
        </div>

        {/* Search Controls */}
        <div className="flex flex-wrap items-center gap-3 relative">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search any Indian city (e.g. Pune, Bhatinda)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs placeholder-stone-400"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
              </div>
            )}

            {/* Dropdown Results list */}
            {showDropdown && searchResults.length > 0 && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-stone-100">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectCity(result)}
                      className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-stone-850 block truncate">{result.name}</span>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          {result.admin1 ? `${result.admin1}, ` : ''}India
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-semibold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-md">
                        {result.latitude.toFixed(2)}°N, {result.longitude.toFixed(2)}°E
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Unit Toggle */}
          <button
            onClick={() => setIsFahrenheit(!isFahrenheit)}
            className="px-3.5 py-2 border border-stone-200 bg-white hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-600 transition-colors shrink-0 shadow-xs"
          >
            {isFahrenheit ? 'Show °C' : 'Show °F'}
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        
        {/* Left column: Quick Select Pre-seeded cities */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-stone-100 bg-stone-50/30 max-h-[460px] overflow-y-auto divide-y divide-stone-100">
          <div className="px-4 py-3 bg-stone-50/60 border-b border-stone-100">
            <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest block">Quick Agri-Hubs Select</span>
          </div>
          {PRESEEDED_CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => setActiveCity(city)}
              className={`w-full text-left px-5 py-4 transition-all flex items-center justify-between gap-3 border-l-4 ${
                activeCity.name === city.name 
                  ? 'bg-emerald-50/50 text-emerald-950 font-bold border-l-emerald-600' 
                  : 'hover:bg-stone-50 text-stone-650 border-l-transparent'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <MapPin className={`h-3.5 w-3.5 shrink-0 ${activeCity.name === city.name ? 'text-emerald-600' : 'text-stone-400'}`} />
                  <span className="text-xs font-bold truncate">{city.name}, {city.state}</span>
                </div>
                <span className="text-[10px] text-stone-500 block mt-1 font-medium truncate">{city.specialty}</span>
              </div>
              {activeCity.name === city.name && loading ? (
                <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
              ) : (
                <span className="text-[9px] font-mono text-stone-400 shrink-0">
                  {city.lat.toFixed(1)}°N
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right column: Dynamic weather display & advice */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          {loading && !weatherData ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
              <h4 className="font-bold text-stone-800 text-sm">Fetching Live Weather Coordinates...</h4>
              <p className="text-xs text-stone-400 max-w-xs">Connecting to Open-Meteo services to construct agronomic forecasting models.</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3 bg-rose-50/20">
              <ShieldAlert className="h-10 w-10 text-rose-500" />
              <h4 className="font-bold text-rose-900 text-sm">{error}</h4>
              <p className="text-xs text-stone-500 max-w-sm">Please make sure you have internet access or choose another Indian city hub.</p>
              <button
                onClick={() => fetchWeather(activeCity.name, activeCity.state, activeCity.lat, activeCity.lon)}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors mt-2"
              >
                Retry Request
              </button>
            </div>
          ) : weatherData ? (
            <div className={`p-6 flex-1 flex flex-col justify-between ${getCardBg(weatherData.condition)} transition-all duration-300`}>
              <div>
                {/* Meta details & header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-100/90 text-emerald-800 text-[9px] font-extrabold uppercase tracking-wider rounded-md">
                        {weatherData.cropSpecialty}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">GPS: {activeCity.lat.toFixed(4)}°N, {activeCity.lon.toFixed(4)}°E</span>
                    </div>
                    <h2 className="text-2xl font-black text-stone-900 mt-1 flex items-center gap-1.5 font-display tracking-tight">
                      {weatherData.name} <span className="text-stone-500 text-lg font-medium">({weatherData.state})</span>
                    </h2>
                  </div>

                  {/* Temp Display */}
                  <div className="flex items-center gap-3.5 bg-white/60 backdrop-blur-xs border border-white/80 p-3 rounded-2xl shadow-xs">
                    {getWeatherIcon(weatherData.condition, "h-14 w-14")}
                    <div>
                      <span className="text-3xl font-black font-display text-stone-900 leading-none block">
                        {formatTemp(weatherData.currentTemp)}
                      </span>
                      <span className="text-xs font-bold text-stone-500 mt-1.5 block">{weatherData.condition} Today</span>
                    </div>
                  </div>
                </div>

                {/* Local Microclimate stats */}
                <div className="grid grid-cols-3 gap-3.5 my-6">
                  <div className="bg-white/95 backdrop-blur-xs border border-stone-100 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                    <div className="p-1.5 bg-sky-50 text-sky-600 rounded-xl">
                      <Droplets className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 block font-bold uppercase tracking-widest">Air Humidity</span>
                      <span className="text-sm font-black text-stone-800 mt-0.5 block">{weatherData.humidity}%</span>
                    </div>
                  </div>

                  <div className="bg-white/95 backdrop-blur-xs border border-stone-100 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded-xl">
                      <Wind className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 block font-bold uppercase tracking-widest">Wind Speed</span>
                      <span className="text-sm font-black text-stone-800 mt-0.5 block">{weatherData.wind} km/h</span>
                    </div>
                  </div>

                  <div className="bg-white/95 backdrop-blur-xs border border-stone-100 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Sprout className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 block font-bold uppercase tracking-widest">Soil Moisture</span>
                      <span className="text-sm font-black text-emerald-800 mt-0.5 block">{weatherData.soilMoisture}</span>
                    </div>
                  </div>
                </div>

                {/* Dynamically calculated Agronomy Advisory Panel */}
                <div className={`p-4 rounded-2xl border mb-6 flex gap-3.5 shadow-xs ${
                  weatherData.advisory.type === 'warning' 
                    ? 'bg-rose-50/80 border-rose-100/60 text-rose-950 animate-pulse' 
                    : weatherData.advisory.type === 'info'
                    ? 'bg-amber-50/75 border-amber-100/60 text-amber-950'
                    : 'bg-emerald-50/80 border-emerald-100/60 text-emerald-950'
                }`}>
                  <div className="shrink-0 mt-0.5">
                    {weatherData.advisory.type === 'warning' ? (
                      <ShieldAlert className="h-5.5 w-5.5 text-rose-600 animate-bounce" />
                    ) : weatherData.advisory.type === 'info' ? (
                      <ShieldAlert className="h-5.5 w-5.5 text-amber-600" />
                    ) : (
                      <CheckCircle className="h-5.5 w-5.5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      Agronomic Advisory: {weatherData.advisory.title}
                    </h4>
                    <p className="text-xs text-stone-700 mt-1 leading-relaxed font-medium">
                      {weatherData.advisory.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* 5-Day forecast outlook with live day-of-week dates */}
              <div>
                <h4 className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                  <Thermometer className="h-3.5 w-3.5 text-stone-400" /> 5-Day Farming Outlook Forecast
                </h4>
                <div className="grid grid-cols-5 gap-3">
                  {weatherData.forecast.map((fc, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white/80 hover:bg-white border border-stone-100/60 p-3 rounded-2xl text-center flex flex-col items-center justify-between gap-2.5 transition-all shadow-xs"
                    >
                      <span className="text-[10px] font-black text-stone-500 uppercase">{fc.day}</span>
                      {getWeatherIcon(fc.condition, "h-6 w-6 my-0.5")}
                      <span className="text-xs font-extrabold text-stone-900 font-mono">{formatTemp(fc.temp)}</span>
                      
                      {/* Rain chance pill */}
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg ${
                        fc.rainChance > 50 
                          ? 'bg-sky-50 text-sky-600' 
                          : fc.rainChance > 20
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-stone-50 text-stone-400'
                      }`}>
                        {fc.rainChance}% 🌧️
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
