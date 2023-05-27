#!/bin/bash

#I refuse to use a real build system for this

tsc
cp resources/index.html build/index.html
cp resources/style.css build/style.css