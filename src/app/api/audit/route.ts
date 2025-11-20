// app/api/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, rm } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { randomUUID } from 'crypto';
import AdmZip from 'adm-zip';

const execAsync = promisify(exec);

const UPLOAD_DIR = path.join(process.cwd(), 'temp_audits');
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

interface AuditResult {
  success: boolean;
  projectId: string;
  timestamp: string;
  results?: {
    summary: {
      high: number;
      medium: number;
      low: number;
      informational: number;
      optimization: number;
    };
    detailedFindings: any[];
    rawOutput: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  let projectPath: string | null = null;

  try {
    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Get uploaded file
    const formData = await request.formData();
    const file = formData.get('foundryProject') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 100MB limit, Schedule a Call' },
        { status: 400 }
      );
    }

    // Validate file type (should be zip)
    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { success: false, error: 'Only ZIP files are accepted' },
        { status: 400 }
      );
    }

    // Create unique project directory
    const projectId = randomUUID();
    projectPath = path.join(UPLOAD_DIR, projectId);
    await mkdir(projectPath, { recursive: true });

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const zipPath = path.join(projectPath, 'project.zip');
    await writeFile(zipPath, buffer);

    // Extract zip file
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(projectPath, true);

    // Find the foundry.toml or src directory to validate it's a Foundry project
    const { stdout: findResult } = await execAsync(
      `find "${projectPath}" -name "foundry.toml" -o -type d -name "src" | head -1`
    );

    if (!findResult.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Foundry project structure. Must contain foundry.toml or src directory',
        },
        { status: 400 }
      );
    }

    // Determine the actual project root (might be in a subdirectory)
    const projectRoot = path.dirname(findResult.trim());

    // Run Slither analysis
    const slitherResult = await runSlitherAnalysis(projectRoot);

    // Parse results
    const auditResult: AuditResult = {
      success: true,
      projectId,
      timestamp: new Date().toISOString(),
      results: parseSlitherOutput(slitherResult),
    };

    return NextResponse.json(auditResult, { status: 200 });
  } catch (error: any) {
    console.error('Audit error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred during the audit',
      },
      { status: 500 }
    );
  } finally {
    // Clean up temporary files
    if (projectPath) {
      try {
        await rm(projectPath, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  }
}

async function runSlitherAnalysis(projectPath: string): Promise<string> {
  try {
    // Check if Slither is installed
    await execAsync('which slither');

    // Run Slither with JSON output
    const { stdout, stderr } = await execAsync(
      `cd "${projectPath}" && slither . --json - 2>&1`,
      {
        timeout: 120000, // 2 minutes timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      }
    );

    // Slither outputs to stderr by default, so combine both
    return stdout + stderr;
  } catch (error: any) {
    // Slither returns non-zero exit code even on successful analysis with findings
    if (error.stdout || error.stderr) {
      return error.stdout + error.stderr;
    }
    throw new Error(`Slither execution failed: ${error.message}`);
  }
}

function parseSlitherOutput(output: string): {
  summary: {
    high: number;
    medium: number;
    low: number;
    informational: number;
    optimization: number;
  };
  detailedFindings: any[];
  rawOutput: string;
} {
  const summary = {
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
    optimization: 0,
  };

  const detailedFindings: any[] = [];

  try {
    // Try to extract JSON output
    const jsonMatch = output.match(/\{[\s\S]*"success"[\s\S]*\}/);
    if (jsonMatch) {
      const jsonOutput = JSON.parse(jsonMatch[0]);

      if (jsonOutput.results && jsonOutput.results.detectors) {
        jsonOutput.results.detectors.forEach((detector: any) => {
          const impact = detector.impact?.toLowerCase() || 'informational';

          // Count by severity
          if (impact === 'high') summary.high++;
          else if (impact === 'medium') summary.medium++;
          else if (impact === 'low') summary.low++;
          else if (impact === 'optimization') summary.optimization++;
          else summary.informational++;

          // Store detailed finding
          detailedFindings.push({
            type: detector.check || 'unknown',
            impact: detector.impact || 'Informational',
            confidence: detector.confidence || 'Medium',
            description: detector.description || 'No description available',
            location: detector.elements?.[0]?.source_mapping || null,
          });
        });
      }
    } else {
      // Fallback: parse text output
      const lines = output.split('\n');
      lines.forEach((line) => {
        if (line.includes('High:')) summary.high++;
        else if (line.includes('Medium:')) summary.medium++;
        else if (line.includes('Low:')) summary.low++;
        else if (line.includes('Informational:')) summary.informational++;
        else if (line.includes('Optimization:')) summary.optimization++;
      });
    }
  } catch (parseError) {
    console.error('Error parsing Slither output:', parseError);
  }

  return {
    summary,
    detailedFindings,
    rawOutput: output,
  };
}

// Optional: Add a GET endpoint to check service health
export async function GET() {
  try {
    await execAsync('which slither');
    return NextResponse.json({
      status: 'healthy',
      slitherInstalled: true,
    });
  } catch {
    return NextResponse.json({
      status: 'unhealthy',
      slitherInstalled: false,
      error: 'Slither is not installed',
    });
  }
}