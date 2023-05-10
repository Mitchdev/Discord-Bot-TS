import UtilitiesType from '../typings/Utilities';

import addTempRole from '../utilities/addTempRole';
import blankField from '../utilities/blankField';
import capitalize from '../utilities/capitalize';
import commaNumber from '../utilities/commaNumber';
import durationToSeconds from '../utilities/durationToSeconds';
import followRedirect from '../utilities/followRedirect';
import hexToInt from '../utilities/hexToInt';
import randomString from '../utilities/randomString';
import removeTempRole from '../utilities/removeTempRole';
import rgbToInt from '../utilities/rgbToInt';
import secondsToDhms from '../utilities/secondsToDhms';
import secondsToDuration from '../utilities/secondsToDuration';
import splitMessage from '../utilities/splitMessage';
import validUrl from '../utilities/validUrl';

class Utilities implements UtilitiesType {
  constructor() {
    //
  }

  addTempRole = addTempRole;
  blankField = blankField;
  capitalize = capitalize;
  commaNumber = commaNumber;
  durationToSeconds = durationToSeconds;
  followRedirect = followRedirect;
  hexToInt = hexToInt;
  randomString = randomString;
  removeTempRole = removeTempRole;
  rgbToInt = rgbToInt;
  secondsToDhms = secondsToDhms;
  secondsToDuration = secondsToDuration;
  splitMessage = splitMessage;
  validUrl = validUrl;
}

export default Utilities;
