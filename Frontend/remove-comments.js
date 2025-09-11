const replace = require('replace-in-file');
const path = require('path');

(async () => {
  try {
    // HTML
    const htmlOptions = {
      files: 'src/**/*.html',
      from: /<!--[\s\S]*?-->/g, // usuwa komentarze HTML
      to: '',
    };
    const htmlResults = await replace(htmlOptions);
    console.log('HTML comments removed:', htmlResults.length);

    // CSS
    const cssOptions = {
      files: 'src/**/*.css',
      from: /\/\*[\s\S]*?\*\//g, // usuwa komentarze CSS
      to: '',
    };
    const cssResults = await replace(cssOptions);
    console.log('CSS comments removed:', cssResults.length);

    console.log('Komentarze w HTML i CSS usunięte!');
  } catch (error) {
    console.error('Błąd podczas usuwania komentarzy:', error);
  }
})();
