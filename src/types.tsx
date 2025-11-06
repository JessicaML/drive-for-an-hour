export interface Coordinate {
    lat: number;
    long: number;
  }

export interface Value {
  id: number,
  main: {
    temp: number
  },
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