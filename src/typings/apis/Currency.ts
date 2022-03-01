interface Currency {
  valid: boolean;
  updated: number;
  base: string;
  rates: {[code: string]: number}
}

export default Currency;
