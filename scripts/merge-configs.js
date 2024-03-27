/**
* Merge all `theme_config.*` options from main Hexo config into hexo.theme.config.
* This fixes an issue with hexo-renderer-stylus, which otherwise ignores these
* configuration overrides.
*/
hexo.on('generateBefore', function () {
  hexo.theme.config = Object.assign({}, hexo.theme.config, hexo.config.theme_config);
});

function isNotEmptyObject(obj) {
  return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
}

function mergeObject(target, ...sources) {
  for (const source of sources) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const value = source[key];
        if (isNotEmptyObject(value) && isNotEmptyObject(target[key])) {
          target[key] = mergeObject(target[key], value);
        } else {
          target[key] = value;
        }
      }
    }
  }
  return target;
}

hexo.on('generateBefore', function () {
  const data = hexo.locals.get('data');
  const { language } = hexo.config;
  const { i18n } = hexo.theme;
  const langConfigMap = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (/^languages\/.+$/.test(key)) {
        langConfigMap[key.replace('languages/', '')] = data[key];
      }
    }
  }
  if (isNotEmptyObject(langConfigMap)) {
    const mergeLang = (lang) => {
      if (langConfigMap[lang]) {
        i18n.set(lang, mergeObject({}, i18n.get([lang]), langConfigMap[lang]));
      }
    };
    if (Array.isArray(language)) {
      for (const lang of language) {
        mergeLang(lang);
      }
    } else {
      mergeLang(language);
    }
  }
});