interface Weather {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: WeatherCurrent;
  minutely?: WeatherMinutely[];
  hourly: WeatherHourly[];
  daily: WeatherDaily[];
  alerts?: WeatherAlerts[];
}

interface WeatherCurrent {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_gust?: number;
  wind_deg: number;
  rain?: WeatherRainSnow;
  snow?: WeatherRainSnow;
  weather: WeatherCondition;
}

interface WeatherRainSnow {
  '1h': number;
}

interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface WeatherMinutely {
  dt: number;
  precipitation: number;
}

interface WeatherHourly {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_gust?: number;
  wind_deg: number;
  pop: number;
  rain?: WeatherRainSnow;
  snow?: WeatherRainSnow;
  weather: WeatherCondition;
}

interface WeatherDaily {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  temp: WeatherDailyTemp;
  feels_like: WeatherDailyFeelsLike;
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_gust?: number;
  wind_deg: number;
  clouds: number;
  pop: number;
  rain?: WeatherRainSnow;
  snow?: WeatherRainSnow;
  weather: WeatherCondition;
}

interface WeatherDailyTemp {
  morn: number;
  day: number;
  eve: number;
  night: number;
  min: number;
  max: number;
}

interface WeatherDailyFeelsLike {
  morn: number;
  day: number;
  eve: number;
  night: number;
}

interface WeatherAlerts {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

export default Weather;
