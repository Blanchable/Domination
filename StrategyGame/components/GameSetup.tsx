import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { initializeGame } from '../store/gameSlice';
import { Ionicons } from '@expo/vector-icons';

interface GameSetupProps {
  onGameStart: () => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onGameStart }) => {
  const dispatch = useDispatch();
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  
  const addPlayer = () => {
    if (playerNames.length < 8) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      const newNames = playerNames.filter((_, i) => i !== index);
      setPlayerNames(newNames);
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const startGame = () => {
    const validNames = playerNames.filter(name => name.trim().length > 0);
    
    if (validNames.length < 2) {
      Alert.alert('Not Enough Players', 'You need at least 2 players to start the game.');
      return;
    }

    // Check for duplicate names
    const uniqueNames = new Set(validNames.map(name => name.trim().toLowerCase()));
    if (uniqueNames.size !== validNames.length) {
      Alert.alert('Duplicate Names', 'All player names must be unique.');
      return;
    }

    dispatch(initializeGame({ playerNames: validNames.map(name => name.trim()) }));
    onGameStart();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Grand Strategy Game</Text>
        <Text style={styles.subtitle}>Medieval Europe Awaits Your Rule</Text>
      </View>

      <View style={styles.gameDescription}>
        <Text style={styles.descriptionTitle}>Game Features:</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="map" size={16} color="#4ECDC4" />
            <Text style={styles.featureText}>Control provinces across medieval Europe</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="cash" size={16} color="#FFD700" />
            <Text style={styles.featureText}>Manage Gold, Food, and Faith resources</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="shield" size={16} color="#FF6B6B" />
            <Text style={styles.featureText}>Recruit armies and wage wars</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="people" size={16} color="#45B7D1" />
            <Text style={styles.featureText}>Form alliances and trade deals</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="star" size={16} color="#9370DB" />
            <Text style={styles.featureText}>Compete to become Pope with special powers</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="time" size={16} color="#96CEB4" />
            <Text style={styles.featureText}>Real-time gameplay with daily turns</Text>
          </View>
        </View>
      </View>

      <View style={styles.playersSection}>
        <Text style={styles.sectionTitle}>Players ({playerNames.filter(name => name.trim()).length}/8)</Text>
        
        {playerNames.map((name, index) => (
          <View key={index} style={styles.playerInput}>
            <View style={[styles.playerColorIndicator, { backgroundColor: getPlayerColor(index) }]} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(text) => updatePlayerName(index, text)}
              placeholder={`Player ${index + 1} name`}
              maxLength={20}
            />
            {playerNames.length > 2 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePlayer(index)}
              >
                <Ionicons name="close-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {playerNames.length < 8 && (
          <TouchableOpacity style={styles.addPlayerButton} onPress={addPlayer}>
            <Ionicons name="add-circle" size={24} color="#4ECDC4" />
            <Text style={styles.addPlayerText}>Add Player</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.gameRules}>
        <Text style={styles.rulesTitle}>Quick Rules:</Text>
        <Text style={styles.rulesText}>
          • Each day, provinces generate resources for their owners{'\n'}
          • Use gold to claim provinces and recruit troops{'\n'}
          • Food sustains your armies, faith helps you become Pope{'\n'}
          • The Pope gets one powerful action per day{'\n'}
          • Form alliances and trade with other players{'\n'}
          • Conquer adjacent provinces through warfare{'\n'}
          • All actions and information are visible to all players
        </Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={startGame}>
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getPlayerColor = (index: number): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  gameDescription: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  playersSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  playerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  playerColorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  removeButton: {
    padding: 2,
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    gap: 10,
  },
  addPlayerText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  gameRules: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  rulesText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default GameSetup;