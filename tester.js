const axios = require('axios');

class ESP32Simulator {
  constructor(serverUrl = 'http://localhost:3718') {
    this.serverUrl = serverUrl;
    this.deviceId = this.generateDeviceId();
    this.isRunning = false;
  }

  generateDeviceId() {
    // Generate MAC address style device ID
    const hex = '0123456789ABCDEF';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += hex.charAt(Math.floor(Math.random() * hex.length));
      if (i % 2 === 1 && i < 11) result += ':';
    }
    return result.replace(/:/g, '');
  }

  async requestLocation() {
    try {
      console.log('\n=== ESP32 Simulator - Requesting Location ===');
      console.log(`Device ID: ${this.deviceId}`);
      
      const payload = {
        device_id: this.deviceId
      };

      console.log('Sending request:', JSON.stringify(payload, null, 2));

      const response = await axios.post(`${this.serverUrl}/api/esp32/location`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('\n=== Response Received ===');
      console.log('Status Code:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.status === 'success') {
        this.displayLocationInfo(response.data);
        return response.data;
      } else {
        console.log('❌ Failed to get location');
        return null;
      }

    } catch (error) {
      console.error('\n❌ Error requesting location:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.message);
      } else {
        console.error('Request error:', error.message);
      }
      return null;
    }
  }

  displayLocationInfo(data) {
    console.log('\n🌍 === LOCATION FOUND ===');
    console.log(`📍 Coordinates: ${data.latitude}, ${data.longitude}`);
    console.log(`🏙️  City: ${data.city}`);
    console.log(`🏳️  Country: ${data.country}`);
    console.log(`🗺️  Region: ${data.region}`);
    console.log(`🕐 Timezone: ${data.timezone}`);
    console.log(`⏰ Timestamp: ${new Date(data.timestamp).toLocaleString()}`);
    console.log('========================\n');

    // Simulate ESP32 processing
    this.processLocationData(data);
  }

  processLocationData(locationData) {
    console.log('🔄 Processing location data...');
    
    // Simulate different actions based on location
    if (locationData.country === 'Indonesia') {
      console.log('✅ ESP32 detected in Indonesia - Enabling Indonesia-specific features');
    }

    if (locationData.city === 'Jakarta') {
      console.log('🌆 ESP32 detected in Jakarta - Activating Jakarta traffic monitoring');
    }

    if (locationData.city === 'Bandung') {
      console.log('🏔️  ESP32 detected in Bandung - Activating cool weather mode');
    }

    // Simulate saving to "EEPROM"
    console.log('💾 Saving location to EEPROM simulation...');
    
    console.log('✅ Location processing completed');
  }

  async startContinuousMonitoring(intervalMinutes = 5) {
    console.log(`🚀 Starting ESP32 Simulator - Continuous monitoring every ${intervalMinutes} minutes`);
    console.log(`🔗 Server URL: ${this.serverUrl}`);
    console.log(`📱 Device ID: ${this.deviceId}`);
    
    this.isRunning = true;

    // Initial request
    await this.requestLocation();

    // Set up interval
    const intervalMs = intervalMinutes * 60 * 1000;
    const interval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }
      await this.requestLocation();
    }, intervalMs);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping ESP32 Simulator...');
      this.isRunning = false;
      clearInterval(interval);
      process.exit(0);
    });
  }

  stop() {
    this.isRunning = false;
  }
}

// Usage examples
async function runSimulator() {
  const esp32 = new ESP32Simulator('http://localhost:3718');

  console.log('ESP32 Location Simulator');
  console.log('========================');
  console.log('1. Single request test');
  console.log('2. Continuous monitoring (5 minutes interval)');
  console.log('3. Custom server URL');

  const args = process.argv.slice(2);
  
  if (args.includes('--continuous')) {
    await esp32.startContinuousMonitoring(5);
  } else if (args.includes('--fast')) {
    await esp32.startContinuousMonitoring(1); // Every 1 minute
  } else {
    // Single request
    await esp32.requestLocation();
  }
}

// Run the simulator
if (require.main === module) {
  runSimulator().catch(console.error);
}

module.exports = ESP32Simulator;
