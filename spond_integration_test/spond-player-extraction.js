const fetch = require('node-fetch');

// Configuration
const SPOND_CONFIG = {
  email: 'lebeda.georgiy@gmail.com',
  password: process.env.SPOND_PASSWORD || 'your-password-here',
  groupId: 'B31E2E1000054E79A3F3ECB6A26A35A8'
};

class SpondPlayerExtractor {
  constructor() {
    this.baseURL = 'https://api.spond.com/core/v1';
    this.authData = null;
  }

  async authenticate() {
    console.log('🔐 Authenticating with Spond...');
    
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

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      this.authData = await response.json();
      console.log('✅ Authentication successful!');
      return true;

    } catch (error) {
      console.error('❌ Authentication error:', error.message);
      return false;
    }
  }

  async getGames() {
    if (!this.authData?.accessToken?.token) {
      throw new Error('Not authenticated');
    }

    const url = `${this.baseURL}/sponds?includeComments=true&includeHidden=true&addProfileInfo=true&scheduled=true&order=asc&max=20&groupId=${SPOND_CONFIG.groupId}&minEndTimestamp=2025-06-29T23:00:00.001Z`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.authData.accessToken.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.status}`);
    }

    return await response.json();
  }

  findJuly2Game(games) {
    console.log('\n🔍 Looking for July 2nd, 2025 game...');
    
    for (const game of games) {
      const startTime = new Date(game.startTimestamp);
      const gameDate = startTime.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      console.log(`   Game: "${game.heading}" - Date: ${gameDate} - Time: ${startTime.toLocaleTimeString()}`);
      
      // Check if this is the July 2nd game
      if (gameDate === '2025-07-02') {
        console.log(`   ✅ Found July 2nd game: "${game.heading}"`);
        return game;
      }
    }
    
    console.log('   ❌ July 2nd game not found');
    return null;
  }

  extractPlayerNames(game) {
    console.log('\n👥 Extracting player names...');
    
    if (!game.responses?.acceptedIds || !game.recipients?.group?.members) {
      console.log('   ❌ Missing responses or recipients data');
      return [];
    }

    const acceptedIds = game.responses.acceptedIds;
    const members = game.recipients.group.members;
    
    console.log(`   📊 Found ${acceptedIds.length} accepted players`);
    console.log(`   📋 Total group members: ${members.length}`);

    // Create a map of member ID to name
    const memberMap = new Map();
    members.forEach(member => {
      const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
      memberMap.set(member.id, fullName);
    });

    // Map accepted IDs to names
    const acceptedPlayers = [];
    const missingPlayers = [];

    acceptedIds.forEach(id => {
      const name = memberMap.get(id);
      if (name) {
        acceptedPlayers.push({ id, name });
      } else {
        missingPlayers.push(id);
      }
    });

    console.log(`   ✅ Successfully mapped ${acceptedPlayers.length} players`);
    if (missingPlayers.length > 0) {
      console.log(`   ⚠️  Could not find names for ${missingPlayers.length} players:`, missingPlayers);
    }

    return acceptedPlayers;
  }

  async run() {
    console.log('🚀 Starting Spond Player Extraction for July 2nd, 2025...\n');
    
    const authSuccess = await this.authenticate();
    if (!authSuccess) {
      console.log('❌ Cannot proceed without authentication');
      return;
    }

    try {
      const games = await this.getGames();
      console.log(`📊 Retrieved ${games.length} games`);

      const july2Game = this.findJuly2Game(games);
      if (!july2Game) {
        console.log('❌ July 2nd game not found');
        return;
      }

      // Display game details
      console.log('\n🎮 Game Details:');
      console.log(`   Title: ${july2Game.heading}`);
      console.log(`   Description: ${july2Game.description}`);
      console.log(`   Start: ${new Date(july2Game.startTimestamp).toLocaleString()}`);
      console.log(`   End: ${new Date(july2Game.endTimestamp).toLocaleString()}`);
      if (july2Game.location) {
        console.log(`   Location: ${july2Game.location.feature} - ${july2Game.location.address}`);
      }
      if (july2Game.matchInfo) {
        console.log(`   Match: ${july2Game.matchInfo.teamName} vs ${july2Game.matchInfo.opponentName}`);
      }

      const acceptedPlayers = this.extractPlayerNames(july2Game);
      
      if (acceptedPlayers.length > 0) {
        console.log('\n✅ ACCEPTED PLAYERS FOR JULY 2ND GAME:');
        console.log('=' .repeat(50));
        acceptedPlayers.forEach((player, index) => {
          console.log(`${index + 1}. ${player.name} (ID: ${player.id})`);
        });
        console.log('=' .repeat(50));
        console.log(`Total: ${acceptedPlayers.length} players`);
        
        // Also output as JSON for easy copying
        console.log('\n📋 JSON format:');
        console.log(JSON.stringify(acceptedPlayers, null, 2));
      } else {
        console.log('\n❌ No accepted players found');
      }

    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
}

// Run the extraction
async function main() {
  if (!process.env.SPOND_PASSWORD && SPOND_CONFIG.password === 'your-password-here') {
    console.log('⚠️  Please set your Spond password:');
    console.log('   export SPOND_PASSWORD="your-actual-password"');
    return;
  }

  const extractor = new SpondPlayerExtractor();
  await extractor.run();
}

main().catch(console.error); 