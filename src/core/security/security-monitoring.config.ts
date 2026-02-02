// src/config/security-monitoring.config.ts
export const SecurityMonitoringConfig = {
  // Monitoreo en tiempo real
  realtime: {
    failedLoginThreshold: 5,
    suspiciousActivityWindow: '5 minutes',
    alertChannels: ['slack', 'email', 'sms']
  },
  
  // Análisis de logs
  logAnalysis: {
    retentionDays: 365,
    sensitivePatterns: [
      /password.*=.*['"][^'"]+['"]/i,
      /token.*=.*['"][^'"]+['"]/i,
      /api[_-]?key.*=.*['"][^'"]+['"]/i
    ]
  },
  
  // Compliance reporting
  compliance: {
    iso25010: {
      reportingFrequency: 'monthly',
      autoGenerateReports: true,
      metrics: ['confidentiality', 'integrity', 'accountability']
    },
    gdpr: {
      dataSubjectAccess: true,
      rightToErasure: true,
      dataPortability: true
    }
  }
};