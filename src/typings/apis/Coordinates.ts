// interface Coordinates {
//   Message: string;
//   score: number;
//   manicipality: string;
//   countryCode: string;
//   lat: number;
//   lon: number;
// }

interface Coordinates {
  confidence: number;
  components: {
    country: string;
    city: string;
    state: string;
    town: string;
  }
  geometry: {
    lat: number;
    lng: number;
  };
}

export default Coordinates;
