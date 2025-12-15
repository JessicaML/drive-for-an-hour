export interface Coordinate {
    lat: number;
    long: number;
  }

export interface Value {
  id: number,
  main: {
    temp: number
  },
  name: string,
  weather:
    [
      { description: string;
        main: string
      }
    ];
  sys: {
    sunrise: number;
    sunset: number;
  };
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
  };
  weather: [
    {
      main: string;
      description: string;
    }
  ];
}

export interface ForecastData {
  list: ForecastItem[];
}

export interface WarmDestination {
  lat: number;
  long: number;
  temperature: number;
  temperatureIncrease: number;
  drivingTimeMinutes: number;
  drivingDistanceMiles: number;
  weatherDescription: string;
  weatherMain: string;
  locationName: string;
}