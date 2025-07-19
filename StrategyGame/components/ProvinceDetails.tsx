import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { Province } from '../types/game';
import { claimProvince, declareWar, recruitTroops } from '../store/gameSlice';
import { Ionicons } from '@expo/vector-icons';

interface ProvinceDetailsProps {
  province: Province | null;
  currentPlayerId: string;
  onClose: () => void;
}

const ProvinceDetails: React.FC<ProvinceDetailsProps> = ({ province, currentPlayerId, onClose }) => {
  const dispatch = useDispatch();
  const { players } = useSelector((state: RootState) => state.game);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [troopAmount, setTroopAmount] = useState('');
  const [recruitAmount, setRecruitAmount] = useState('');

  if (!province) return null;

  const currentPlayer = players[currentPlayerId];
  const provinceOwner = province.ownerId ? players[province.ownerId] : null;
  const isOwned = !!province.ownerId;
  const isOwnedByCurrentPlayer = province.ownerId === currentPlayerId;

  const handleClaimProvince = () => {
    if (!isOwned && currentPlayer.resources.gold >= 20) {
      dispatch(claimProvince({ playerId: currentPlayerId, provinceId: province.id }));
      onClose();
    } else {
      Alert.alert('Cannot Claim', 'You need 20 gold to claim this province.');
    }
  };

  const handleDeclareWar = () => {
    const troops = parseInt(troopAmount);
    if (isNaN(troops) || troops <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of troops.');
      return;
    }
    
    if (troops > currentPlayer.totalTroops) {
      Alert.alert('Insufficient Troops', 'You don\'t have enough troops.');
      return;
    }

    if (province.ownerId) {
      dispatch(declareWar({
        attackerId: currentPlayerId,
        defenderId: province.ownerId,
        targetProvinceId: province.id,
        troops: troops
      }));
      setActionModalVisible(false);
      setTroopAmount('');
      onClose();
    }
  };

  const handleRecruitTroops = () => {
    const amount = parseInt(recruitAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of troops to recruit.');
      return;
    }

    const goldCost = amount * 10;
    const foodCost = amount * 2;

    if (currentPlayer.resources.gold < goldCost || currentPlayer.resources.food < foodCost) {
      Alert.alert('Insufficient Resources', `You need ${goldCost} gold and ${foodCost} food.`);
      return;
    }

    dispatch(recruitTroops({
      playerId: currentPlayerId,
      provinceId: province.id,
      amount: amount
    }));
    setRecruitAmount('');
    setActionModalVisible(false);
  };

  return (
    <Modal
      visible={!!province}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.provinceName}>{province.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Province Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Owner:</Text>
              <Text style={styles.infoValue}>
                {provinceOwner ? provinceOwner.name : 'Unowned'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Troops:</Text>
              <Text style={styles.infoValue}>{province.troops}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Terrain Bonus:</Text>
              <Text style={styles.infoValue}>
                {province.terrainBonus ? `x${province.terrainBonus.toFixed(1)}` : 'None'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Resources</Text>
            <View style={styles.resourcesContainer}>
              <View style={styles.resourceItem}>
                <Ionicons name="cash" size={16} color="#FFD700" />
                <Text style={styles.resourceText}>Gold: {province.resources.gold}</Text>
              </View>
              <View style={styles.resourceItem}>
                <Ionicons name="restaurant" size={16} color="#8B4513" />
                <Text style={styles.resourceText}>Food: {province.resources.food}</Text>
              </View>
              <View style={styles.resourceItem}>
                <Ionicons name="star" size={16} color="#9370DB" />
                <Text style={styles.resourceText}>Faith: {province.resources.faith}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionsContainer}>
              {!isOwned && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.claimButton]}
                  onPress={handleClaimProvince}
                  disabled={currentPlayer.resources.gold < 20}
                >
                  <Text style={styles.actionButtonText}>
                    Claim Province (20 Gold)
                  </Text>
                </TouchableOpacity>
              )}

              {isOwned && !isOwnedByCurrentPlayer && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.warButton]}
                  onPress={() => setActionModalVisible(true)}
                >
                  <Text style={styles.actionButtonText}>Declare War</Text>
                </TouchableOpacity>
              )}

              {isOwnedByCurrentPlayer && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.recruitButton]}
                  onPress={() => setActionModalVisible(true)}
                >
                  <Text style={styles.actionButtonText}>Recruit Troops</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Action Modal */}
      <Modal
        visible={actionModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.actionModalOverlay}>
          <View style={styles.actionModalContent}>
            {isOwned && !isOwnedByCurrentPlayer ? (
              // War declaration modal
              <>
                <Text style={styles.actionModalTitle}>Declare War</Text>
                <Text style={styles.actionModalSubtitle}>
                  How many troops do you want to send?
                </Text>
                <TextInput
                  style={styles.input}
                  value={troopAmount}
                  onChangeText={setTroopAmount}
                  placeholder="Number of troops"
                  keyboardType="numeric"
                />
                <Text style={styles.availableText}>
                  Available troops: {currentPlayer.totalTroops}
                </Text>
                <View style={styles.actionModalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setActionModalVisible(false);
                      setTroopAmount('');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleDeclareWar}
                  >
                    <Text style={styles.modalButtonText}>Attack</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Troop recruitment modal
              <>
                <Text style={styles.actionModalTitle}>Recruit Troops</Text>
                <Text style={styles.actionModalSubtitle}>
                  How many troops do you want to recruit?
                </Text>
                <TextInput
                  style={styles.input}
                  value={recruitAmount}
                  onChangeText={setRecruitAmount}
                  placeholder="Number of troops"
                  keyboardType="numeric"
                />
                <Text style={styles.costText}>
                  Cost: {(parseInt(recruitAmount) || 0) * 10} gold, {(parseInt(recruitAmount) || 0) * 2} food
                </Text>
                <Text style={styles.availableText}>
                  Available: {currentPlayer.resources.gold} gold, {currentPlayer.resources.food} food
                </Text>
                <View style={styles.actionModalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setActionModalVisible(false);
                      setRecruitAmount('');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleRecruitTroops}
                  >
                    <Text style={styles.modalButtonText}>Recruit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  provinceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  resourcesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  resourceText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  actionsContainer: {
    gap: 10,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  claimButton: {
    backgroundColor: '#4ECDC4',
  },
  warButton: {
    backgroundColor: '#FF6B6B',
  },
  recruitButton: {
    backgroundColor: '#45B7D1',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    width: '80%',
    maxWidth: 300,
  },
  actionModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  actionModalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  costText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  availableText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#CCCCCC',
  },
  confirmButton: {
    backgroundColor: '#FF6B6B',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProvinceDetails;