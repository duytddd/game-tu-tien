// postcss.config.js (ES Module) hoặc postcss.config.mjs (khuyến nghị nếu bạn đã dùng .mjs trước đó)
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;