export interface F1Round {
  name: string;                   // FORMULA 1 GULF AIR BAHRAIN GRAND PRIX 2022
  type: string;                   // Round
  round: number;                  // 1
  url: string;                    // https://www.formula1.com/en/racing/2022/Bahrain.html
  image: string;                  // https://www.formula1.com/content/dam/fom-website/races/2022/Bahrain_Grand_Prix.png
  time_start: string;             // 2022-03-18T15:00:00
  time_end: string;               // 2022-03-20T20:00:00
  status: string;                 // EventScheduled
  country: string;                // Bahrain
  city: string;                   // Sakhir
  track: F1Track | null;
  sessions: F1Session[];
  results: F1Result[];
}

export interface F1Track {
  name: string;                   // Circuit de Barcelona-Catalunya
  country: string;                // Bahrain
  country_flag: string;           // https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/bahrain-flag.png
  city: string;                   // Sakhir
  image: string;                  // https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Spain_Circuit.png
  laps: number;                   // 66
  lap_length: number;             // 4.675
}

export interface F1Session {
  name: string;                   // Practice 1
  image: string;                  // https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Bahrain.jpg
  time_start: string;             // 2022-03-18T15:00:00
  time_end: string;               // 2022-03-20T20:00:00
  status: string;                 // EventScheduled
}

export interface F1Result {
  finish_position: number;        // 1
  grid_position: number;          // 2
  driver: {
    number: number;               // 44
    code: string;                 // HAM
    name: string;                 // Lewis Hamilton
  }
  points: number;                 // 25
  laps: number;                   // 56
  status: string;                 // Finished
  total_time: number; //(ms)      // 5523897
  fastest_lap: boolean;           // false
  lap_fastest: {
    position: number;             // 4
    lap: number;                  // 44
    time: string;                 // 1:34.015
    speed: number; // (kmph)      // 207.235
  }
}

export interface F1DriverStanding {
  position: number;               // 1
  points: number;                 // 395.5
  wins: number;                   // 10
  driver: {
    code: string;                 // VER
    name: string;                 // Max Verstappen
  }
}

export interface F1ConstructorStanding {
  position: number;               // 1
  points: number;                 // 613.5
  wins: number;                   // 9
  constructor: string;            // Mercedes
}
