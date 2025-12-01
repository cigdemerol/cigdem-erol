
import { DataPoint, ScoredDataPoint, ClassType, DatasetStats, DistanceMetric, VotingStrategy, DatasetType } from '../types';

export const calculateEuclideanDistance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const calculateManhattanDistance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number => {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
};

export const calculateChebyshevDistance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number => {
  return Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
};

export const calculateMinkowskiDistance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p: number
): number => {
  return Math.pow(Math.pow(Math.abs(p1.x - p2.x), p) + Math.pow(Math.abs(p1.y - p2.y), p), 1 / p);
};

export const calculateCosineDistance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number => {
  // Cosine Similarity = (A . B) / (||A|| * ||B||)
  // Cosine Distance = 1 - Similarity
  const dotProduct = p1.x * p2.x + p1.y * p2.y;
  const magnitude1 = Math.sqrt(p1.x * p1.x + p1.y * p1.y);
  const magnitude2 = Math.sqrt(p2.x * p2.x + p2.y * p2.y);

  if (magnitude1 === 0 || magnitude2 === 0) return 1.0; // Max distance if one vector is zero

  const similarity = dotProduct / (magnitude1 * magnitude2);
  // Clamp similarity to -1 to 1 range to avoid floating point errors
  const clampedSimilarity = Math.max(-1, Math.min(1, similarity));
  
  return 1 - clampedSimilarity;
};

export const calculateJaccardDistance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number => {
  // Generalized Jaccard (Ruzicka similarity) for continuous variables
  // J(A,B) = sum(min(Ai, Bi)) / sum(max(Ai, Bi))
  // Distance = 1 - J(A,B)
  
  const minSum = Math.min(p1.x, p2.x) + Math.min(p1.y, p2.y);
  const maxSum = Math.max(p1.x, p2.x) + Math.max(p1.y, p2.y);

  if (maxSum === 0) return 0; // If both are origin, they are same

  return 1 - (minSum / maxSum);
};

export const calculateHammingDistance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number => {
  // Hamming Distance for 2D Grid:
  // Counts dimensions that are DIFFERENT.
  // In a 10x10 grid (0-100 scale), we check which "cell" the point belongs to.
  // Cell size is 10.
  const quantization = 10; 
  
  // We use Math.floor to identify the grid index (0 to 9)
  const x1_idx = Math.floor(p1.x / quantization);
  const x2_idx = Math.floor(p2.x / quantization);
  const y1_idx = Math.floor(p1.y / quantization);
  const y2_idx = Math.floor(p2.y / quantization);

  const xDiff = x1_idx !== x2_idx ? 1 : 0;
  const yDiff = y1_idx !== y2_idx ? 1 : 0;
  
  return xDiff + yDiff;
};

// Helper to normalize a value to 0-1 range
const normalize = (value: number, min: number, max: number) => {
    if (max === min) return 0;
    return (value - min) / (max - min);
};

export const findNearestNeighbors = (
  dataset: DataPoint[],
  target: { x: number; y: number },
  k: number,
  metric: DistanceMetric = 'Euclidean',
  pValue: number = 3, // For Minkowski
  useScaling: boolean = false,
  isUnbalanced: boolean = false
): ScoredDataPoint[] => {
  
  // Simulation of Feature Ranges
  const rangeMultX = 1;
  const rangeMultY = isUnbalanced ? 50 : 1; // 50x magnitude difference for Y

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  if (useScaling) {
      const allPoints = [...dataset, { ...target, id: -1, label: 'A' as ClassType }];
      allPoints.forEach(p => {
          const valX = p.x * rangeMultX;
          const valY = p.y * rangeMultY;
          if (valX < minX) minX = valX;
          if (valX > maxX) maxX = valX;
          if (valY < minY) minY = valY;
          if (valY > maxY) maxY = valY;
      });
  }

  // 1. Calculate distances for all points
  const scoredPoints = dataset.map((point) => {
    let distance = 0;
    
    let p1x, p1y, p2x, p2y;

    if (useScaling) {
        p1x = normalize(point.x * rangeMultX, minX, maxX);
        p1y = normalize(point.y * rangeMultY, minY, maxY);
        p2x = normalize(target.x * rangeMultX, minX, maxX);
        p2y = normalize(target.y * rangeMultY, minY, maxY);
    } else {
        p1x = point.x * rangeMultX;
        p1y = point.y * rangeMultY;
        p2x = target.x * rangeMultX;
        p2y = target.y * rangeMultY;
    }

    const p1 = { x: p1x, y: p1y };
    const p2 = { x: p2x, y: p2y };

    switch (metric) {
      case 'Manhattan':
        distance = calculateManhattanDistance(p1, p2);
        break;
      case 'Chebyshev':
        distance = calculateChebyshevDistance(p1, p2);
        break;
      case 'Minkowski':
        distance = calculateMinkowskiDistance(p1, p2, pValue);
        break;
      case 'Hamming':
        // For Hamming, we use original coordinates to respect the Grid Structure
        distance = calculateHammingDistance({x: point.x, y: point.y}, {x: target.x, y: target.y});
        break;
      case 'Cosine':
        distance = calculateCosineDistance(p1, p2);
        break;
      case 'Jaccard':
        distance = calculateJaccardDistance(p1, p2);
        break;
      case 'Euclidean':
      default:
        distance = calculateEuclideanDistance(p1, p2);
        break;
    }

    return {
      ...point,
      distance,
    };
  });

  // 2. Sort by distance (ascending)
  scoredPoints.sort((a, b) => {
    const diff = a.distance - b.distance;
    
    // Tie-breaker using simple Euclidean on visual coordinates
    // Crucial for Hamming where many points have distance 1 or 2
    if (Math.abs(diff) < 0.00001) {
       const distA = calculateEuclideanDistance(a, target);
       const distB = calculateEuclideanDistance(b, target);
       return distA - distB;
    }
    
    return diff;
  });

  // 3. Take the top K
  return scoredPoints.slice(0, k);
};

export const classifyPoint = (
  neighbors: ScoredDataPoint[],
  strategy: VotingStrategy = 'Majority'
): DatasetStats => {
  const scores: Record<ClassType, number> = { A: 0, B: 0, C: 0 };
  let totalScore = 0;

  neighbors.forEach((n) => {
    let score = 1;
    
    if (strategy === 'Weighted') {
      const epsilon = 0.001;
      score = 1 / (n.distance + epsilon);
    }

    scores[n.label] += score;
    totalScore += score;
  });

  let maxScore = -1;
  let winner: ClassType | 'Tie' | null = null;
  let isTie = false;

  (Object.keys(scores) as ClassType[]).forEach((key) => {
    if (scores[key] > maxScore) {
      maxScore = scores[key];
      winner = key;
      isTie = false;
    } else if (Math.abs(scores[key] - maxScore) < 0.0001) {
      isTie = true;
    }
  });

  return {
    classCounts: scores,
    totalScore,
    winner: isTie ? 'Tie' : winner,
  };
};

export const generateRandomDataset = (count: number, type: DatasetType = 'Continuous'): DataPoint[] => {
  const points: DataPoint[] = [];
  
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let x, y, label: ClassType;

    // Cluster logic
    if (rand < 0.33) {
      label = 'A';
      x = 10 + Math.random() * 40;
      y = 10 + Math.random() * 40;
    } else if (rand < 0.66) {
      label = 'B';
      x = 50 + Math.random() * 40;
      y = 50 + Math.random() * 40;
    } else {
      label = 'C';
      x = 50 + Math.random() * 40;
      y = 10 + Math.random() * 40;
    }
    
    if (Math.random() > 0.8) {
        x = Math.random() * 100;
        y = Math.random() * 100;
    }

    // Clamp values
    x = Math.min(95, Math.max(5, x));
    y = Math.min(95, Math.max(5, y));

    if (type === 'Categorical') {
        // Snap to grid centers (5, 15, 25 ... 95)
        // Grid size 10.
        x = Math.floor(x / 10) * 10 + 5;
        y = Math.floor(y / 10) * 10 + 5;
    }

    points.push({
      id: i,
      x,
      y,
      label,
    });
  }
  return points;
};

// Helper for UI to snap target point
export const snapToGrid = (val: number): number => {
    return Math.floor(val / 10) * 10 + 5;
};
