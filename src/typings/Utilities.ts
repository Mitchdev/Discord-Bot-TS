import blankField from '../utilities/blankField';
import capitalize from '../utilities/capitalize';
import durationToSeconds from '../utilities/durationToSeconds';
import embedTweet from '../utilities/embedTweet';
import hexToInt from '../utilities/hexToInt';
import rgbToInt from '../utilities/rgbToInt';
import secondsToDhms from '../utilities/secondsToDhms';
import secondsToDuration from '../utilities/secondsToDuration';
import splitMessage from '../utilities/splitMessage';
import validUrl from '../utilities/validUrl';
import removeTempRole from '../utilities/removeTempRole';
import addTempRole from '../utilities/addTempRole';

interface UtilitiesType {
  addTempRole: typeof addTempRole;
  blankField: typeof blankField;
  capitalize: typeof capitalize;
  durationToSeconds: typeof durationToSeconds;
  embedTweet: typeof embedTweet;
  hexToInt: typeof hexToInt;
  removeTempRole: typeof removeTempRole;
  rgbToInt: typeof rgbToInt;
  secondsToDhms: typeof secondsToDhms;
  secondsToDuration: typeof secondsToDuration;
  splitMessage: typeof splitMessage;
  validUrl: typeof validUrl;
}

export default UtilitiesType;
