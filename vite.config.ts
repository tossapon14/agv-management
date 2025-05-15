import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   
// })
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          icons: ['react-icons/bi', 'react-icons/pi', 'react-icons/io', 'react-icons/bs',
            'react-icons/fc', 'react-icons/ri', 'react-icons/fa', 'react-icons/fa6', 'react-icons/go',
            'react-icons/tb', 'react-icons/ci', 'react-icons/io5', 'react-icons/ai', 'react-icons/ri',
            'react-icons/hi'
          ],
          chart_utils: [
            'src/pages/chart/barChart2.tsx',
            'src/pages/chart/BatteryAreaChart.tsx',
            'src/pages/chart/BatteryAreaChart2.tsx',
            'src/pages/chart/batteryDonus2.tsx',
            'src/pages/chart/batteryDonut.tsx',
            'src/pages/chart/velocityChart.tsx',
            './src/utils/centerFunction.ts',
            './src/utils/i18n.tsx'
          ],
          pages: [
            './src/pages/home.tsx',
            './src/pages/mission.tsx',
            './src/pages/alarm.tsx',
            './src/pages/battery.tsx',
            './src/pages/changePassword.tsx',
            './src/pages/createUser.tsx',
            './src/pages/editUser.tsx',
            './src/pages/login.tsx',
            './src/pages/map_animation.tsx',
            './src/pages/networkError.tsx',
            './src/pages/NotFound.tsx',
            './src/pages/statistics.tsx',
            './src/pages/responseAPI.tsx',
            './src/pages/statistics.tsx',
            './src/pages/statusOnline.tsx',
            './src/pages/switch.tsx',
            './src/pages/user.tsx',
            './src/pages/vehicle.tsx',
          ],
        },
      },
    },
  },
});