"""Check that every Russian interface string has an English translation."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = (ROOT / "assets/i18n-data.js").read_text()
CATALOG = json.loads(DATA.split("window.FROGEE_TRANSLATIONS = ", 1)[1].rsplit(";", 1)[0])
CYRILLIC = re.compile(r"[А-Яа-яЁё]")
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class CopyAudit(HTMLParser):
    def __init__(self, filename):
        super().__init__(convert_charrefs=True)
        self.filename = filename
        self.stack = []
        self.missing = []

    def check(self, text):
        text = re.sub(r"\s+", " ", text).strip()
        if CYRILLIC.search(text) and text not in CATALOG:
            self.missing.append((str(self.filename.relative_to(ROOT)), self.getpos()[0], text))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        ignore = (self.stack and self.stack[-1][1]) or tag in {"script", "style", "noscript", "textarea"} or "data-i18n-ignore" in attrs or "contenteditable" in attrs
        if not ignore:
            for name in ("alt", "title", "aria-label", "placeholder", "content"):
                if attrs.get(name):
                    self.check(attrs[name])
            key = attrs.get("data-i18n-key")
            if key and key not in CATALOG:
                self.missing.append((str(self.filename), self.getpos()[0], key))
        if tag not in VOID:
            self.stack.append((tag, ignore))

    def handle_startendtag(self, tag, attrs):
        before = len(self.stack)
        self.handle_starttag(tag, attrs)
        del self.stack[before:]

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        if not self.stack or not self.stack[-1][1]:
            self.check(data)


errors = []
for key, translations in CATALOG.items():
    if not translations.get("ru") or not translations.get("en") or CYRILLIC.search(translations.get("en", "")):
        errors.append(("assets/i18n-data.js", 0, key))
pages = sorted(ROOT.glob("*.html")) + sorted((ROOT / "programs").glob("*.html"))
for page in pages:
    audit = CopyAudit(page)
    audit.feed(page.read_text())
    errors.extend(audit.missing)
if errors:
    for file, line, text in errors:
        print(f"{file}:{line}: missing translation: {text}")
    raise SystemExit(1)
print(f"Translations complete: {len(CATALOG)} entries across {len(pages)} pages.")
