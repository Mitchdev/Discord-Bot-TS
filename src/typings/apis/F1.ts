export interface F1Event {
  name: string;
  type: 'Testing' | 'Round';
  round: number;
  country: string;
  country_flag: string;
  city: string;
  image: string;
  track: F1Track;
  sessions: F1Session[];
}

interface F1Track {
  name: string;
  image: string;
  image_detailed: string;
  first_gp: number;
  laps: number;
  circuit_length: number;
  race_length: number;
  lap_record: {
    time: number;
    driver: string;
    year: number;
  }
}

export interface F1Session {
  name: string;
  time_start: string;
  time_end: string;
}

export interface F1Team {
  short_name: string;
  full_name: string;
  constructor: string;
  location: string;
  color: string;
  short_logo: string;
  full_logo: string;
  team_chief: string;
  technical_chief: string;
  first_entry: number;
  championships: number;
  car: {
    name: string;
    image: string;
    chassis: string;
    power_unit: string;
  },
  drivers: F1Driver[];
}

export interface F1Driver {
  full_name: string;
  short_name: string;
  number: number;
  number_image: string;
  nationality: string;
  country: string;
  country_flag: string;
  helmet: string;
  image: string;
  image_front: string;
  championships: number;
  date_of_birth: string;
}
