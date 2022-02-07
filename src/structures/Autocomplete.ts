import AutocompleteType from '../typings/Autocomplete';

export default class Autocomplete {
  constructor(autocompleteOptions: AutocompleteType) {
    Object.assign(this, autocompleteOptions);
  }
}
