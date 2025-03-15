# Hello world in Assembly

Install `nasm`

```
sudo apt-get update -y
sudo apt-get install -y nasm
```

Build & run

```
mkdir build
nasm -f elf64 -o build/main.o -l build/main.lst main.asm
ld -static -o build/main  build/main.o
./build/main
```
