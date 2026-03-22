import { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Award, FileUp, BarChart3, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './DataValidator.module.css';

export default function DataValidator({ dataFamily='vision', onValidationComplete=null }) {
    const [activeTab, setActiveTab]=useState('requirements');
    const [validationResult, setValidationResult]=useState(null);
    const [uploading, setUploading]=useState(false);

    const requirements={
        vision: {
            title: 'ðŸ–¼ï¸ Vision (Image Classification)',
            description: 'Supervised image classification datasets',
            permissible: [
                'Medical imaging (with consent)',
                'Product categorization',
                'Scene understanding',
                'Object detection datasets',
                'High-resolution photos',
            ],
            notPermissible: [
                'Facial recognition (face databases)',
                'Personally identifiable biometrics',
                'License plates or vehicle IDs',
                'Documents with PII',
                'Copyrighted artwork (without license)',
            ],
            format: `
my_dataset/
â”œâ”€â”€ class_A/
â”‚   â”œâ”€â”€ image1.jpg
â”‚   â”œâ”€â”€ image2.png
â”‚   â””â”€â”€ image3.webp
â”œâ”€â”€ class_B/
â”‚   â”œâ”€â”€ image1.jpg
â”‚   â””â”€â”€ image2.jpg
â””â”€â”€ class_C/
    â””â”€â”€ image1.jpg
            `.trim(),
            specs: [
                'âœ“ Supported formats: JPG, PNG, WebP, BMP, TIFF',
                'âœ“ Recommended size: 224Ã—224 to 512Ã—512 pixels',
                'âœ“ Minimum ~50 images per class',
                'âœ“ Balanced classes (avoid >2:1 ratio)',
                'âš  Large images increase memory usage',
            ],
        },
        vision_transformer: {
            title: 'ðŸŽ¯ Vision Transformer',
            description: 'Transformer-based image understanding',
            permissible: [
                'Medical scans',
                'Satellite imagery',
                'Scene understanding',
                'Fine-grained classification',
            ],
            notPermissible: [
                'Facial databases',
                'Personal photo collections',
                'Biometric data',
                'Copyrighted content',
            ],
            format: `
my_dataset/
â”œâ”€â”€ class_A/
â”‚   â””â”€â”€ image1.jpg
â””â”€â”€ class_B/
    â””â”€â”€ image1.jpg
            `.trim(),
            specs: [
                'âœ“ Format: ImageFolder (same as Vision)',
                'âœ“ Preferred size: 224Ã—224 (16Ã—16 patches)',
                'âœ“ Square aspect ratio works best',
                'âœ“ Minimum ~100 images per class',
                'âš  Transformers need more data than CNNs',
            ],
        },
        nlp: {
            title: 'ðŸ“ NLP (Text Classification)',
            description: 'Text classification and sentiment analysis',
            permissible: [
                'Customer reviews',
                'Social media (with consent)',
                'News articles',
                'Product feedback',
                'Sentiment analysis datasets',
                'Topic classification',
            ],
            notPermissible: [
                'Private messages',
                'Personal emails',
                'Medical records',
                'Financial information',
                'Personally identifiable text',
            ],
            format: `
train.csv:
text,label
"Great product!",positive
"Decent.",neutral
"Terrible.",negative
            `.trim(),
            specs: [
                'âœ“ Format: CSV with "text" and "label" columns',
                'âœ“ UTF-8 encoding required',
                'âœ“ Max 512 tokens per sample',
                'âœ“ Minimum ~100 samples per class',
                'âš  Remove duplicates and spam',
                'âš  Balance classes for best results',
            ],
        },
        audio: {
            title: 'ðŸŽµ Audio (Audio Classification)',
            description: 'Audio classification and sound recognition',
            permissible: [
                'Environmental sounds',
                'Animal sounds/bird calls',
                'Speech datasets (with consent)',
                'Music genre classification',
                'Urban sounds',
                'Industrial noise patterns',
            ],
            notPermissible: [
                'Private conversations',
                'Recordings without consent',
                'Copyrighted music',
                'Personal voice data',
                'Sensitive audio content',
            ],
            format: `
my_dataset/
â”œâ”€â”€ class_A/
â”‚   â”œâ”€â”€ sound1.wav
â”‚   â””â”€â”€ sound2.wav
â””â”€â”€ class_B/
    â””â”€â”€ sound1.wav
            `.trim(),
            specs: [
                'âœ“ Format: WAV (preferred), FLAC, MP3',
                'âœ“ Sample rate: 16,000 Hz (mono)',
                'âœ“ Duration: 1â€“30 seconds per clip',
                'âœ“ Minimum ~20 clips per class',
                'âš  Normalize audio levels',
                'âš  Remove background noise if possible',
            ],
        },
        edge: {
            title: 'âš¡ Edge (IoT/Minimal Footprint)',
            description: 'Lightweight models for edge devices',
            permissible: [
                'Sensor data (temperature, humidity, etc.)',
                'Time series data',
                'Industrial IoT readings',
                'Environmental monitoring',
            ],
            notPermissible: [
                'Location data',
                'Personal sensor streams',
                'Health biometrics',
                'User activity data',
            ],
            format: `
Sensor readings (CSV or time-series):
timestamp,sensor_A,sensor_B,label
2024-01-01 10:00,25.3,60.2,normal
2024-01-01 10:01,25.4,60.1,normal
            `.trim(),
            specs: [
                'âœ“ Format: CSV or JSON time-series',
                'âœ“ Minimal preprocessing required',
                'âœ“ Works with small models',
                'âœ“ Low latency inference',
                'âš  Handle missing values',
                'âš  Normalize numerical ranges',
            ],
        },
    };

    const currentRequirements=requirements[dataFamily] || requirements.vision;

    const simulateValidation=() => {
        setUploading(true);
        setTimeout(() => {
            setValidationResult({
                status: 'valid',
                totalSamples: 450,
                samplesPerClass: { className: 150, classB: 150, classC: 150 },
                coverage: 95,
                issues: [],
                warnings: ['Consider augmenting class C with similar samples'],
            });
            setUploading(false);
            setActiveTab('results');
        }, 2000);
    };

    return (
        <div className={styles.validator}>
            {/* Header */}
            <section className={styles.header}>
                <div className="container">
                    <h2>Data Validator & Guidelines</h2>
                    <p>Learn what data is permissible for federated learning and validate your dataset</p>
                </div>
            </section>

            {/* Tabs */}
            <section className={styles.tabsSection}>
                <div className="container">
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab=== 'requirements' ? styles.active : ''}`}
                            onClick={() => setActiveTab('requirements')}
                        >
                            <Award size={18} />
                            Requirements
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab=== 'validate' ? styles.active : ''}`}
                            onClick={() => setActiveTab('validate')}
                        >
                            <BarChart3 size={18} />
                            Validate Data
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab=== 'results' ? styles.active : ''}`}
                            onClick={() => setActiveTab('results')}
                            disabled={!validationResult}
                        >
                            <CheckCircle size={18} />
                            Results
                        </button>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className={styles.content}>
                <div className="container">
                    {/* Requirements Tab */}
                    {activeTab=== 'requirements' && (
                        <div className={styles.tabContent}>
                            <div className={styles.requirementsGrid}>
                                {/* Left: Description */}
                                <div className={styles.section}>
                                    <h3>{currentRequirements.title}</h3>
                                    <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-text-secondary)' }}>
                                        {currentRequirements.description}
                                    </p>

                                    {/* Permissible */}
                                    <div style={{ marginBottom: 'var(--space-xl)' }}>
                                        <h4 style={{ color: 'var(--color-success)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <CheckCircle size={18} />
                                            âœ“ Permissible Data
                                        </h4>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {currentRequirements.permissible.map((item, i) => (
                                                <li key={i} style={{ padding: '8px 0', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Not Permissible */}
                                    <div>
                                        <h4 style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <XCircle size={18} />
                                            âœ— NOT Permissible Data
                                        </h4>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {currentRequirements.notPermissible.map((item, i) => (
                                                <li key={i} style={{ padding: '8px 0', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Right: Format & Specs */}
                                <div className={styles.section}>
                                    <div className={styles.card}>
                                        <h4 style={{ marginBottom: 'var(--space-md)' }}>Expected Format</h4>
                                        <pre className={styles.codeBlock}>{currentRequirements.format}</pre>
                                    </div>

                                    <div className={styles.card}>
                                        <h4 style={{ marginBottom: 'var(--space-md)' }}>Technical Specifications</h4>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {currentRequirements.specs.map((spec, i) => (
                                                <li
                                                    key={i}
                                                    style={{
                                                        padding: '8px 0',
                                                        fontSize: '0.9rem',
                                                        color: spec.startsWith('âœ“') ? 'var(--color-success)' : spec.startsWith('âš ') ? 'var(--color-warning)' : 'var(--color-text-secondary)',
                                                        borderBottom: '1px solid var(--color-border)',
                                                    }}
                                                >
                                                    {spec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Validate Tab */}
                    {activeTab=== 'validate' && (
                        <div className={styles.tabContent}>
                            <div className={styles.validateSection}>
                                <div className={styles.uploadBox}>
                                    <FileUp size={48} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }} />
                                    <h4>Upload Your Dataset</h4>
                                    <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>
                                        Select your {currentRequirements.title.split('(')[1]?.slice(0, -1) || 'data'} folder to validate
                                    </p>

                                    <div className={styles.uploadArea}>
                                        <input
                                            type="file"
                                            multiple
                                            style={{ display: 'none' }}
                                            id="fileInput"
                                        />
                                        <label htmlFor="fileInput" className={styles.uploadLabel}>
                                            <Zap size={32} style={{ marginBottom: 'var(--space-sm)', color: 'var(--color-primary)' }} />
                                            <p>Drag dataset folder here or click to browse</p>
                                        </label>
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={simulateValidation}
                                        disabled={uploading}
                                        style={{ marginTop: 'var(--space-lg)' }}
                                    >
                                        {uploading ? 'Validating...' : 'Validate Dataset'}
                                    </button>
                                </div>

                                {/* Validation Info */}
                                <div className={styles.infoPanel}>
                                    <h4 style={{ marginBottom: 'var(--space-md)' }}>Validation Checks</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                        <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0, 229, 160, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CheckCircle size={14} color="var(--color-success)" />
                                            </div>
                                            <span>Dataset structure and format</span>
                                        </li>
                                        <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0, 229, 160, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CheckCircle size={14} color="var(--color-success)" />
                                            </div>
                                            <span>File integrity and readability</span>
                                        </li>
                                        <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0, 229, 160, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CheckCircle size={14} color="var(--color-success)" />
                                            </div>
                                            <span>Class balance and distribution</span>
                                        </li>
                                        <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0, 229, 160, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CheckCircle size={14} color="var(--color-success)" />
                                            </div>
                                            <span>Sufficient sample size</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Tab */}
                    {activeTab=== 'results' && validationResult && (
                        <div className={styles.tabContent}>
                            <div className={styles.resultsSection}>
                                {/* Status */}
                                <div className={styles.statusBox} style={{ borderColor: validationResult.status=== 'valid' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                        {validationResult.status=== 'valid' ? (
                                            <CheckCircle size={48} color="var(--color-success)" />
                                        ) : (
                                            <AlertCircle size={48} color="var(--color-warning)" />
                                        )}
                                        <div>
                                            <h3 style={{ color: validationResult.status=== 'valid' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                                                {validationResult.status=== 'valid' ? 'âœ“ Ready for FL' : 'âš  Needs Adjustment'}
                                            </h3>
                                            <p style={{ color: 'var(--color-text-secondary)' }}>
                                                Dataset is {validationResult.status=== 'valid' ? 'ready' : 'not yet ready'} for federated learning
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className={styles.metricsGrid}>
                                    <div className={styles.metric}>
                                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Samples</p>
                                        <h3>{validationResult.totalSamples}</h3>
                                    </div>
                                    <div className={styles.metric}>
                                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>Classes</p>
                                        <h3>{Object.keys(validationResult.samplesPerClass).length}</h3>
                                    </div>
                                    <div className={styles.metric}>
                                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>Coverage</p>
                                        <h3>{validationResult.coverage}%</h3>
                                    </div>
                                </div>

                                {/* Class Distribution */}
                                <div className={styles.distributionCard}>
                                    <h4 style={{ marginBottom: 'var(--space-lg)' }}>Class Distribution</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                        {Object.entries(validationResult.samplesPerClass).map(([className, count]) => (
                                            <div key={className}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                                                    <span>{className}</span>
                                                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{count} samples</span>
                                                </div>
                                                <div style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div
                                                        style={{
                                                            height: '100%',
                                                            width: `${(count/validationResult.totalSamples)*100}%`,
                                                            background: 'linear-gradient(90deg, #6c63ff, #00d4ff)',
                                                            borderRadius: '4px',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Warnings */}
                                {validationResult.warnings.length>0 && (
                                    <div className={styles.warningsCard}>
                                        <h4 style={{ color: 'var(--color-warning)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <AlertCircle size={20} />
                                            Recommendations
                                        </h4>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {validationResult.warnings.map((warning, i) => (
                                                <li key={i} style={{ padding: '8px 0', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                                                    {warning}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
