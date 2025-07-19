import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './store/store';
import GameSetup from './components/GameSetup';
import GameScreen from './components/GameScreen';
import { Ionicons } from '@expo/vector-icons';

const GameApp: React.FC = () => {
  const gameState = useSelector((state: RootState) => state.game);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);

  // Set the first player as current player when game starts
  React.useEffect(() => {
    if (gameState.gameStarted && !currentPlayerId) {
      const firstPlayerId = Object.keys(gameState.players)[0];
      if (firstPlayerId) {
        setCurrentPlayerId(firstPlayerId);
      }
    }
  }, [gameState.gameStarted, gameState.players, currentPlayerId]);

  const handleGameStart = () => {
    // Game will start automatically through Redux
  };

  const switchPlayer = (playerId: string) => {
    setCurrentPlayerId(playerId);
    setShowPlayerSelector(false);
  };

  if (!gameState.gameStarted) {
    return <GameSetup onGameStart={handleGameStart} />;
  }

  if (!currentPlayerId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Setting up game...</Text>
      </View>
    );
  }

  const currentPlayer = gameState.players[currentPlayerId];

  return (
    <View style={styles.container}>
      {/* Player Selector Header */}
      <View style={styles.playerSelectorHeader}>
        <TouchableOpacity
          style={styles.currentPlayerButton}
          onPress={() => setShowPlayerSelector(!showPlayerSelector)}
        >
          <View style={[styles.playerColorDot, { backgroundColor: currentPlayer.color }]} />
          <Text style={styles.currentPlayerText}>
            Playing as: {currentPlayer.name}
            {currentPlayer.isPope && ' 👑'}
          </Text>
          <Ionicons 
            name={showPlayerSelector ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#666" 
          />
        </TouchableOpacity>

        {showPlayerSelector && (
          <View style={styles.playerSelectorDropdown}>
            <ScrollView style={styles.playerList}>
              {Object.values(gameState.players).map(player => (
                <TouchableOpacity
                  key={player.id}
                  style={[
                    styles.playerOption,
                    player.id === currentPlayerId && styles.selectedPlayerOption
                  ]}
                  onPress={() => switchPlayer(player.id)}
                >
                  <View style={[styles.playerColorDot, { backgroundColor: player.color }]} />
                  <Text style={styles.playerOptionText}>
                    {player.name}
                    {player.isPope && ' 👑'}
                  </Text>
                  <View style={styles.playerStats}>
                    <Text style={styles.playerStatText}>
                      {player.provinces.length} provinces
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <GameScreen currentPlayerId={currentPlayerId} />
    </View>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <GameApp />
      <StatusBar style="auto" />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  playerSelectorHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    gap: 10,
  },
  currentPlayerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  playerColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  playerSelectorDropdown: {
    position: 'absolute',
    top: 72,
    left: 15,
    right: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  playerList: {
    maxHeight: 250,
  },
  playerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  selectedPlayerOption: {
    backgroundColor: '#E3F2FD',
  },
  playerOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  playerStats: {
    alignItems: 'flex-end',
  },
  playerStatText: {
    fontSize: 12,
    color: '#666',
  },
});
