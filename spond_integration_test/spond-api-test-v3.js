const fetch = require('node-fetch');

// Configuration - replace with your actual credentials
const SPOND_CONFIG = {
  email: 'lebeda.georgiy@gmail.com',
  password: process.env.SPOND_PASSWORD || 'your-password-here',
  groupId: 'B31E2E1000054E79A3F3ECB6A26A35A8'
};

class SpondAPITestV3 {
  constructor() {
    this.baseURL = 'https://api.spond.com/core/v1';
    this.authData = null;
  }

  async authenticate() {
    console.log('🔐 Attempting to authenticate with Spond...');
    
    try {
      const response = await fetch(`${this.baseURL}/auth2/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          email: SPOND_CONFIG.email,
          password: SPOND_CONFIG.password
        })
      });

      console.log(`📡 Login response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Authentication failed:', errorText);
        return false;
      }

      this.authData = await response.json();
      console.log('✅ Authentication successful!');
      console.log('📋 Auth response keys:', Object.keys(this.authData));
      
      // Check if accessToken exists and has the correct structure
      if (this.authData.accessToken && this.authData.accessToken.token && typeof this.authData.accessToken.token === 'string') {
        console.log('🎫 Access token (first 50 chars):', this.authData.accessToken.token.substring(0, 50) + '...');
        console.log('⏰ Token expires:', this.authData.accessToken.expiration);
        return true;
      } else {
        console.log('⚠️  Access token structure is invalid:', this.authData.accessToken);
        return false;
      }

    } catch (error) {
      console.error('❌ Authentication error:', error.message);
      return false;
    }
  }

  async testGamesEndpoint() {
    if (!this.authData?.accessToken?.token || typeof this.authData.accessToken.token !== 'string') {
      console.error('❌ No valid access token available');
      return false;
    }

    console.log('\n🎮 Testing games endpoint with Bearer token...');
    
    try {
      const url = `${this.baseURL}/sponds?includeComments=true&includeHidden=true&addProfileInfo=true&scheduled=true&order=asc&max=20&groupId=${SPOND_CONFIG.groupId}&minEndTimestamp=2025-06-29T23:00:00.001Z`;
      
      console.log('📡 Requesting:', url);
      console.log('🔑 Using Bearer token format');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.authData.accessToken.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      console.log(`📡 Games response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Games request failed:', errorText);
        return false;
      }

      const gamesData = await response.json();
      console.log('✅ Games data retrieved successfully!');
      console.log('📊 Number of games:', gamesData.length || 'N/A');
      
      if (gamesData.length > 0) {
        console.log('\n🎯 First game details:');
        const firstGame = gamesData[0];
        console.log(`   Title: ${firstGame.title || 'No title'}`);
        console.log(`   Start Time: ${firstGame.startTime || 'No time'}`);
        console.log(`   End Time: ${firstGame.endTime || 'No time'}`);
        console.log(`   ID: ${firstGame.id || 'No ID'}`);
        
        // Check for participants
        if (firstGame.participants) {
          console.log(`   👥 Participants: ${firstGame.participants.length}`);
          
          // Show first few participants
          const acceptedParticipants = firstGame.participants.filter(p => p.status === 'accepted');
          console.log(`   ✅ Accepted: ${acceptedParticipants.length}`);
          
          if (acceptedParticipants.length > 0) {
            console.log('   📋 First 3 accepted participants:');
            acceptedParticipants.slice(0, 3).forEach((participant, index) => {
              console.log(`      ${index + 1}. ${participant.name || 'No name'} (${participant.id || 'No ID'})`);
            });
          }
        }
        
        // Show full structure for analysis
        console.log('\n🔍 Full game structure keys:', Object.keys(firstGame));
      }

      return true;

    } catch (error) {
      console.error('❌ Games request error:', error.message);
      return false;
    }
  }

  async testSpecificGame(gameId) {
    if (!this.authData?.accessToken) {
      console.error('❌ No access token available');
      return false;
    }

    console.log(`\n🎯 Testing specific game endpoint for ID: ${gameId}`);
    
    try {
      const url = `${this.baseURL}/sponds/${gameId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.authData.accessToken.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      console.log(`📡 Specific game response status: ${response.status}`);
      
      if (response.ok) {
        const gameData = await response.json();
        console.log('✅ Specific game data retrieved successfully!');
        console.log('🔍 Game structure:', JSON.stringify(gameData, null, 2));
        return true;
      } else {
        const errorText = await response.text();
        console.log('❌ Specific game request failed:', errorText);
        return false;
      }

    } catch (error) {
      console.error('❌ Specific game request error:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Spond API Tests V3 (Bearer Token Focus)...\n');
    
    const authSuccess = await this.authenticate();
    if (!authSuccess) {
      console.log('\n❌ Authentication failed. Cannot proceed with other tests.');
      return;
    }

    const gamesSuccess = await this.testGamesEndpoint();
    if (gamesSuccess) {
      console.log('\n🎉 SUCCESS! Spond API integration is working!');
      console.log('\n📋 Next steps:');
      console.log('   1. Create Spond service in your backend');
      console.log('   2. Add Spond integration to game creation');
      console.log('   3. Implement automatic player synchronization');
    } else {
      console.log('\n❌ Games endpoint still not working. Need further investigation.');
    }
  }
}

// Run the tests
async function main() {
  // Check if password is provided
  if (!process.env.SPOND_PASSWORD && SPOND_CONFIG.password === 'your-password-here') {
    console.log('⚠️  Please set your Spond password as an environment variable:');
    console.log('   export SPOND_PASSWORD="your-actual-password"');
    return;
  }

  const tester = new SpondAPITestV3();
  await tester.runAllTests();
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

main().catch(console.error); 