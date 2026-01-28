# React Playground

## Installation

### 1. Install Required Tools

**Install Git:**
```pwsh
winget install Git.Git
git --version
```

**Install Node.js:**
```pwsh
winget install OpenJS.NodeJS.LTS
node -v
npm -v
```

### 2. Clone and Setup Project
```bash
# clone repo
git clone https://github.com/aelberthcheong/react-playground.git

# navigate ke directory proyek
cd react-playground

# install dependencies
npm install

# mulai server
npm run serve
```
Serve pada:
```
http://localhost:3000
```

---

**Important:**

> [!WARNING]
> State JavaScript tidak **dipertahankan**
> Ini adalah Live Reload, bukan HMR Persistensi state harus ditangani secara manual (misalnya localStorage) jika diperlukan.

## When to Use

* Zero build step
* Satu file HTML
* CDN-based React atau plain JS

Do **not** use, jika:

* Anda memerlukan build produksi
* Anda mengandalkan hot-reload di tingkat modul
* Anda ingin membuat aplikasi yang robust

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.