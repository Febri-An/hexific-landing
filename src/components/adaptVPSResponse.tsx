"use client";

interface DetailedFinding {
  type: string;
  impact: string;
  confidence: string;
  description: string;
  source_code?: string;
  location: {
    filename?: string;
    lines?: number[];
    start?: number;
    length?: number;
  } | null;
}

interface AuditResult {
  success: boolean;
  projectId?: string;
  timestamp?: string;
  results?: {
    summary: {
      critical?: number;
      major?: number;
      medium?: number;
      minor?: number;
      informational?: number;
    };
    detailedFindings: DetailedFinding[];
    rawOutput: string;
  };
  error?: string;
  // For address audit
  contract_name?: string;
  contract_address?: string;
  network?: string;
  compiler_version?: string;
  ai_model?: string;
  analysis_id?: string;
  cost_usd?: number;
  detailed_audit?: string;
}

interface VPSDetector {
  elements: Array<{
    type: string;
    name: string;
    source_mapping: {
      start: number;
      length: number;
      filename_relative: string;
      filename_absolute: string;
      filename_short: string;
      is_dependency: boolean;
      lines: number[];
      starting_column: number;
      ending_column: number;
    };
  }>;
  description: string;
  markdown: string;
  first_markdown_element: string;
  id: string;
  check: string;
  impact: string;
  confidence: string;
}

interface VPSResponse {
  analysis_id: string;
  filename: string;
  timestamp: string;
  results: {
    success: boolean;
    error: string | null;
    results: {
      detectors: VPSDetector[];
    };
  };
  exit_code: number;
}

// Helper function to strip description to first line only
function stripDescription(description: string): string {
  if (!description) return '';
  // Get only the first line (before any newline, colon+newline, or bullet point)
  const firstLine = description.split('\n')[0].trim();
  // Remove trailing colon if present
  return firstLine.endsWith(':') ? firstLine.slice(0, -1) : firstLine;
}

function adaptVPSResponse(vpsData: any): AuditResult {
  // Handle error response
  if (vpsData && vpsData.success === false && vpsData.error) {
    return {
      success: false,
      error: vpsData.error,
    };
  }

  // Check if it's the new static audit format (single file with findings array)
  if (vpsData && 'findings' in vpsData && 'summary' in vpsData && Array.isArray(vpsData.findings)) {
    // Single file static audit format
    const summary = {
      critical: vpsData.summary.critical || 0,
      major: vpsData.summary.major || 0,
      medium: vpsData.summary.medium || 0,
      minor: vpsData.summary.minor || 0,
      informational: vpsData.summary.informational || 0,
    };

    const detailedFindings: DetailedFinding[] = vpsData.findings.map((finding: any) => ({
      type: finding.title || finding.type || 'Unknown',
      impact: finding.severity || finding.impact || 'Unknown',
      confidence: finding.confidence || 'Medium',
      description: stripDescription(finding.description || ''),
      source_code: finding.source_code || finding.sourceCode || undefined,
      location: finding.locations ? {
        filename: finding.locations.filename,
        lines: finding.locations.lines,
        start: finding.locations.start,
        length: finding.locations.length,
      } : null,
    }));

    return {
      success: vpsData.success,
      projectId: `audit-${Date.now()}`,
      timestamp: vpsData.timestamp,
      results: {
        summary,
        detailedFindings,
        rawOutput: JSON.stringify(vpsData, null, 2),
      },
    };
  }

  // Check if it's multi-file static audit format (array of audit results)
  if (Array.isArray(vpsData) && vpsData.length > 0 && 'findings' in vpsData[0] && 'summary' in vpsData[0]) {
    // Multi-file static audit format
    const allFindings: DetailedFinding[] = [];
    const combinedSummary = {
      critical: 0,
      major: 0,
      medium: 0,
      minor: 0,
      informational: 0,
    };

    vpsData.forEach((fileAudit: any) => {
      if (!fileAudit.success) return;

      // Merge summary counts
      combinedSummary.critical += fileAudit.summary.critical || 0;
      combinedSummary.major += fileAudit.summary.major || 0;
      combinedSummary.medium += fileAudit.summary.medium || 0;
      combinedSummary.minor += fileAudit.summary.minor || 0;
      combinedSummary.informational += fileAudit.summary.informational || 0;

      // Convert findings
      fileAudit.findings.forEach((finding: any) => {
        allFindings.push({
          type: finding.title,
          impact: finding.severity,
          confidence: finding.confidence,
          description: stripDescription(finding.description),
          source_code: finding.source_code || finding.sourceCode || undefined,
          location: {
            filename: finding.locations.filename,
            lines: finding.locations.lines,
            start: finding.locations.start,
            length: finding.locations.length,
          },
        });
      });
    });

    return {
      success: true,
      projectId: `multi-${Date.now()}`,
      timestamp: vpsData[0]?.timestamp || new Date().toISOString(),
      results: {
        summary: combinedSummary,
        detailedFindings: allFindings,
        rawOutput: JSON.stringify(vpsData, null, 2),
      },
    };
  }

  // Check if it's the old VPS format with detectors
  if (vpsData && vpsData.results && vpsData.results.results && Array.isArray(vpsData.results.results.detectors)) {
    // Old VPS format
    if (!vpsData.results.success || vpsData.results.error) {
      return {
        success: false,
        error: vpsData.results.error || 'Analysis failed',
      };
    }

    const summary = {
      critical: 0,
      major: 0,
      medium: 0,
      minor: 0,
      informational: 0,
    };

    const detailedFindings: DetailedFinding[] = [];

    try {
      const detectors = vpsData.results.results.detectors;

      detectors.forEach((detector: VPSDetector) => {
        const impact = detector.impact.toLowerCase();

        // Count by severity - map to standardized categories
        if (impact === 'critical') summary.critical++;
        else if (impact === 'high' || impact === 'major') summary.major++;
        else if (impact === 'medium') summary.medium++;
        else if (impact === 'low' || impact === 'minor') summary.minor++;
        else summary.informational++;

        // Store detailed finding
        detailedFindings.push({
          type: detector.check,
          impact: detector.impact,
          confidence: detector.confidence,
          description: stripDescription(detector.description),
          location: detector.elements[0]?.source_mapping ? {
            filename: detector.elements[0].source_mapping.filename_short,
            lines: detector.elements[0].source_mapping.lines,
            start: detector.elements[0].source_mapping.start,
            length: detector.elements[0].source_mapping.length,
          } : null,
        });
      });
    } catch (e) {
      console.error('Error parsing VPS response:', e);
      return {
        success: false,
        error: 'Failed to parse audit results',
      };
    }

    return {
      success: true,
      projectId: vpsData.analysis_id,
      timestamp: vpsData.timestamp,
      results: {
        summary,
        detailedFindings,
        rawOutput: JSON.stringify(vpsData.results.results, null, 2),
      },
    };
  }

  // Unknown format
  console.error('Unknown response format:', vpsData);
  return {
    success: false,
    error: 'Unknown audit response format',
  };
}

export { adaptVPSResponse };
export type { DetailedFinding, AuditResult, VPSDetector, VPSResponse };
