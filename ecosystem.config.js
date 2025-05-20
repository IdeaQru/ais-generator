module.exports = {
  apps: [
    {
      name: 'ais-generator',
      script: './dist/server.js',
      watch: true, // Memungkinkan PM2 untuk memantau perubahan file dan me-restart aplikasi
      instances: 1, // Menjalankan 1 instance aplikasi
      exec_mode: 'fork', // Mode eksekusi aplikasi
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
