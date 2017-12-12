const defaultSettings = {
  conversions: { // 1 = convert; 0 = do nothing; -1 = remove
    music: 1,
    italics: 1,
    bold: 1,
  },
  warnings: { // >1 = number; 0 = turned off
    maxLineNo: 2,
    maxLineLength: 45,
    minBetweenKeyframes: 1500 //ms
  },
  timing: { // in ms
    offset: 0,
    maxKeyframe: 5000
  },
  locale: 'en-us'
};

export {defaultSettings};
