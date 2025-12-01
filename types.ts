
export type ClassType = 'A' | 'B' | 'C';

export type DistanceMetric = 'Euclidean' | 'Manhattan' | 'Chebyshev' | 'Minkowski' | 'Hamming' | 'Cosine' | 'Jaccard';

export type VotingStrategy = 'Majority' | 'Weighted';

export type DatasetType = 'Continuous' | 'Categorical';

export interface DataPoint {
  id: number;
  x: number;
  y: number;
  label: ClassType;
}

export interface ScoredDataPoint extends DataPoint {
  distance: number;
}

export interface DatasetStats {
  classCounts: Record<ClassType, number>;
  totalScore: number;
  winner: ClassType | 'Tie' | null;
}
