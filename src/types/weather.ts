export interface Weather {
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  precipitationProbabilityPercent: number;
  condition:
    | "Sunny"
    | "Clear"
    | "Partly Cloudy"
    | "Mostly Cloudy"
    | "Cloudy"
    | "Light Rain"
    | "Rainy"
    | "Rain Expected"
    | "Thunderstorm"
    | "Foggy"
    | "Haze"
    | string;
  icon: string;
  timestamp: string;
}

export interface StationWeather {
  stationCode: string;
  stationName: string;
  eta: string;
  weather: Weather;
}

export interface RouteWeatherForecast {
  currentStationWeather?: StationWeather;
  nextStationWeather?: StationWeather;
  destinationWeather?: StationWeather;
  enRouteStations: StationWeather[];
  rainAlongRouteAlert?: string;
}
