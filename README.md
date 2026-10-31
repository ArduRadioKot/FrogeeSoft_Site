# FrogeeSoft

A static company website: `index.html`, the product catalog, team page, and software pages. No build step is required.

Russian and English are available through the RU / EN switch in the header and the `?lang=ru` / `?lang=en` query parameter. The selected language is saved in the browser and carried through internal links. Text, metadata, and accessible labels are stored in `assets/i18n-data.js`; language switching and dynamic interface translations are handled by `assets/i18n.js`. Product names, code, and original interface screenshots retain their original spelling.

When editing text, add both language versions to the dictionary. Check translation coverage with `python3 scripts/check-i18n.py`. Dynamic messages use `window.FROGEE_I18N.t(text, parameters)` and update on the `frogee:languagechange` event.

Software versions and download links are loaded from the latest GitHub Releases by `assets/downloads.js` where a project has a published release. FgSNotes release data is cached in the browser for one hour. If GitHub is unavailable, the site uses the last cached release or the checked-in fallback data. Elements with `data-release-version` display the latest version on the home and product pages.

The shared “FrogeeSoft | project” branding and author captions are defined in `assets/project-ui.css`. Project author lists follow the website owner's confirmation. Sirius Wiki, S.I.T Education, and Logic Circuit Simulator list Alexander Vorobev as an author. Repository links are kept as project sources.
