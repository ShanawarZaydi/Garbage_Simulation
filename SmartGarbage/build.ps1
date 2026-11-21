$env:PATH = "C:\msys64\ucrt64\bin;" + $env:PATH
& "C:\msys64\ucrt64\bin\g++.exe" -std=c++17 -Wall -Wno-sign-compare -I"C:/msys64/ucrt64/include" src/main.cpp src/Graph.cpp src/MinHeap.cpp src/Trie.cpp -o main.exe
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build succeeded -> .\main.exe" -ForegroundColor Green
}
