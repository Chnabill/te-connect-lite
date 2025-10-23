import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HrService {
  private apiUrl = `${environment.apiUrl}/hr`;

  constructor(private http: HttpClient) {}

  getStatistics() {
    // For now, return mock data
    // TODO: Replace with actual API call when backend is ready
    return of({
      totalEmployees: 127,
      retentionRate: 92.7,
      averagePerformance: 8.4,
      attendanceRate: 96.3,
      departmentDistribution: [
        { name: 'Engineering', count: 45, percentage: 35 },
        { name: 'Marketing', count: 25, percentage: 20 },
        { name: 'Sales', count: 32, percentage: 25 },
        { name: 'HR', count: 13, percentage: 10 },
        { name: 'Finance', count: 12, percentage: 10 }
      ],
      performanceTrends: [
        { quarter: 'Q1 2025', score: 7.8 },
        { quarter: 'Q2 2025', score: 8.1 },
        { quarter: 'Q3 2025', score: 8.4 }
      ],
      recentActivities: [
        {
          type: 'onboarding',
          title: 'New employee onboarded',
          description: 'Sarah Johnson joined the Marketing team',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          type: 'review',
          title: 'Performance review completed',
          description: 'Engineering team Q3 reviews finalized',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          type: 'training',
          title: 'Training scheduled',
          description: 'Leadership workshop for managers',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      ],
      turnoverAnalysis: {
        byDepartment: {
          'Engineering': 5.2,
          'Marketing': 8.7,
          'Sales': 12.5,
          'HR': 4.3,
          'Finance': 6.8
        },
        insights: [
          'Sales department has the highest turnover rate at 12.5%',
          'Engineering department shows improved retention with only 5.2% turnover',
          'Exit interviews indicate work-life balance as the primary concern'
        ]
      }
    });
  }

  // Autres méthodes pour RH
}
