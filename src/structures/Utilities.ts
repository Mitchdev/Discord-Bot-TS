import UtilitiesType from '../typings/Utilities';

import addTempRole from '../utilities/addTempRole';
import blankField from '../utilities/blankField';
import capitalize from '../utilities/capitalize';
import durationToSeconds from '../utilities/durationToSeconds';
import embedTweet from '../utilities/embedTweet';
import hexToInt from '../utilities/hexToInt';
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
  durationToSeconds = durationToSeconds;
  embedTweet = embedTweet;
  hexToInt = hexToInt;
  removeTempRole = removeTempRole;
  rgbToInt = rgbToInt;
  secondsToDhms = secondsToDhms;
  secondsToDuration = secondsToDuration;
  splitMessage = splitMessage;
  validUrl = validUrl;
}

export default Utilities;
