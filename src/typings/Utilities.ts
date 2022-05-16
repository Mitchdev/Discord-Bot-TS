import addTempRole from '../utilities/addTempRole';
import blankField from '../utilities/blankField';
import capitalize from '../utilities/capitalize';
import durationToSeconds from '../utilities/durationToSeconds';
import embedTweet from '../utilities/embedTweet';
import hexToInt from '../utilities/hexToInt';
import randomString from '../utilities/randomString';
import rgbToInt from '../utilities/rgbToInt';
import secondsToDhms from '../utilities/secondsToDhms';
import secondsToDuration from '../utilities/secondsToDuration';
import splitMessage from '../utilities/splitMessage';
import validUrl from '../utilities/validUrl';
import removeTempRole from '../utilities/removeTempRole';
import webmToMp4 from '../utilities/webmToMp4';

interface UtilitiesType {
  addTempRole: typeof addTempRole;
  blankField: typeof blankField;
  capitalize: typeof capitalize;
  durationToSeconds: typeof durationToSeconds;
  embedTweet: typeof embedTweet;
  hexToInt: typeof hexToInt;
  randomString: typeof randomString;
  removeTempRole: typeof removeTempRole;
  rgbToInt: typeof rgbToInt;
  secondsToDhms: typeof secondsToDhms;
  secondsToDuration: typeof secondsToDuration;
  splitMessage: typeof splitMessage;
  validUrl: typeof validUrl;
  webmToMp4: typeof webmToMp4;
}

export default UtilitiesType;
