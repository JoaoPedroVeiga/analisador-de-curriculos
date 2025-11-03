import { Injectable } from '@nestjs/common';

// src/resume/benchmark.service.ts
@Injectable()
export class BenchmarkService {
  private readonly industryBenchmarks = {
    junior: { min: 0, max: 40, target: 30 },
    pleno: { min: 41, max: 70, target: 60 },
    senior: { min: 71, max: 85, target: 80 },
    expert: { min: 86, max: 100, target: 90 },
  };

  calculateLevel(score: number): string {
    if (score >= 86) return 'expert';
    if (score >= 71) return 'senior';
    if (score >= 41) return 'pleno';
    return 'junior';
  }

  getBenchmarkComparison(score: number, level: string) {
    const benchmark = this.industryBenchmarks[level];
    const percentage =
      ((score - benchmark.min) / (benchmark.max - benchmark.min)) * 100;

    return {
      level,
      percentage: Math.round(percentage),
      position: score >= benchmark.target ? 'above' : 'below',
      target_gap: Math.abs(score - benchmark.target),
    };
  }
}
