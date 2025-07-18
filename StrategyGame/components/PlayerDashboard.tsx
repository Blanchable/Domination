import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { advanceDay, usePapalAction } from '../store/gameSlice';
import { Ionicons } from '@expo/vector-icons';
import { PapalAction } from '../types/game';
import DiplomacyPanel from './DiplomacyPanel';

interface PlayerDashboardProps {
  currentPlayerId: string;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ currentPlayerId }) => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);
  const { players, gameDay, currentPopeTurn, papalActionsUsed } = gameState;
  const [showDiplomacy, setShowDiplomacy] = useState(false);
  const [showPapalActions, setShowPapalActions] = useState(false);

  const currentPlayer = players[currentPlayerId];
  const isPope = currentPlayer?.isPope;
  const canUsePapalAction = isPope && papalActionsUsed < 1;

  const handleAdvanceDay = () => {
    dispatch(advanceDay());
  };

  const handlePapalAction = (action: PapalAction) => {
    dispatch(usePapalAction({ action }));
    setShowPapalActions(false);
  };

  const papalActions: PapalAction[] = [
    {
      type: 'ceasefire',
      targetPlayerIds: [], // Will be filled when selecting targets
      description: 'Force two players into a ceasefire for one day'
    },
    {
      type: 'double_resources',
      targetPlayerIds: [],
      targetProvinceId: '', // Will be filled when selecting province
      description: 'Double a province\'s resource output for one day'
    },
    {
      type: 'excommunicate',
      targetPlayerIds: [], // Will be filled when selecting target
      description: 'Remove a player from all alliances for one turn'
    },
    {
      type: 'bless_army',
      targetPlayerIds: [],
      targetProvinceId: '', // Will be filled when selecting province
      description: 'Give an army combat advantage in next battle'
    },
  ];

  if (!currentPlayer) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.playerInfo}>
          <View style={[styles.playerColorIndicator, { backgroundColor: currentPlayer.color }]} />
          <View>
            <Text style={styles.playerName}>{currentPlayer.name}</Text>
            {isPope && (
              <Text style={styles.popeTitle}>👑 Pope of Christianity</Text>
            )}
          </View>
        </View>
        <Text style={styles.gameDay}>Day {gameDay}</Text>
      </View>

      <View style={styles.resourcesContainer}>
        <View style={styles.resourceItem}>
          <Ionicons name="cash" size={20} color="#FFD700" />
          <Text style={styles.resourceText}>{currentPlayer.resources.gold}</Text>
        </View>
        <View style={styles.resourceItem}>
          <Ionicons name="restaurant" size={20} color="#8B4513" />
          <Text style={styles.resourceText}>{currentPlayer.resources.food}</Text>
        </View>
        <View style={styles.resourceItem}>
          <Ionicons name="star" size={20} color="#9370DB" />
          <Text style={styles.resourceText}>{currentPlayer.resources.faith}</Text>
        </View>
        <View style={styles.resourceItem}>
          <Ionicons name="shield" size={20} color="#4682B4" />
          <Text style={styles.resourceText}>{currentPlayer.totalTroops}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Provinces</Text>
          <Text style={styles.statValue}>{currentPlayer.provinces.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Alliances</Text>
          <Text style={styles.statValue}>{currentPlayer.alliances.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Wars</Text>
          <Text style={styles.statValue}>{currentPlayer.wars.length}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.advanceDayButton]}
          onPress={handleAdvanceDay}
        >
          <Ionicons name="time" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Advance Day</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.diplomacyButton]}
          onPress={() => setShowDiplomacy(true)}
        >
          <Ionicons name="people" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Diplomacy</Text>
        </TouchableOpacity>

        {isPope && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.papalButton,
              !canUsePapalAction && styles.disabledButton
            ]}
            onPress={() => setShowPapalActions(true)}
            disabled={!canUsePapalAction}
          >
            <Ionicons name="star" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>
              Papal Power {papalActionsUsed}/1
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Diplomacy Modal */}
      <Modal
        visible={showDiplomacy}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDiplomacy(false)}
      >
        <DiplomacyPanel
          currentPlayerId={currentPlayerId}
          onClose={() => setShowDiplomacy(false)}
        />
      </Modal>

      {/* Papal Actions Modal */}
      <Modal
        visible={showPapalActions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPapalActions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Papal Powers</Text>
              <TouchableOpacity
                onPress={() => setShowPapalActions(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.papalActionsScrollView}>
              {papalActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.papalActionItem}
                  onPress={() => handlePapalAction(action)}
                >
                  <Text style={styles.papalActionTitle}>
                    {action.type.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.papalActionDescription}>
                    {action.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.papalNote}>
              Note: You can only use one papal action per day. These actions cannot target yourself with negative effects.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    margin: 10,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  popeTitle: {
    fontSize: 12,
    color: '#9370DB',
    fontWeight: '600',
  },
  gameDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  resourcesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 10,
  },
  resourceItem: {
    alignItems: 'center',
    flex: 1,
  },
  resourceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 5,
  },
  advanceDayButton: {
    backgroundColor: '#4ECDC4',
  },
  diplomacyButton: {
    backgroundColor: '#45B7D1',
  },
  papalButton: {
    backgroundColor: '#9370DB',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  papalActionsScrollView: {
    maxHeight: 300,
  },
  papalActionItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#9370DB',
  },
  papalActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  papalActionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  papalNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});

export default PlayerDashboard;