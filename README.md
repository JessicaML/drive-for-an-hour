# Drive for an Hour - Weather Destination Finder

A React + TypeScript weather application that not only shows your current weather based on browser geolocation, but also finds the warmest destinations within an hour's drive from your location.

## Features

- **Current Weather Display**: Shows real-time weather conditions, temperature, sunrise/sunset times for your location
- **Rain Detection**: Displays visual rain warnings and animations when rain is forecasted in the next 2 hours
- **Interactive Map**: Shows your current location on a grayscale map
- **Warm Destination Finder**: Automatically searches for the top 5 warmest locations within a 1-hour drive
  - Calculates actual driving times using OpenRouteService API
  - Compares temperatures across ~45 nearby locations
  - Displays results ranked by temperature increase
  - Shows driving time and distance for each destination

## Quick Start

```bash
$ npm i
$ npm start
$ npm run build
$ npm test
```

**Requirements:**
- Node version: v18.16.0
- React version: 16.13.1

## Environment Setup

Create a `.env` file in the project root with the following API keys:

```env
REACT_APP_OPENWEATHERMAP_API_KEY="your-openweathermap-api-key"
REACT_APP_OPENROUTESERVICE_API_KEY="your-openrouteservice-api-key"
```

### Getting API Keys

1. **OpenWeatherMap** (required for weather data)
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Free tier: 60 calls/minute, 1,000,000 calls/month

2. **OpenRouteService** (required for driving distance calculations)
   - Sign up at [OpenRouteService](https://openrouteservice.org/dev/#/signup)
   - Free tier: 2,000 requests/day, no credit card required

## Architecture

### Data Flow

```
User Location (Browser Geolocation)
    ↓
useCoordinates Hook (watches position changes)
    ↓
Main App Component
    ↓
    ├─→ Fetch Current Weather (OpenWeatherMap API)
    ├─→ Fetch Weather Forecast (OpenWeatherMap API)
    │   └─→ Check for rain in next 2 hours
    └─→ Find Warm Destinations (Parallel Process)
        ├─→ Generate Grid Coordinates (60 mile radius, 15 mile spacing)
        ├─→ Calculate Driving Times (OpenRouteService Matrix API)
        ├─→ Filter to locations within 60 minutes drive
        ├─→ Fetch Weather for each viable location (OpenWeatherMap API)
        ├─→ Calculate temperature differences
        └─→ Return top 5 warmest destinations
```

### Component Structure

#### Core Components

- **`App.tsx`** - Main application container
  - Manages all state (weather data, rain forecast, warm destinations)
  - Orchestrates data fetching from multiple APIs
  - Conditional rendering based on geolocation availability

- **`LocationCard`** - Displays formatted lat/long coordinates
- **`WeatherCard`** - Shows current weather conditions and temperature
- **`MapComponent`** - Interactive map with rain overlay and animations
- **`WarmDestinationsCard`** - Displays ranked list of warmer destinations

#### Custom Hooks

- **`useCoordinates`** (`src/hooks/useCoordinates.tsx`)
  - Uses browser's `navigator.geolocation.watchPosition()`
  - Returns `{lat, long}` that updates automatically when position changes
  - Initializes to `{lat: 0, long: 0}` as sentinel value before geolocation loads

#### Services

- **`distanceMatrix.tsx`** (`src/services/distanceMatrix.tsx`)
  - Integrates with OpenRouteService Matrix API
  - Calculates driving times from origin to multiple destinations
  - Processes locations in batches of 49 (API limit is 50 including origin)
  - **Important**: OpenRouteService uses `[longitude, latitude]` format!

- **`warmDestinations.tsx`** (`src/services/warmDestinations.tsx`)
  - Fetches weather data for multiple locations in parallel
  - Filters to only locations warmer than current temperature
  - Ranks destinations by temperature increase
  - Returns top N warmest destinations

#### Helper Functions

- **`generateGridCoordinates`** (`src/helpers/generateGridCoordinates.tsx`)
  - Generates a grid of sample coordinates around a center point
  - Default: 60 mile radius with 15 mile spacing (~45 locations)
  - Uses approximate conversion: 1° latitude ≈ 69 miles
  - Adjusts longitude conversion based on latitude: `1° long ≈ 69 × cos(lat) miles`

- **`formatTime`** - Converts Unix timestamps to localized time strings
- **`formatLocation`** - Formats coordinates to 2 decimal places

### API Integration

#### 1. OpenWeatherMap API
**Current Weather:**
```
GET https://api.openweathermap.org/data/2.5/weather
  ?lat={lat}&lon={lon}&units=metric&appid={apiKey}
```

**5-Day Forecast:**
```
GET https://api.openweathermap.org/data/2.5/forecast
  ?lat={lat}&lon={lon}&units=metric&appid={apiKey}
```

#### 2. OpenRouteService Matrix API
```
POST https://api.openrouteservice.org/v2/matrix/driving-car
Headers: {
  Authorization: {apiKey},
  Content-Type: application/json
}
Body: {
  locations: [[lon, lat], ...],  // Note: [longitude, latitude] order!
  metrics: ["distance", "duration"],
  sources: [0],
  destinations: [1, 2, 3, ...]
}
```

### State Management

The app uses React's built-in `useState` and `useEffect` hooks:

```typescript
const [result, setResult] = useState<Value[]>([]);                    // Current weather
const [willRainSoon, setWillRainSoon] = useState<boolean>(false);     // Rain forecast
const [warmDestinations, setWarmDestinations] = useState<WarmDestination[]>([]); // Warm locations
const [loadingDestinations, setLoadingDestinations] = useState<boolean>(false);  // Loading state
```

### Key Design Decisions

1. **Coordinate Sentinel Pattern**:
   - Coordinates initialize to `{lat: 0, long: 0}`
   - `shouldDisplayWeather = coordinate.lat !== 0 || coordinate.long !== 0` determines rendering
   - Prevents premature API calls before geolocation loads

2. **Sequential Weather Fetching**:
   - Current weather loads first
   - Warm destinations search waits for current weather (needs baseline temperature)
   - Prevents race conditions and unnecessary API calls

3. **Grid Sampling Strategy**:
   - 60 mile radius covers ~1 hour of driving in most conditions
   - 15 mile spacing balances API usage vs. coverage
   - Generates ~45 sample points per search

4. **Batch API Requests**:
   - OpenRouteService: Process 49 destinations per request (50 total with origin)
   - Prevents hitting API rate limits
   - Parallel weather fetches for better performance

5. **Browser Compatibility**:
   - Uses `--openssl-legacy-provider` flag (older React Scripts v3.4.3 with newer Node)
   - Requires geolocation permission from user

## File Structure

```
src/
├── components/
│   ├── LocationCard.tsx           # Display current coordinates
│   ├── WeatherCard.tsx            # Display current weather
│   ├── MapComponent.tsx           # Interactive map with rain overlay
│   └── WarmDestinationsCard.tsx   # Display ranked warm destinations
├── services/
│   ├── distanceMatrix.tsx         # OpenRouteService integration
│   └── warmDestinations.tsx       # Weather fetching and ranking logic
├── helpers/
│   ├── generateGridCoordinates.tsx # Grid coordinate generation
│   ├── formatTime.tsx             # Unix timestamp formatting
│   └── formatLocation.tsx         # Coordinate formatting
├── hooks/
│   └── useCoordinates.tsx         # Geolocation hook
├── types.tsx                      # TypeScript interfaces
├── styles.css                     # Global styles
└── App.tsx                        # Main application component
```

## Type Definitions

```typescript
interface Coordinate {
  lat: number;
  long: number;
}

interface WarmDestination {
  lat: number;
  long: number;
  temperature: number;
  temperatureIncrease: number;
  drivingTimeMinutes: number;
  drivingDistanceMiles: number;
  weatherDescription: string;
  weatherMain: string;
}

interface LocationWithDrivingTime extends Coordinate {
  drivingTimeMinutes: number;
  drivingDistanceMiles: number;
}
```

## Performance Considerations

- **API Rate Limits**:
  - OpenWeatherMap: ~46 calls per search (1 current + ~45 destinations)
  - OpenRouteService: 1 call per search (batch request)
  - Total: Well within free tier limits

- **Loading States**:
  - Shows loading indicator while fetching warm destinations
  - Prevents UI blocking with async/await patterns

- **Error Handling**:
  - Graceful degradation if APIs fail
  - Console warnings for missing API keys
  - Skips unreachable locations in distance calculations

## Known Limitations

- OpenWeatherMap API key is currently exposed in source code (should use proxy server for production)
- Grid sampling may miss optimal destinations between sample points
- Driving time estimates don't account for current traffic conditions
- Requires browser geolocation permission
- Desktop/laptop recommended (mobile browser geolocation may be less accurate)

## Future Improvements

- Add map markers for warm destination locations
- Cache API results to reduce redundant calls
- Add user controls for search radius and grid spacing
- Show route visualization on map
- Add filtering by weather type (sunny, clear, etc.)
- Implement backend proxy for API key security
- Add historical weather trends
- Support for multiple transportation modes (cycling, walking)