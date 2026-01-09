'use client';

import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    pdf,
    Svg,
    Path,
    Circle,
} from '@react-pdf/renderer';
import type { AuditResult, DetailedFinding } from './adaptVPSResponse';

// Premium Color Palette
const colors = {
    // Primary brand
    primary: '#84cc16', // lime-500
    primaryLight: '#bef264', // lime-300
    primaryDark: '#65a30d', // lime-600

    // Background & surfaces
    darkBg: '#0f172a', // slate-900
    cardBg: '#1e293b', // slate-800
    lightBg: '#f8fafc', // slate-50

    // Text
    textPrimary: '#0f172a', // slate-900
    textSecondary: '#64748b', // slate-500
    textMuted: '#94a3b8', // slate-400

    // Severity colors
    critical: '#dc2626', // red-600
    criticalBg: '#fef2f2', // red-50
    major: '#ea580c', // orange-600
    majorBg: '#fff7ed', // orange-50
    medium: '#ca8a04', // yellow-600
    mediumBg: '#fefce8', // yellow-50
    minor: '#2563eb', // blue-600
    minorBg: '#eff6ff', // blue-50
    informational: '#6b7280', // gray-500
    infoBg: '#f9fafb', // gray-50

    // Accents
    success: '#16a34a',
    successBg: '#f0fdf4',
    border: '#e2e8f0', // slate-200
};

// Enhanced Styles
const styles = StyleSheet.create({
    // ==================== PAGES ====================
    page: {
        padding: 0,
        backgroundColor: colors.lightBg,
        fontFamily: 'Helvetica',
    },
    contentPage: {
        paddingTop: 60,
        paddingBottom: 60,
        paddingHorizontal: 50,
        backgroundColor: colors.lightBg,
        fontFamily: 'Helvetica',
    },

    // ==================== COVER PAGE ====================
    coverPage: {
        flex: 1,
        backgroundColor: colors.darkBg,
    },
    coverHeader: {
        backgroundColor: colors.darkBg,
        paddingTop: 60,
        paddingHorizontal: 50,
        paddingBottom: 40,
    },
    coverLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 2,
    },
    logoAccent: {
        color: colors.primary,
    },
    coverSubtitle: {
        fontSize: 11,
        color: colors.textMuted,
        letterSpacing: 3,
        textTransform: 'uppercase',
    },

    // Hero Section
    heroSection: {
        paddingHorizontal: 50,
        paddingTop: 60,
        paddingBottom: 40,
    },
    heroTitle: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        lineHeight: 1.1,
    },
    heroSubtitle: {
        fontSize: 18,
        color: colors.primary,
        marginBottom: 30,
    },

    // Meta Info Box
    metaBox: {
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        padding: 24,
        marginHorizontal: 50,
        marginBottom: 30,
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    metaLabel: {
        fontSize: 10,
        color: colors.textMuted,
        width: 100,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    metaValue: {
        fontSize: 11,
        color: '#ffffff',
        flex: 1,
    },

    // Score Section
    scoreSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 50,
        marginTop: 20,
        gap: 12,
    },
    scoreCard: {
        flex: 1,
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    scoreNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    scoreLabel: {
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // Cover Footer
    coverFooter: {
        position: 'absolute',
        bottom: 40,
        left: 50,
        right: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 9,
        color: colors.textMuted,
    },
    footerBrand: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // ==================== CONTENT PAGES ====================
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: 24,
    },
    pageHeaderLogo: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.textPrimary,
        letterSpacing: 1,
    },
    pageNumber: {
        fontSize: 10,
        color: colors.textSecondary,
    },

    // Section Headers
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    sectionIcon: {
        width: 28,
        height: 28,
        borderRadius: 6,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    sectionSubtitle: {
        fontSize: 10,
        color: colors.textSecondary,
        marginTop: 2,
    },

    // Summary Grid on content page
    summaryGridContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    summaryCardContent: {
        width: '18%',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },

    // ==================== FINDINGS ====================
    findingCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    findingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    findingNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.lightBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    findingNumberText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.textSecondary,
    },
    findingTitleContainer: {
        flex: 1,
    },
    findingTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    findingConfidence: {
        fontSize: 8,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    severityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    severityText: {
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    findingBody: {
        padding: 12,
    },
    findingDescription: {
        fontSize: 10,
        color: colors.textSecondary,
        lineHeight: 1.6,
        marginBottom: 10,
    },
    findingLocation: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.lightBg,
        padding: 8,
        borderRadius: 4,
    },
    locationIcon: {
        marginRight: 6,
        marginTop: 1,
        fontSize: 9,
        color: colors.textSecondary,
    },
    locationText: {
        fontSize: 9,
        color: colors.textSecondary,
        fontFamily: 'Courier',
        flex: 1,
        flexWrap: 'wrap',
    },
    // Code Block
    codeBlock: {
        backgroundColor: '#1e293b',
        borderRadius: 4,
        padding: 10,
        marginTop: 8,
    },
    codeText: {
        fontSize: 8,
        fontFamily: 'Courier',
        color: '#e2e8f0',
        lineHeight: 1.4,
    },
    codeLabel: {
        fontSize: 8,
        color: colors.textMuted,
        marginBottom: 4,
    },

    // ==================== SUCCESS BOX ====================
    successBox: {
        backgroundColor: colors.successBg,
        borderRadius: 8,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    successIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    successTextContainer: {
        flex: 1,
    },
    successTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 4,
    },
    successSubtitle: {
        fontSize: 10,
        color: '#15803d',
    },

    // ==================== FOOTER ====================
    pageFooter: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    // ==================== DIVIDER ====================
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 20,
    },
});

// Helper to get severity colors
const getSeverityStyle = (severity: string) => {
    const s = severity.toLowerCase();
    const severityMap: Record<string, { bg: string; text: string; border: string }> = {
        critical: { bg: colors.criticalBg, text: colors.critical, border: colors.critical },
        major: { bg: colors.majorBg, text: colors.major, border: colors.major },
        medium: { bg: colors.mediumBg, text: colors.medium, border: colors.medium },
        minor: { bg: colors.minorBg, text: colors.minor, border: colors.minor },
    };
    return severityMap[s] || { bg: colors.infoBg, text: colors.informational, border: colors.informational };
};

// Shield Icon Component
const ShieldIcon = () => (
    <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            fill={colors.primary}
        />
    </Svg>
);

// Checkmark Icon Component  
const CheckIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path
            d="M20 6L9 17l-5-5"
            stroke="#ffffff"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </Svg>
);

// Score Card Component
interface ScoreCardProps {
    count: number;
    label: string;
    color: string;
    borderColor: string;
}

const ScoreCard = ({ count, label, color, borderColor }: ScoreCardProps) => (
    <View style={[styles.scoreCard, { borderColor: `${borderColor}40` }]}>
        <Text style={[styles.scoreNumber, { color }]}>{count}</Text>
        <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
);

// Finding Component
interface FindingItemProps {
    finding: DetailedFinding;
    index: number;
}

const FindingItem = ({ finding, index }: FindingItemProps) => {
    const severity = getSeverityStyle(finding.impact);

    return (
        <View style={[styles.findingCard]} wrap={false}>
            <View style={[styles.findingHeader, { backgroundColor: severity.bg }]}>
                <View style={styles.findingNumber}>
                    <Text style={styles.findingNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.findingTitleContainer}>
                    <Text style={styles.findingTitle}>{finding.type}</Text>
                    <Text style={styles.findingConfidence}>Confidence: {finding.confidence}</Text>
                </View>
                <View style={[styles.severityBadge, { backgroundColor: severity.text }]}>
                    <Text style={[styles.severityText, { color: '#ffffff' }]}>{finding.impact}</Text>
                </View>
            </View>
            <View style={styles.findingBody}>
                <Text style={styles.findingDescription}>{finding.description}</Text>
                {finding.source_code && (
                    <View style={styles.codeBlock}>
                        <Text style={styles.codeText}>{finding.source_code}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

// Main PDF Document
interface AuditReportPDFProps {
    result: AuditResult;
}

const AuditReportPDF = ({ result }: AuditReportPDFProps) => {
    const summary = result.results?.summary;
    const findings = result.results?.detailedFindings || [];
    const timestamp = result.timestamp
        ? new Date(result.timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : new Date().toLocaleString();

    // Categorize findings
    const criticalFindings = findings.filter(f =>
        ['critical', 'major'].includes(f.impact.toLowerCase())
    );
    const mediumFindings = findings.filter(f =>
        f.impact.toLowerCase() === 'medium'
    );
    const minorFindings = findings.filter(f =>
        ['minor', 'informational'].includes(f.impact.toLowerCase())
    );

    const totalIssues = Object.values(summary || {}).reduce((a, b) => a + (b || 0), 0);

    return (
        <Document>
            {/* ==================== COVER PAGE ==================== */}
            <Page size="A4" style={styles.page}>
                <View style={styles.coverPage}>
                    {/* Header */}
                    <View style={styles.coverHeader}>
                        <View style={styles.coverLogo}>
                            <Text style={styles.logoText}>
                                HEXIFIC<Text style={styles.logoAccent}>.</Text>
                            </Text>
                        </View>
                        <Text style={styles.coverSubtitle}>Smart Contract Security</Text>
                    </View>

                    {/* Hero */}
                    <View style={styles.heroSection}>
                        <Text style={styles.heroTitle}>Security Audit{'\n'}Report</Text>
                        <Text style={styles.heroSubtitle}>Comprehensive Vulnerability Assessment</Text>
                    </View>

                    {/* Meta Box */}
                    <View style={styles.metaBox}>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Report ID</Text>
                            <Text style={styles.metaValue}>{result.projectId || result.analysis_id || 'N/A'}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Generated</Text>
                            <Text style={styles.metaValue}>{timestamp}</Text>
                        </View>
                        {result.contract_name && (
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Contract</Text>
                                <Text style={styles.metaValue}>{result.contract_name}</Text>
                            </View>
                        )}
                        {result.contract_address && (
                            <View style={[styles.metaRow, { marginBottom: 0 }]}>
                                <Text style={styles.metaLabel}>Address</Text>
                                <Text style={styles.metaValue}>{result.contract_address}</Text>
                            </View>
                        )}
                    </View>

                    {/* Score Cards */}
                    {summary && (
                        <View style={styles.scoreSection}>
                            <ScoreCard
                                count={summary.critical || 0}
                                label="Critical"
                                color={colors.critical}
                                borderColor={colors.critical}
                            />
                            <ScoreCard
                                count={summary.major || 0}
                                label="Major"
                                color={colors.major}
                                borderColor={colors.major}
                            />
                            <ScoreCard
                                count={summary.medium || 0}
                                label="Medium"
                                color={colors.medium}
                                borderColor={colors.medium}
                            />
                            <ScoreCard
                                count={summary.minor || 0}
                                label="Minor"
                                color={colors.minor}
                                borderColor={colors.minor}
                            />
                            <ScoreCard
                                count={summary.informational || 0}
                                label="Info"
                                color={colors.informational}
                                borderColor={colors.informational}
                            />
                        </View>
                    )}

                    {/* Cover Footer */}
                    <View style={styles.coverFooter}>
                        <Text style={styles.footerText}>Confidential Security Report</Text>
                        <View style={styles.footerBrand}>
                            <ShieldIcon />
                            <Text style={[styles.footerText, { marginLeft: 6 }]}>hexific.com</Text>
                        </View>
                    </View>
                </View>
            </Page>

            {/* ==================== FINDINGS PAGES ==================== */}
            {totalIssues > 0 && (
                <Page size="A4" style={styles.contentPage} wrap>
                    {/* Page Header */}
                    <View style={styles.pageHeader} fixed>
                        <Text style={styles.pageHeaderLogo}>HEXIFIC<Text style={{ color: colors.primary }}>.</Text></Text>
                        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                    </View>

                    {/* Critical/Major Findings */}
                    {criticalFindings.length > 0 && (
                        <View>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIcon, { backgroundColor: colors.criticalBg }]}>
                                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.critical }}>!</Text>
                                </View>
                                <View>
                                    <Text style={styles.sectionTitle}>Critical & Major Severity</Text>
                                    <Text style={styles.sectionSubtitle}>{criticalFindings.length} issue{criticalFindings.length > 1 ? 's' : ''} require immediate attention</Text>
                                </View>
                            </View>
                            {criticalFindings.map((finding, index) => (
                                <FindingItem key={`critical-${index}`} finding={finding} index={index} />
                            ))}
                        </View>
                    )}

                    {/* Medium Findings */}
                    {mediumFindings.length > 0 && (
                        <View>
                            {criticalFindings.length > 0 && <View style={styles.divider} />}
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIcon, { backgroundColor: colors.mediumBg }]}>
                                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.medium }}>!</Text>
                                </View>
                                <View>
                                    <Text style={styles.sectionTitle}>Medium Severity</Text>
                                    <Text style={styles.sectionSubtitle}>{mediumFindings.length} issue{mediumFindings.length > 1 ? 's' : ''} should be reviewed</Text>
                                </View>
                            </View>
                            {mediumFindings.map((finding, index) => (
                                <FindingItem key={`medium-${index}`} finding={finding} index={criticalFindings.length + index} />
                            ))}
                        </View>
                    )}

                    {/* Minor/Info Findings */}
                    {minorFindings.length > 0 && (
                        <View>
                            {(criticalFindings.length > 0 || mediumFindings.length > 0) && <View style={styles.divider} />}
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIcon, { backgroundColor: colors.minorBg }]}>
                                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.minor }}>i</Text>
                                </View>
                                <View>
                                    <Text style={styles.sectionTitle}>Minor & Informational</Text>
                                    <Text style={styles.sectionSubtitle}>{minorFindings.length} minor issue{minorFindings.length > 1 ? 's' : ''} or suggestions</Text>
                                </View>
                            </View>
                            {minorFindings.map((finding, index) => (
                                <FindingItem key={`minor-${index}`} finding={finding} index={criticalFindings.length + mediumFindings.length + index} />
                            ))}
                        </View>
                    )}

                    {/* Page Footer */}
                    <View style={styles.pageFooter} fixed>
                        <Text style={{ fontSize: 8, color: colors.textMuted }}>Generated by Hexific Security Platform</Text>
                        <Text style={{ fontSize: 8, color: colors.textMuted }}>hexific.com</Text>
                    </View>
                </Page>
            )}

            {/* ==================== SUCCESS PAGE (if no issues) ==================== */}
            {totalIssues === 0 && (
                <Page size="A4" style={styles.contentPage}>
                    <View style={styles.pageHeader}>
                        <Text style={styles.pageHeaderLogo}>HEXIFIC<Text style={{ color: colors.primary }}>.</Text></Text>
                        <Text style={styles.pageNumber}>Page 2 of 2</Text>
                    </View>

                    <View style={styles.successBox}>
                        <View style={styles.successIcon}>
                            <CheckIcon />
                        </View>
                        <View style={styles.successTextContainer}>
                            <Text style={styles.successTitle}>No Security Issues Found</Text>
                            <Text style={styles.successSubtitle}>
                                The audited smart contract passed all security checks. No critical, major, medium, or minor severity vulnerabilities were detected.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.pageFooter} fixed>
                        <Text style={{ fontSize: 8, color: colors.textMuted }}>Generated by Hexific Security Platform</Text>
                        <Text style={{ fontSize: 8, color: colors.textMuted }}>hexific.com</Text>
                    </View>
                </Page>
            )}
        </Document>
    );
};

// Export function to generate PDF blob
export const generateAuditPDF = async (result: AuditResult): Promise<Blob> => {
    const blob = await pdf(<AuditReportPDF result={result} />).toBlob();
    return blob;
};

export default AuditReportPDF;
