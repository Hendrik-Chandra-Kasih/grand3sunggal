// API base URL — baca dari environment variable Vite
// Development:  kosong → proxy Vite handle secara otomatis
// Production:   isi di .env dengan VITE_API_BASE_URL=https://domainkamu.com
//               atau biarkan kosong jika backend serve static file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export default API_BASE_URL
