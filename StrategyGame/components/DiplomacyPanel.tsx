import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { formAlliance, createTradeDeal, breakAlliance } from '../store/gameSlice';
import { Ionicons } from '@expo/vector-icons';
import { Resources } from '../types/game';

interface DiplomacyPanelProps {
  currentPlayerId: string;
  onClose: () => void;
}

const DiplomacyPanel: React.FC<DiplomacyPanelProps> = ({ currentPlayerId, onClose }) => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);
  const { players, alliances } = gameState;
  const [selectedTab, setSelectedTab] = useState<'alliances' | 'trade'>('alliances');
  const [showAllianceForm, setShowAllianceForm] = useState(false);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [allianceName, setAllianceName] = useState('');
  const [tradeResources, setTradeResources] = useState<Partial<Resources>>({
    gold: 0,
    food: 0,
    faith: 0,
  });

  const currentPlayer = players[currentPlayerId];
  const otherPlayers = Object.values(players).filter(p => p.id !== currentPlayerId);
  const currentPlayerAlliances = currentPlayer.alliances.map(id => alliances[id]).filter(Boolean);

  const handleFormAlliance = () => {
    if (!selectedPlayerId || !allianceName.trim()) {
      Alert.alert('Missing Information', 'Please select a player and enter an alliance name.');
      return;
    }

    // Check if already allied
    const alreadyAllied = currentPlayerAlliances.some(alliance => 
      alliance.members.includes(selectedPlayerId)
    );

    if (alreadyAllied) {
      Alert.alert('Already Allied', 'You are already in an alliance with this player.');
      return;
    }

    dispatch(formAlliance({
      playerId: currentPlayerId,
      targetPlayerId: selectedPlayerId,
      allianceName: allianceName.trim(),
    }));

    setShowAllianceForm(false);
    setSelectedPlayerId('');
    setAllianceName('');
    Alert.alert('Alliance Formed', 'Your alliance has been created successfully!');
  };

  const handleCreateTrade = () => {
    if (!selectedPlayerId) {
      Alert.alert('Missing Information', 'Please select a player to trade with.');
      return;
    }

    const totalOffered = (tradeResources.gold || 0) + (tradeResources.food || 0) + (tradeResources.faith || 0);
    if (totalOffered <= 0) {
      Alert.alert('Invalid Trade', 'You must offer at least some resources.');
      return;
    }

    // Check if player has enough resources
    const hasEnoughGold = currentPlayer.resources.gold >= (tradeResources.gold || 0);
    const hasEnoughFood = currentPlayer.resources.food >= (tradeResources.food || 0);
    const hasEnoughFaith = currentPlayer.resources.faith >= (tradeResources.faith || 0);

    if (!hasEnoughGold || !hasEnoughFood || !hasEnoughFaith) {
      Alert.alert('Insufficient Resources', 'You don\'t have enough resources to make this trade.');
      return;
    }

    dispatch(createTradeDeal({
      fromPlayerId: currentPlayerId,
      toPlayerId: selectedPlayerId,
      resources: tradeResources,
      duration: 1, // Immediate trade
    }));

    setShowTradeForm(false);
    setSelectedPlayerId('');
    setTradeResources({ gold: 0, food: 0, faith: 0 });
    Alert.alert('Trade Completed', 'Your trade has been completed successfully!');
  };

  const handleBreakAlliance = (allianceId: string, allianceName: string) => {
    Alert.alert(
      'Break Alliance',
      `Are you sure you want to break the alliance "${allianceName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Break Alliance',
          style: 'destructive',
          onPress: () => {
            dispatch(breakAlliance({ playerId: currentPlayerId, allianceId }));
            Alert.alert('Alliance Broken', 'The alliance has been dissolved.');
          },
        },
      ]
    );
  };

  const renderAlliancesTab = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Current Alliances</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAllianceForm(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {currentPlayerAlliances.length === 0 ? (
        <Text style={styles.emptyText}>No alliances formed yet</Text>
      ) : (
        currentPlayerAlliances.map(alliance => (
          <View key={alliance.id} style={styles.allianceItem}>
            <View style={styles.allianceInfo}>
              <Text style={styles.allianceName}>{alliance.name}</Text>
              <Text style={styles.allianceMembers}>
                Members: {alliance.members.map(id => players[id]?.name).join(', ')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.breakButton}
              onPress={() => handleBreakAlliance(alliance.id, alliance.name)}
            >
              <Text style={styles.breakButtonText}>Break</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {showAllianceForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Form New Alliance</Text>
          
          <Text style={styles.formLabel}>Select Player:</Text>
          <ScrollView horizontal style={styles.playerSelector}>
            {otherPlayers.map(player => (
              <TouchableOpacity
                key={player.id}
                style={[
                  styles.playerOption,
                  selectedPlayerId === player.id && styles.selectedPlayerOption
                ]}
                onPress={() => setSelectedPlayerId(player.id)}
              >
                <View style={[styles.playerColorDot, { backgroundColor: player.color }]} />
                <Text style={styles.playerOptionText}>{player.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.formLabel}>Alliance Name:</Text>
          <TextInput
            style={styles.input}
            value={allianceName}
            onChangeText={setAllianceName}
            placeholder="Enter alliance name"
          />

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                setShowAllianceForm(false);
                setSelectedPlayerId('');
                setAllianceName('');
              }}
            >
              <Text style={styles.formButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.confirmButton]}
              onPress={handleFormAlliance}
            >
              <Text style={styles.formButtonText}>Form Alliance</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderTradeTab = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trade Resources</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowTradeForm(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.resourcesDisplay}>
        <Text style={styles.resourcesTitle}>Your Resources:</Text>
        <View style={styles.resourcesRow}>
          <View style={styles.resourceDisplay}>
            <Ionicons name="cash" size={16} color="#FFD700" />
            <Text style={styles.resourceDisplayText}>{currentPlayer.resources.gold}</Text>
          </View>
          <View style={styles.resourceDisplay}>
            <Ionicons name="restaurant" size={16} color="#8B4513" />
            <Text style={styles.resourceDisplayText}>{currentPlayer.resources.food}</Text>
          </View>
          <View style={styles.resourceDisplay}>
            <Ionicons name="star" size={16} color="#9370DB" />
            <Text style={styles.resourceDisplayText}>{currentPlayer.resources.faith}</Text>
          </View>
        </View>
      </View>

      {showTradeForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Trade</Text>
          
          <Text style={styles.formLabel}>Select Player:</Text>
          <ScrollView horizontal style={styles.playerSelector}>
            {otherPlayers.map(player => (
              <TouchableOpacity
                key={player.id}
                style={[
                  styles.playerOption,
                  selectedPlayerId === player.id && styles.selectedPlayerOption
                ]}
                onPress={() => setSelectedPlayerId(player.id)}
              >
                <View style={[styles.playerColorDot, { backgroundColor: player.color }]} />
                <Text style={styles.playerOptionText}>{player.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.formLabel}>Resources to Send:</Text>
          
          <View style={styles.tradeInputs}>
            <View style={styles.tradeInputRow}>
              <Ionicons name="cash" size={20} color="#FFD700" />
              <TextInput
                style={styles.tradeInput}
                value={tradeResources.gold?.toString() || '0'}
                onChangeText={(text) => setTradeResources(prev => ({ ...prev, gold: parseInt(text) || 0 }))}
                keyboardType="numeric"
                placeholder="Gold"
              />
            </View>
            
            <View style={styles.tradeInputRow}>
              <Ionicons name="restaurant" size={20} color="#8B4513" />
              <TextInput
                style={styles.tradeInput}
                value={tradeResources.food?.toString() || '0'}
                onChangeText={(text) => setTradeResources(prev => ({ ...prev, food: parseInt(text) || 0 }))}
                keyboardType="numeric"
                placeholder="Food"
              />
            </View>
            
            <View style={styles.tradeInputRow}>
              <Ionicons name="star" size={20} color="#9370DB" />
              <TextInput
                style={styles.tradeInput}
                value={tradeResources.faith?.toString() || '0'}
                onChangeText={(text) => setTradeResources(prev => ({ ...prev, faith: parseInt(text) || 0 }))}
                keyboardType="numeric"
                placeholder="Faith"
              />
            </View>
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                setShowTradeForm(false);
                setSelectedPlayerId('');
                setTradeResources({ gold: 0, food: 0, faith: 0 });
              }}
            >
              <Text style={styles.formButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.confirmButton]}
              onPress={handleCreateTrade}
            >
              <Text style={styles.formButtonText}>Send Trade</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Diplomacy</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'alliances' && styles.activeTab]}
            onPress={() => setSelectedTab('alliances')}
          >
            <Text style={[styles.tabText, selectedTab === 'alliances' && styles.activeTabText]}>
              Alliances
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'trade' && styles.activeTab]}
            onPress={() => setSelectedTab('trade')}
          >
            <Text style={[styles.tabText, selectedTab === 'trade' && styles.activeTabText]}>
              Trade
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {selectedTab === 'alliances' ? renderAlliancesTab() : renderTradeTab()}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  activeTab: {
    borderBottomColor: '#45B7D1',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#45B7D1',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
  allianceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  allianceInfo: {
    flex: 1,
  },
  allianceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  allianceMembers: {
    fontSize: 14,
    color: '#666',
  },
  breakButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  breakButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  playerSelector: {
    marginBottom: 15,
  },
  playerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedPlayerOption: {
    borderColor: '#45B7D1',
    backgroundColor: '#E3F2FD',
  },
  playerColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  playerOptionText: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#CCCCCC',
  },
  confirmButton: {
    backgroundColor: '#4ECDC4',
  },
  formButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resourcesDisplay: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  resourcesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resourcesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resourceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  resourceDisplayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tradeInputs: {
    marginBottom: 15,
  },
  tradeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tradeInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
});

export default DiplomacyPanel;