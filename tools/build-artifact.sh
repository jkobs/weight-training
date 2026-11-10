#!/bin/sh
# Builds artifact.html (the private Claude-link version) from index.html:
# drops the document wrapper, Home Screen and service-worker tags, which the artifact host supplies or blocks.
cd "$(dirname "$0")/.." || exit 1
grep -v -E '^<!doctype html>|^<html|^</html>|^<head>|^</head>|^<body>|^</body>|<meta charset|<meta name="viewport"|apple-mobile-web-app|mobile-web-app-capable|rel="manifest"|rel="apple-touch-icon"|rel="icon"|serviceWorker' index.html \
  | sed 's#<title>Weight Training</title>#<title>Weight Training</title>\n<meta name="claude:viewport-fit-sides" content="cover">#' > artifact.html
