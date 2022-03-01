interface MeasurementUnitsAttributes {
  id: number;
  type: 'currency' |'area' | 'temperature' |
        'time' | 'speed' | 'length' | 'mass' |
        'angle' | 'pressure' | 'volume' |
        'storage' | 'frequency' | 'energy';
  base: boolean;

  full_name: string;
  short_name: string;
  plural_name: string;
  symbol: string;

  convert_source: string;
  convert_target: string;
  convert_value: number;
}

export default MeasurementUnitsAttributes;
