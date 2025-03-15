# Chrononiques des Sciences - Des cailloux aux octets

[![Slides](https://img.shields.io/badge/Slides-Web-white)](https://thomah.github.io/chroniques-des-sciences/)
[![Script](https://img.shields.io/badge/Script-PDF-white)](https://thomah.github.io/chroniques-des-sciences/script.pdf)

# Slides

## Build

```
npm install
```

## Run

```
npm start
```

## Open the speaker view

Enter  `S` on any slide

# OpenTTS Server

```
docker run -it -p 5500:5500 synesthesiam/opentts:fr-2.1
```

# Script

```
bundle install
ruby generate_script_pdf.rb
```

# MAVHi

## On Windows

```
pip install pygetwindow pywin32 pyserial pynput
python mavhi\windows-connector.py
```
