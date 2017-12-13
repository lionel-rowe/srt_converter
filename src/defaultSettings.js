const defaultSettings = {
  // Conversions: 1 = convert; 0 = do nothing; -1 = remove
  convertMusic: 1,
  convertItalics: 1,
  convertBold: 1,

  // Warnings: >0 = specified number; 0 = turned off
  warnMaxLineNo: 2,
  warnMaxLineLength: 45,
  warnMinBetweenKeyframes: 1500, //ms

  // Timing: in ms
  offset: 0,
  maxKeyframe: 5000,

  // Other
  locale: 'en-us'
};

export {defaultSettings};
