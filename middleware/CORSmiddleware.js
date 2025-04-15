// CORSmiddleware.js
import cors from 'cors';

const corsOptions = {
  origin: function (origin, callback) {
    const allowlist = [
      'http://localhost:5173',
      'https://uralnickel-frontend.vercel.app'
    ];

    if (!origin) return callback(null, true);
    const isVercelPreview = origin.endsWith('.vercel.app');

    if (allowlist.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      console.warn('⛔ Запрещённый origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

export default cors(corsOptions);
