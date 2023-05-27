#!/bin/bash

#I refuse to use a real build system for this

tsc
cp src/index.html build/index.html
cp src/style.css build/style.css