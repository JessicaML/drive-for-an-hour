# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript weather application that displays current weather information based on the user's browser geolocation. It uses the OpenWeatherMap API to fetch weather data including temperature, conditions, sunrise, and sunset times.

**Node version**: v18.16.0
**React version**: 16.13.1

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (uses openssl-legacy-provider flag)
npm start

# Build for production
npm run build

# Run tests in watch mode
npm test
```

## Architecture

### Data Flow

1. **Geolocation Hook** (`src/hooks/useCoordinates.tsx`): Uses browser's `navigator.geolocation.watchPosition()` to track user coordinates. Returns `{lat, long}` state that updates when position changes.

2. **Main App Component** (`src/App.tsx`):
   - Consumes coordinates from `useCoordinates` hook
   - Conditionally renders based on whether valid coordinates exist (lat !== 0 || long !== 0)
   - Fetches weather data from OpenWeatherMap API in `useEffect` when coordinates are available
   - Shows loading message until coordinates are obtained

3. **Display Components**:
   - `LocationCard`: Displays formatted latitude/longitude coordinates
   - `WeatherCard`: Displays weather condition, temperature, sunrise/sunset times

### Key Design Decisions

- **Coordinate State Initialization**: Coordinates default to `{lat: 0, long: 0}`. This is used as a sentinel value to determine if geolocation has loaded yet.
- **Conditional Rendering Logic**: `shouldDisplayWeather = coordinate.lat !== 0 || coordinate.long !== 0` determines when to show weather vs loading state.
- **API Key**: Currently hardcoded in `src/App.tsx:19`. Note that there's a `.env` file in the repo but it's not being used for the OpenWeatherMap API key.

### Type Definitions

All TypeScript interfaces are in `src/types.tsx`:
- `Coordinate`: `{lat: number, long: number}`
- `Value`: Shape of OpenWeatherMap API response (weather, temp, sunrise/sunset)

### Helper Functions

- `formatTime(unixTime)`: Converts Unix timestamp to localized time string
- `formatLocation(coordinate)`: Formats coordinates to 2 decimal places

## Testing

Tests use React Testing Library and are located in `src/__tests__/`. The test suite includes basic smoke tests for:
- App container rendering
- LocationCard component
- WeatherCard component

Run tests with `npm test` which launches Jest in watch mode.

## Known Issues

- OpenWeatherMap API key is exposed in the source code (should use environment variables)
- The `.env` file exists but isn't utilized
- `--openssl-legacy-provider` flag is required due to using older React Scripts v3.4.3 with newer Node versions
