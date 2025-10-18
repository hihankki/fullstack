const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 Grant Cabinet Backend Server Started');
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Grants API: http://localhost:${PORT}/api/grants`);
  console.log(`📍 Auth API: http://localhost:${PORT}/api/auth`);
});