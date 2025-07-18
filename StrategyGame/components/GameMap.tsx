import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Circle, Text as SvgText, Line } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Province } from '../types/game';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface GameMapProps {
  onProvincePress: (province: Province) => void;
  selectedProvinceId: string | null;
}

const GameMap: React.FC<GameMapProps> = ({ onProvincePress, selectedProvinceId }) => {
  const { provinces, players } = useSelector((state: RootState) => state.game);

  const mapWidth = 400;
  const mapHeight = 350;

  const getProvinceColor = (province: Province) => {
    if (province.ownerId) {
      return players[province.ownerId]?.color || '#CCCCCC';
    }
    return '#E0E0E0'; // Neutral/unowned
  };

  const getProvinceRadius = (province: Province) => {
    // Base radius plus troops representation
    return Math.max(8, Math.min(16, 8 + province.troops / 3));
  };

  const renderConnections = () => {
    const connections: React.ReactElement[] = [];
    
    Object.values(provinces).forEach(province => {
      province.adjacentProvinces.forEach(adjacentId => {
        const adjacent = provinces[adjacentId];
        if (adjacent && province.id < adjacentId) { // Only render each connection once
          connections.push(
            <Line
              key={`${province.id}-${adjacentId}`}
              x1={province.x}
              y1={province.y}
              x2={adjacent.x}
              y2={adjacent.y}
              stroke="#DDDDDD"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        }
      });
    });
    
    return connections;
  };

  const renderProvinces = () => {
    return Object.values(provinces).map(province => (
      <TouchableOpacity
        key={province.id}
        onPress={() => onProvincePress(province)}
      >
        <Circle
          cx={province.x}
          cy={province.y}
          r={getProvinceRadius(province)}
          fill={getProvinceColor(province)}
          stroke={selectedProvinceId === province.id ? '#000000' : '#666666'}
          strokeWidth={selectedProvinceId === province.id ? 3 : 1}
        />
        <SvgText
          x={province.x}
          y={province.y - getProvinceRadius(province) - 4}
          fontSize="10"
          fill="#333333"
          textAnchor="middle"
          fontWeight="bold"
        >
          {province.name}
        </SvgText>
        <SvgText
          x={province.x}
          y={province.y + 3}
          fontSize="8"
          fill="#FFFFFF"
          textAnchor="middle"
          fontWeight="bold"
        >
          {province.troops}
        </SvgText>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        maximumZoomScale={2}
        minimumZoomScale={0.8}
        bouncesZoom={true}
      >
        <View style={styles.mapContainer}>
          <Svg width={mapWidth} height={mapHeight} style={styles.svg}>
            {renderConnections()}
            {renderProvinces()}
          </Svg>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  mapContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 10,
  },
  svg: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
  },
});

export default GameMap;