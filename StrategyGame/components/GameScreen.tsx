import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Province } from '../types/game';
import GameMap from './GameMap';
import PlayerDashboard from './PlayerDashboard';
import ProvinceDetails from './ProvinceDetails';

interface GameScreenProps {
  currentPlayerId: string;
}

const GameScreen: React.FC<GameScreenProps> = ({ currentPlayerId }) => {
  const gameState = useSelector((state: RootState) => state.game);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);

  const handleProvincePress = (province: Province) => {
    setSelectedProvince(province);
  };

  const handleCloseProvinceDetails = () => {
    setSelectedProvince(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <PlayerDashboard currentPlayerId={currentPlayerId} />
      
      <View style={styles.mapContainer}>
        <GameMap
          onProvincePress={handleProvincePress}
          selectedProvinceId={selectedProvince?.id || null}
        />
      </View>

      <ProvinceDetails
        province={selectedProvince}
        currentPlayerId={currentPlayerId}
        onClose={handleCloseProvinceDetails}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mapContainer: {
    flex: 1,
  },
});

export default GameScreen;