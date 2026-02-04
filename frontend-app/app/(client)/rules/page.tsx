import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  FileCheck,
  FileX,
  Lock,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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
            <ShieldCheck className="h-10 w-10 text-blue-600" />
            Platform Rules
          </h1>
          <p className="text-lg text-gray-600">
            Guidelines and rules for using EmployAI document management platform
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: December 7, 2025
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Mandatory Compliance
                </p>
                <p className="text-sm text-gray-700">
                  All users must adhere to these rules. Violations may result in
                  account suspension, document rejection, or termination of
                  access. Administrators reserve the right to enforce these
                  rules at their discretion.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules Sections */}
        <div className="space-y-6">
          {/* 1. Document Upload Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                1. Document Upload Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-green-700 flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  What You CAN Upload:
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Company policies and procedures</li>
                  <li>Employee handbooks and training materials</li>
                  <li>Project documentation and specifications</li>
                  <li>Meeting minutes and reports</li>
                  <li>Internal memos and announcements</li>
                  <li>Business presentations and proposals</li>
                  <li>Approved marketing and sales materials</li>
                  <li>Technical documentation and guides</li>
                  <li>Compliance and legal documents (when authorized)</li>
                  <li>Department-specific operational documents</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4" />
                  What You CANNOT Upload:
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Personal files (photos, music, videos, personal documents)
                  </li>
                  <li>Non-work-related content or entertainment materials</li>
                  <li>
                    Pirated software, movies, or unauthorized copyrighted
                    content
                  </li>
                  <li>
                    Documents from previous employers or external companies
                    without authorization
                  </li>
                  <li>Offensive, discriminatory, or inappropriate content</li>
                  <li>Malicious files, viruses, or executable programs</li>
                  <li>
                    Files containing customer data without proper classification
                  </li>
                  <li>Confidential information beyond your clearance level</li>
                  <li>
                    Political, religious, or controversial materials unrelated
                    to work
                  </li>
                  <li>Spam, advertisements, or promotional content</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-800">
                  File Requirements:
                </p>
                <ul className="text-sm text-yellow-700 list-disc pl-6 mt-2 space-y-1">
                  <li>
                    All documents must be work-related and relevant to company
                    operations
                  </li>
                  <li>Files must have clear, descriptive titles</li>
                  <li>Add appropriate tags for easier discovery</li>
                  <li>
                    Include a description explaining the document&apos;s purpose
                  </li>
                  <li>
                    Ensure documents are in accessible formats (PDF, DOCX, XLSX,
                    etc.)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 2. Approval Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                2. Document Approval Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="grid md:grid-cols-2 gap-4">
                {/* User Uploads */}
                <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 flex items-center gap-2 mb-3">
                    <Upload className="h-4 w-4" />
                    Standard User Uploads
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        1
                      </div>
                      <p>User uploads document</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        2
                      </div>
                      <p>
                        Status set to <strong>PENDING</strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        3
                      </div>
                      <p>Document hidden from other users</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        4
                      </div>
                      <p>Admin reviews and approves/rejects</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        5
                      </div>
                      <p>If approved, visible to all users</p>
                    </div>
                  </div>
                </div>

                {/* Admin Uploads */}
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-4 w-4" />
                    Administrator Uploads
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        1
                      </div>
                      <p>Admin uploads document</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        2
                      </div>
                      <p>
                        Status automatically set to <strong>APPROVED</strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        3
                      </div>
                      <p>Immediately visible to all users</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        4
                      </div>
                      <p>No approval workflow required</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        5
                      </div>
                      <p>Can be published instantly</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <p className="font-semibold text-gray-900 mb-2">
                  Important Notes:
                </p>
                <ul className="text-sm text-gray-700 list-disc pl-6 space-y-1">
                  <li>
                    There is no guaranteed timeframe for document approval
                  </li>
                  <li>
                    Administrators are not obligated to provide rejection
                    reasons
                  </li>
                  <li>
                    Pending documents remain visible only to the uploader and
                    admins
                  </li>
                  <li>
                    You can view your own pending documents in your dashboard
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 3. Document Rejection Reasons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileX className="h-5 w-5 text-blue-600" />
                3. Common Rejection Reasons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>Your document may be rejected for the following reasons:</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <p className="font-semibold text-sm text-red-800">
                    Non-Work-Related Content
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Personal files, entertainment, or content unrelated to
                    company business
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <p className="font-semibold text-sm text-red-800">
                    Policy Violation
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Content that violates company policies or code of conduct
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <p className="font-semibold text-sm text-red-800">
                    Inappropriate Content
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Offensive, discriminatory, or unprofessional materials
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <p className="font-semibold text-sm text-red-800">
                    Security Risk
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Files containing malware, suspicious code, or security
                    threats
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <p className="font-semibold text-sm text-red-800">
                    Poor Quality/Incomplete
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Corrupted files, unclear scans, or incomplete documents
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <p className="font-semibold text-sm text-red-800">
                    Duplicate Content
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Document already exists in the system
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <p className="font-semibold text-sm text-red-800">
                    Insufficient Metadata
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Missing title, description, or proper categorization
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <p className="font-semibold text-sm text-red-800">
                    Unauthorized Information
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Content you don&apos;t have permission to upload or share
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Document Access Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                4. Document Access and Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Standard Users Can:</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>
                    View all documents with <strong>APPROVED</strong> status
                  </li>
                  <li>View their own documents regardless of status</li>
                  <li>Download approved documents for work purposes</li>
                  <li>Upload new documents (subject to approval)</li>
                  <li>Update metadata for their own documents</li>
                  <li>Delete their own pending or rejected documents</li>
                  <li>Chat with AI about approved documents</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Standard Users CANNOT:</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>View other users&apos; pending or rejected documents</li>
                  <li>Approve or reject documents</li>
                  <li>Delete documents uploaded by others</li>
                  <li>Bypass the approval process</li>
                  <li>Access admin-only features or statistics</li>
                  <li>View user management or system logs</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Administrators Can:</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>View ALL documents (approved, pending, rejected)</li>
                  <li>Approve or reject any pending document</li>
                  <li>Delete any document at any time</li>
                  <li>Upload documents that are auto-approved</li>
                  <li>Modify metadata, tags, and status of any document</li>
                  <li>View user activity and access logs</li>
                  <li>Manage user accounts and permissions</li>
                  <li>Access system statistics and analytics</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 5. Document Sharing Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                5. Document Sharing and Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  STRICTLY PROHIBITED:
                </p>
                <ul className="text-sm text-red-700 list-disc pl-6 space-y-1">
                  <li>
                    Sharing documents outside the company via email, cloud
                    storage, or messaging apps
                  </li>
                  <li>
                    Forwarding company documents to personal email accounts
                  </li>
                  <li>Uploading documents to public file-sharing platforms</li>
                  <li>Printing and distributing documents to non-employees</li>
                  <li>
                    Discussing confidential document content with external
                    parties
                  </li>
                  <li>
                    Copying documents to personal devices or USB drives without
                    authorization
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  ALLOWED:
                </p>
                <ul className="text-sm text-green-700 list-disc pl-6 space-y-1">
                  <li>Viewing documents within the EmployAI platform only</li>
                  <li>
                    Downloading for work purposes on company-managed devices
                  </li>
                  <li>
                    Discussing document content with authorized colleagues
                  </li>
                  <li>
                    Using AI chat to ask questions about approved documents
                  </li>
                  <li>
                    Referencing documents in internal meetings and reports
                  </li>
                </ul>
              </div>

              <p className="text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <strong>Reminder:</strong> All documents on EmployAI are company
                property and confidential. Unauthorized sharing may result in
                disciplinary action, including termination and legal
                consequences.
              </p>
            </CardContent>
          </Card>

          {/* 6. AI Chat Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                6. AI Chat Assistant Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Acceptable Use:</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Asking questions about approved document content</li>
                  <li>
                    Requesting summaries or explanations of company policies
                  </li>
                  <li>Seeking clarification on procedures and guidelines</li>
                  <li>Getting help finding relevant documents</li>
                  <li>Work-related queries about document information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-red-700">
                  Prohibited Use:
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-sm text-red-700">
                  <li>
                    Attempting to extract entire document contents via chat
                  </li>
                  <li>
                    Asking the AI to generate fake or misleading information
                  </li>
                  <li>
                    Using the chat for personal, non-work-related conversations
                  </li>
                  <li>
                    Harassing or testing the AI with inappropriate queries
                  </li>
                  <li>
                    Attempting to manipulate the AI to bypass security measures
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> All chat conversations may be monitored
                  and logged for quality assurance and security purposes. The AI
                  may not always provide accurate information—verify critical
                  details independently.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 7. User Account Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">7. User Account Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>
                  <strong>One Account Per Person:</strong> Each employee may
                  only have one account
                </li>
                <li>
                  <strong>No Credential Sharing:</strong> Do not share your
                  login credentials with anyone
                </li>
                <li>
                  <strong>Secure Passwords:</strong> Use strong passwords (12+
                  characters, mixed case, numbers, symbols)
                </li>
                <li>
                  <strong>MFA Required:</strong> Multi-factor authentication via
                  OTP is mandatory for all logins
                </li>
                <li>
                  <strong>Session Management:</strong> Log out when finished or
                  use shared computers
                </li>
                <li>
                  <strong>Report Suspicious Activity:</strong> Notify IT
                  immediately if you notice unauthorized access
                </li>
                <li>
                  <strong>Account Termination:</strong> Accounts are deactivated
                  upon employment termination
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 8. Enforcement and Penalties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                8. Enforcement and Penalties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>Violations of these rules may result in:</p>
              <div className="space-y-2">
                <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50">
                  <p className="font-semibold text-sm text-yellow-800">
                    First Offense: Warning
                  </p>
                  <p className="text-xs text-yellow-700">
                    Formal written warning and mandatory rules review
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50">
                  <p className="font-semibold text-sm text-orange-800">
                    Second Offense: Temporary Suspension
                  </p>
                  <p className="text-xs text-orange-700">
                    Account suspended for 7-30 days, HR notification
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <p className="font-semibold text-sm text-red-800">
                    Severe/Repeated Violations: Termination
                  </p>
                  <p className="text-xs text-red-700">
                    Account permanently disabled, possible employment
                    termination
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50">
                  <p className="font-semibold text-sm text-purple-800">
                    Security Breaches: Legal Action
                  </p>
                  <p className="text-xs text-purple-700">
                    Intentional data breaches may result in legal prosecution
                  </p>
                </div>
              </div>

              <p className="text-sm bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
                Administrators have full discretion to determine the severity of
                violations and appropriate penalties. Penalties may be escalated
                for repeated or egregious violations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href="/legal"
              className="text-blue-600 hover:underline font-medium"
            >
              Terms &amp; Conditions
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/policy"
              className="text-blue-600 hover:underline font-medium"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/"
              className="text-blue-600 hover:underline font-medium"
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
