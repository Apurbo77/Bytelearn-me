import React, { useState, useRef } from 'react';
import { Award, Download, Eye, X, ArrowLeft } from 'lucide-react';

interface Certificate {
    id: number;
    courseTitle: string;
    courseId: number;
    studentName: string;
    verificationCode: string;
    issueDate: string;
    issueDateRaw: string;
}

interface CertificatesPageProps {
    certificates: Certificate[];
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    onNavigate: (page: string) => void;
}

export const CertificatesPage: React.FC<CertificatesPageProps> = ({ certificates = [], user, onNavigate }) => {
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
    const certificateRef = useRef<HTMLDivElement>(null);

    const getAwardedYear = (issueDateRaw?: string) => {
        if (!issueDateRaw) return new Date().getFullYear();
        const dt = new Date(issueDateRaw);
        return Number.isNaN(dt.getTime()) ? new Date().getFullYear() : dt.getFullYear();
    };

    const handleDownload = (cert: Certificate) => {
        // Create a printable version
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const awardedYear = getAwardedYear(cert.issueDateRaw);
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Certificate - ${cert.courseTitle}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Georgia', serif; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            min-height: 100vh;
                            background: #f5f5f5;
                            padding: 20px;
                        }
                        .certificate {
                            width: 800px;
                            padding: 60px;
                            background: white;
                            border: 3px solid #4a5568;
                            position: relative;
                        }
                        .certificate::before {
                            content: '';
                            position: absolute;
                            top: 15px;
                            left: 15px;
                            right: 15px;
                            bottom: 15px;
                            border: 1px solid #4a5568;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 2px solid #4a5568;
                            padding-bottom: 20px;
                            margin-bottom: 40px;
                        }
                        .header h1 {
                            font-size: 36px;
                            color: #2d3748;
                            letter-spacing: 4px;
                            font-weight: normal;
                        }
                        .content {
                            text-align: center;
                            padding: 20px 0;
                        }
                        .content p {
                            font-size: 18px;
                            color: #4a5568;
                            margin-bottom: 20px;
                        }
                        .student-name {
                            font-size: 32px;
                            color: #2d3748;
                            font-style: italic;
                            margin: 30px 0;
                            border-bottom: 1px solid #4a5568;
                            display: inline-block;
                            padding: 0 40px 10px;
                        }
                        .course-title {
                            font-size: 24px;
                            color: #2d3748;
                            font-weight: bold;
                            margin: 20px 0;
                        }
                        .badge {
                            width: 80px;
                            height: 80px;
                            margin: 30px auto;
                            background: #4a5568;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 12px;
                            text-align: center;
                        }
                        .footer {
                            display: flex;
                            justify-content: space-between;
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #e2e8f0;
                        }
                        .footer-item {
                            text-align: center;
                        }
                        .footer-item label {
                            font-size: 12px;
                            color: #718096;
                            display: block;
                            margin-bottom: 5px;
                        }
                        .footer-item span {
                            font-size: 14px;
                            color: #2d3748;
                        }
                        @media print {
                            body { background: white; padding: 0; }
                            .certificate { border: 3px solid #4a5568; }
                        }
                    </style>
                </head>
                <body>
                    <div class="certificate">
                        <div class="header">
                            <h1>CERTIFICATE OF COMPLETION</h1>
                        </div>
                        <div class="content">
                            <p>This is to certify that</p>
                            <div class="student-name">${cert.studentName}</div>
                            <p>has successfully completed the course</p>
                            <div class="course-title">${cert.courseTitle}</div>
                            <div class="badge">
                                    <span>Awarded<br/>${awardedYear}</span>
                            </div>
                        </div>
                        <div class="footer">
                            <div class="footer-item">
                                <label>Certificate ID:</label>
                                <span>${cert.verificationCode}</span>
                            </div>
                            <div class="footer-item">
                                <label>Awarded on:</label>
                                <span>${cert.issueDate}</span>
                            </div>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 pt-20 pb-16">
            <div className="container mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => window.location.href = '/student/dashboard'}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Certificates</h1>
                        <p className="text-slate-600">Download and share your achievements</p>
                    </div>
                </div>

                {certificates.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Award className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Certificates Yet</h3>
                        <p className="text-slate-500 mb-6">Complete a course to earn your first certificate!</p>
                        <a
                            href="/courses"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                        >
                            Browse Courses
                        </a>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map(cert => (
                            <div
                                key={cert.id}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all group"
                            >
                                {/* Certificate Preview */}
                                <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-900 p-6 relative">
                                    <div className="absolute inset-4 border border-slate-500 rounded-sm opacity-50"></div>
                                    <div className="relative z-10 text-center">
                                        <p className="text-slate-300 text-xs uppercase tracking-widest mb-2">Certificate of Completion</p>
                                        <p className="text-white font-semibold truncate">{cert.studentName}</p>
                                    </div>
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                                            <Award className="w-5 h-5 text-slate-300" />
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-5">
                                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">{cert.courseTitle}</h3>
                                    <p className="text-sm text-slate-500 mb-4">Awarded on {cert.issueDate}</p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedCertificate(cert)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDownload(cert)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Certificate Modal */}
            {selectedCertificate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-bold text-lg">Certificate Preview</h3>
                            <button
                                onClick={() => setSelectedCertificate(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Certificate Design */}
                        <div className="p-8" ref={certificateRef}>
                            <div className="border-4 border-slate-600 p-8 relative">
                                <div className="absolute inset-3 border border-slate-400"></div>

                                <div className="relative z-10">
                                    {/* Header */}
                                    <div className="text-center border-b-2 border-slate-600 pb-6 mb-8">
                                        <h1 className="text-4xl font-serif text-slate-800 tracking-widest">
                                            CERTIFICATE OF COMPLETION
                                        </h1>
                                    </div>

                                    {/* Content */}
                                    <div className="text-center py-8">
                                        <p className="text-slate-600 text-lg mb-6">This is to certify that</p>
                                        <p className="text-3xl font-serif italic text-slate-800 border-b border-slate-400 inline-block px-12 pb-2 mb-6">
                                            {selectedCertificate.studentName}
                                        </p>
                                        <p className="text-slate-600 text-lg mb-4">has successfully completed the course</p>
                                        <p className="text-2xl font-bold text-slate-800 mb-8">
                                            {selectedCertificate.courseTitle}
                                        </p>

                                        {/* Badge */}
                                        <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto text-white text-xs text-center">
                                            <span>Awarded<br />{getAwardedYear(selectedCertificate.issueDateRaw)}</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                                        <div>
                                            <p className="text-xs text-slate-500">Certificate ID:</p>
                                            <p className="text-sm font-mono text-slate-700">{selectedCertificate.verificationCode}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Awarded on:</p>
                                            <p className="text-sm text-slate-700">{selectedCertificate.issueDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedCertificate(null)}
                                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleDownload(selectedCertificate)}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-md transition-all flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
