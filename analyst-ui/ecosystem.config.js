module.exports = {
    apps: [{
      name: 'analyst-ui',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT
      },
      instances: process.env.Instances,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: process.env.NODE_ENV
      },
      // Log Configuration
      error_file: process.env.LOGS_DIR.concat('/error.log'),
      out_file: process.env.LOGS_DIR.concat('/out.log'),
      log_file: process.env.LOGS_DIR.concat('/combined.log'),
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Log rotation
      log_type: 'json',
      max_size: '10M',
      rotate_interval: '1d'
    }]
  }