

import Constants from "expo-constants";

const ENV = {
 dev: {
  apiUrl: 'https://38br8h6mtb.execute-api.us-east-1.amazonaws.com/prod',
 },
 prod: {
   apiUrl: 'https://38br8h6mtb.execute-api.us-east-1.amazonaws.com/prod',
 }
};

const getEnvVars = (env = Constants.manifest.releaseChannel) => {
 // What is __DEV__ ?
 // This variable is set to true when react-native is running in Dev mode.
 // __DEV__ is true when run locally, but false when published.
 
 if (__DEV__) {
   return ENV.dev;
 } else {
   return ENV.prod;
 }
};

export default getEnvVars;