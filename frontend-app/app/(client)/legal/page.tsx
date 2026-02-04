import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">EmployAI</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <FileText className="h-10 w-10 text-amber-600" />
            Terms &amp; Conditions
          </h1>
          <p className="text-lg text-gray-600">
            Legal terms governing the use of EmployAI document management
            platform
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: December 7, 2025
          </p>
        </div>

        {/* Agreement Notice */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Important Notice
                </p>
                <p className="text-sm text-gray-700">
                  By accessing or using EmployAI, you agree to be bound by these
                  Terms and Conditions. If you do not agree with any part of
                  these terms, you must not use this platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {/* 1. Platform Purpose */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">1. Platform Purpose</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>
                EmployAI is an internal company document management and
                AI-assisted platform designed exclusively for authorized
                employees and administrators of your organization.
              </p>
              <p>
                This platform facilitates secure document exchange, storage, and
                AI-powered document querying within the company ecosystem.
              </p>
            </CardContent>
          </Card>

          {/* 2. Authorized Access Only */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                2. Authorized Access Only
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p className="font-semibold">
                2.1 Registration and Authentication
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Only authorized company employees with valid credentials may
                  access this platform
                </li>
                <li>
                  All users must complete email verification and multi-factor
                  authentication (MFA) via one-time password (OTP)
                </li>
                <li>
                  You are responsible for maintaining the confidentiality of
                  your account credentials
                </li>
                <li>
                  Any unauthorized access must be reported immediately to
                  administrators
                </li>
              </ul>

              <p className="font-semibold mt-4">2.2 Account Security</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Users must not share login credentials with any third party
                </li>
                <li>
                  Session cookies are used for authentication and may persist
                  for up to 7 days if &quot;Remember Me&quot; is selected
                </li>
                <li>
                  Unauthorized access attempts may result in account suspension
                  or termination
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. Document Ownership and Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                3. Document Ownership and Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p className="font-semibold">3.1 Company Ownership</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  All documents uploaded to EmployAI become the property of the
                  company
                </li>
                <li>
                  Users retain no personal ownership rights over uploaded
                  documents
                </li>
                <li>
                  The company reserves the right to use, modify, distribute, or
                  delete any uploaded content
                </li>
              </ul>

              <p className="font-semibold mt-4">3.2 Document Usage Rights</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Users may view and download documents marked as
                  &quot;APPROVED&quot; for work-related purposes only
                </li>
                <li>
                  Downloaded documents must not be shared outside the
                  organization without explicit authorization
                </li>
                <li>
                  Uploading documents grants the company an irrevocable,
                  worldwide, royalty-free license to use the content
                </li>
              </ul>

              <p className="font-semibold mt-4">3.3 Intellectual Property</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Users must not upload documents containing third-party
                  copyrighted material without proper authorization
                </li>
                <li>
                  All platform features, design, and AI capabilities are
                  proprietary to the company
                </li>
                <li>
                  The EmployAI name, logo, and branding are protected trademarks
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 4. User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                4. User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>Users agree to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Upload only company-related documents relevant to business
                  operations
                </li>
                <li>
                  Not upload personal files, offensive content, malware, or
                  unauthorized materials
                </li>
                <li>
                  Comply with all company policies regarding confidential and
                  sensitive information
                </li>
                <li>
                  Use the AI chat feature responsibly and for legitimate
                  business purposes only
                </li>
                <li>
                  Not attempt to circumvent security measures or access
                  restricted data
                </li>
                <li>
                  Report any technical issues, security vulnerabilities, or
                  policy violations
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 5. Administrator Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">5. Administrator Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>Company administrators have the authority to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Approve, reject, or delete any document uploaded by users
                </li>
                <li>
                  Monitor user activity and document access logs for security
                  purposes
                </li>
                <li>
                  Suspend or terminate user accounts for policy violations
                </li>
                <li>Modify document metadata, tags, and categorization</li>
                <li>Directly publish documents without approval workflow</li>
                <li>
                  Access and review all chat conversations for compliance
                  monitoring
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 6. Prohibited Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                6. Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>The following activities are strictly prohibited:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Uploading documents unrelated to company business or
                  operations
                </li>
                <li>
                  Sharing documents outside the organization without
                  authorization
                </li>
                <li>
                  Attempting to access documents or areas beyond your permission
                  level
                </li>
                <li>
                  Using the platform for personal file storage or non-work
                  purposes
                </li>
                <li>Uploading malicious files, viruses, or harmful code</li>
                <li>
                  Harassing, threatening, or offensive communication via chat
                </li>
                <li>
                  Reverse engineering or attempting to extract platform source
                  code
                </li>
                <li>
                  Automated scraping or mass downloading without authorization
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 7. Document Approval Process */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                7. Document Approval Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p className="font-semibold">7.1 User Uploads</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  All documents uploaded by non-admin users are set to
                  &quot;PENDING&quot; status
                </li>
                <li>
                  Pending documents are not visible to other users until
                  approved
                </li>
                <li>
                  Administrators review pending documents and may approve or
                  reject them
                </li>
                <li>There is no guaranteed timeframe for document review</li>
              </ul>

              <p className="font-semibold mt-4">7.2 Administrator Uploads</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Documents uploaded by administrators are automatically set to
                  &quot;APPROVED&quot;
                </li>
                <li>
                  Approved documents are immediately visible to all authorized
                  users
                </li>
              </ul>

              <p className="font-semibold mt-4">7.3 Rejection</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Administrators may reject documents that violate platform
                  rules
                </li>
                <li>Rejected documents may be deleted without prior notice</li>
                <li>
                  Users will not receive compensation for rejected documents
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 8. Data Retention and Deletion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                8. Data Retention and Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  The company may retain documents indefinitely for business
                  purposes
                </li>
                <li>
                  Documents may be deleted by administrators at any time without
                  notice
                </li>
                <li>
                  Users have no right to demand permanent storage of uploaded
                  content
                </li>
                <li>
                  Upon account termination, all user data may be retained or
                  deleted at the company&apos;s discretion
                </li>
                <li>
                  Chat history and AI interactions may be logged for quality
                  assurance
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 9. Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                9. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p className="font-semibold">9.1 Platform Availability</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  The platform is provided &quot;as is&quot; without warranties
                  of any kind
                </li>
                <li>
                  The company does not guarantee uninterrupted or error-free
                  service
                </li>
                <li>
                  Scheduled or emergency maintenance may occur without notice
                </li>
              </ul>

              <p className="font-semibold mt-4">9.2 Data Loss</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  While we implement backup measures, the company is not liable
                  for data loss
                </li>
                <li>
                  Users should maintain local copies of critical documents
                </li>
                <li>
                  Technical failures, security breaches, or force majeure events
                  may result in data loss
                </li>
              </ul>

              <p className="font-semibold mt-4">9.3 AI-Generated Content</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  AI chatbot responses are automated and may contain
                  inaccuracies
                </li>
                <li>
                  Users should verify critical information before relying on AI
                  responses
                </li>
                <li>
                  The company is not liable for decisions made based on
                  AI-generated content
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 10. Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">10. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>The company reserves the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Suspend or terminate user accounts for policy violations
                  without prior notice
                </li>
                <li>Discontinue the platform entirely at any time</li>
                <li>
                  Revoke access for users who are no longer employed by the
                  company
                </li>
                <li>Delete all user data upon account termination</li>
              </ul>
            </CardContent>
          </Card>

          {/* 11. Modifications to Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                11. Modifications to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  The company may modify these Terms and Conditions at any time
                </li>
                <li>
                  Continued use of the platform after changes constitutes
                  acceptance
                </li>
                <li>
                  Major changes will be communicated via email or platform
                  notifications
                </li>
                <li>
                  Users who disagree with changes must discontinue platform use
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 12. Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">12. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  These terms are governed by the laws of the jurisdiction where
                  the company is registered
                </li>
                <li>
                  Any disputes shall be resolved through company internal
                  procedures first
                </li>
                <li>
                  Legal disputes may be subject to arbitration or court
                  proceedings as per company policy
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 13. Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>
                For questions regarding these Terms and Conditions, please
                contact:
              </p>
              <ul className="list-none space-y-1 mt-2">
                <li>
                  <strong>Platform Support:</strong> Contact your IT
                  administrator
                </li>
                <li>
                  <strong>Legal Inquiries:</strong> Contact your HR department
                </li>
                <li>
                  <strong>Security Issues:</strong> Report immediately to IT
                  security team
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href="/rules"
              className="text-amber-600 hover:underline font-medium"
            >
              Platform Rules
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/policy"
              className="text-amber-600 hover:underline font-medium"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/"
              className="text-amber-600 hover:underline font-medium"
            >
              Back to Home
            </Link>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">
            © 2025 EmployAI. All rights reserved. For internal company use
            only.
          </p>
        </div>
      </main>
    </div>
  );
}
