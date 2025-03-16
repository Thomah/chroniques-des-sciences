# Chrononiques des Sciences - Des cailloux aux octets

[![Slides](https://img.shields.io/badge/Slides-Web-white)](https://thomah.github.io/chroniques-des-sciences/)
[![Script](https://img.shields.io/badge/Script-PDF-white)](https://thomah.github.io/chroniques-des-sciences/script.pdf)

## Prerequisites

```bash
sudo apt install git-lfs python3-tk xdotool
sudo apt install 
```

## Run

```bash
source venv/bin/activate
pip install -r requirements-<os>.txt
python main.py
```

## Open the speaker view

Enter  `S` on any slide

## Generate dialogs

```
python -m venv venv
venv\Scripts\activate # on Windows
source venv/bin/activate # on Linux
pip install -r requirements.txt
python generate_dialogs.py
```

## Generate script

```
sudo apt-get install autoconf patch build-essential rustc libssl-dev libyaml-dev libreadline6-dev zlib1g-dev libgmp-dev libncurses5-dev libffi-dev libgdbm6 libgdbm-dev libdb-dev uuid-dev

git clone https://github.com/rbenv/rbenv.git ~/.rbenv
~/.rbenv/bin/rbenv init
source ~/.bashrc
git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build
rbenv install 3.4.2
rbenv global 3.4.2

python -m venv venv
venv\Scripts\activate # on Windows
source venv/bin/activate # on Linux
pip install -r requirements.txt
python generate_script.py
```

## MAVHi

### On Windows

```
pip install pygetwindow pywin32 pyserial pynput selenium
python mavhi\windows-connector.py
```

### On Linux

```
# Give access to serial port
sudo usermod -a -G dialout $USER

# Configure and launch connector
sudo apt install python3-tk xdotool
pip install pynput pyserial selenium
python mavhi/linux-connector.py
```
