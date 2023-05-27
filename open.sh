#!/bin/bash

#open in local webbrowser

if chromium --version; then
    chromium ./build/index.html
    exit
fi

if firefox --version; then
    firefox ./build/index.html
    exit
fi

echo "did not find browser"