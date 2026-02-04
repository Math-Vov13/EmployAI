import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Cookie,
  Database,
  Eye,
  Lock,
  Mail,
  Server,
  Shield,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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
            <Shield className="h-10 w-10 text-purple-600" />
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            How we collect, use, and protect your data on EmployAI
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: December 7, 2025
          </p>
        </div>

        {/* Privacy Notice */}
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 mb-2">
                  Your Privacy Matters
                </p>
                <p className="text-sm text-gray-700">
                  This Privacy Policy explains how EmployAI collects, uses,
                  stores, and protects your personal information. As an internal
                  company platform, all data is handled in accordance with
                  company policies and applicable data protection regulations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {/* 1. Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">1.1 Account Information</h3>
                <p className="text-sm mb-2">
                  When you create an account, we collect:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>
                    <strong>Email Address:</strong> Used for authentication and
                    communication
                  </li>
                  <li>
                    <strong>Full Name:</strong> For identification within the
                    platform
                  </li>
                  <li>
                    <strong>Password:</strong> Encrypted using bcrypt (6 rounds)
                    and never stored in plain text
                  </li>
                  <li>
                    <strong>Role:</strong> USER or ADMIN designation
                  </li>
                  <li>
                    <strong>Google ID:</strong> If you sign in via Google OAuth
                    (optional)
                  </li>
                  <li>
                    <strong>Profile Picture:</strong> URL from Google OAuth if
                    applicable
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">1.2 Document Data</h3>
                <p className="text-sm mb-2">
                  When you upload documents, we store:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>
                    <strong>File Content:</strong> Stored in MongoDB GridFS
                  </li>
                  <li>
                    <strong>Metadata:</strong> Title, description, tags, file
                    size, MIME type
                  </li>
                  <li>
                    <strong>Status:</strong> APPROVED, PENDING, or REJECTED
                  </li>
                  <li>
                    <strong>Creator ID:</strong> Link to the user who uploaded
                    the document
                  </li>
                  <li>
                    <strong>Timestamps:</strong> Creation and last update dates
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  1.3 Chat and AI Interactions
                </h3>
                <p className="text-sm mb-2">
                  When you use the AI chat assistant, we collect:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>
                    <strong>Chat Messages:</strong> User and AI assistant
                    messages
                  </li>
                  <li>
                    <strong>Conversation Context:</strong> Document ID being
                    discussed
                  </li>
                  <li>
                    <strong>Message Timestamps:</strong> When messages were sent
                  </li>
                  <li>
                    <strong>Semantic Memory:</strong> AI uses vector embeddings
                    for context recall
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  1.4 Usage and Activity Logs
                </h3>
                <p className="text-sm mb-2">
                  We automatically collect technical information:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>
                    <strong>Login Activity:</strong> Last login timestamp
                  </li>
                  <li>
                    <strong>Session Data:</strong> Encrypted session tokens
                  </li>
                  <li>
                    <strong>Document Access:</strong> Which documents you view
                    or download
                  </li>
                  <li>
                    <strong>IP Address:</strong> For security and audit purposes
                  </li>
                  <li>
                    <strong>Device Information:</strong> Browser type and
                    operating system
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 2. Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Cookie className="h-5 w-5 text-purple-600" />
                2. Cookies and Tracking Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">2.1 Session Cookies</h3>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="font-mono text-sm font-semibold text-purple-900 mb-3">
                    employai_session
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-semibold">Purpose:</span>
                      <span>User authentication and session management</span>

                      <span className="font-semibold">Type:</span>
                      <span>
                        Essential (required for platform functionality)
                      </span>

                      <span className="font-semibold">Duration:</span>
                      <span>
                        Session cookie OR 7 days (if &quot;Remember Me&quot;
                        checked)
                      </span>

                      <span className="font-semibold">Storage:</span>
                      <span>Encrypted using Iron Session library</span>

                      <span className="font-semibold">Security:</span>
                      <span>
                        HttpOnly, Secure (HTTPS only), SameSite=Strict
                      </span>

                      <span className="font-semibold">Data Stored:</span>
                      <span>
                        User ID, email, name, role, login status, Google ID
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.2 Cookie Expiration</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>
                    <strong>Default Behavior:</strong> Session cookie expires
                    when browser is closed
                  </li>
                  <li>
                    <strong>Remember Me Enabled:</strong> Cookie persists for 7
                    days (604,800 seconds)
                  </li>
                  <li>
                    <strong>Manual Logout:</strong> Cookie is immediately
                    destroyed
                  </li>
                  <li>
                    <strong>Automatic Expiry:</strong> After 7 days if
                    &quot;Remember Me&quot; was selected
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  2.3 No Third-Party Cookies
                </h3>
                <p className="text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                  EmployAI does NOT use third-party cookies, advertising
                  trackers, or analytics cookies. We only use the essential
                  session cookie described above.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.4 Opting Out</h3>
                <p className="text-sm">
                  You cannot disable the <code>employai_session</code> cookie as
                  it is essential for platform functionality. Disabling cookies
                  in your browser will prevent you from logging in.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. How We Use Your Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                3. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>We use collected information for the following purposes:</p>

              <div className="space-y-3">
                <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50">
                  <p className="font-semibold text-sm text-purple-900">
                    Authentication and Security
                  </p>
                  <ul className="text-xs text-purple-800 list-disc pl-4 mt-1 space-y-0.5">
                    <li>Verify user identity during login</li>
                    <li>Maintain secure sessions</li>
                    <li>Implement multi-factor authentication (OTP)</li>
                    <li>Detect and prevent unauthorized access</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                  <p className="font-semibold text-sm text-blue-900">
                    Platform Functionality
                  </p>
                  <ul className="text-xs text-blue-800 list-disc pl-4 mt-1 space-y-0.5">
                    <li>Enable document upload, storage, and retrieval</li>
                    <li>Power AI chat assistant with document context</li>
                    <li>Display personalized dashboards</li>
                    <li>Manage document approval workflows</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                  <p className="font-semibold text-sm text-green-900">
                    Administration and Compliance
                  </p>
                  <ul className="text-xs text-green-800 list-disc pl-4 mt-1 space-y-0.5">
                    <li>Monitor user activity for policy compliance</li>
                    <li>Generate system logs and audit trails</li>
                    <li>Manage user roles and permissions</li>
                    <li>Investigate security incidents</li>
                  </ul>
                </div>

                <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50">
                  <p className="font-semibold text-sm text-orange-900">
                    Communication
                  </p>
                  <ul className="text-xs text-orange-800 list-disc pl-4 mt-1 space-y-0.5">
                    <li>Send OTP codes for login verification</li>
                    <li>
                      Notify about document status changes (future feature)
                    </li>
                    <li>Communicate platform updates and policy changes</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <p className="font-semibold text-sm text-red-900">
                    AI and Machine Learning
                  </p>
                  <ul className="text-xs text-red-800 list-disc pl-4 mt-1 space-y-0.5">
                    <li>Process documents for AI-powered search and chat</li>
                    <li>Generate vector embeddings for semantic memory</li>
                    <li>Improve AI response quality over time</li>
                    <li>Maintain conversation context and history</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Data Storage and Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-600" />
                4. Data Storage and Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">4.1 Storage Location</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>
                    <strong>Database:</strong> MongoDB Atlas (cloud-hosted)
                  </li>
                  <li>
                    <strong>Documents:</strong> MongoDB GridFS (binary storage)
                  </li>
                  <li>
                    <strong>AI Memory:</strong> MongoDB vector store
                  </li>
                  <li>
                    <strong>Sessions:</strong> Encrypted cookies on user devices
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4.2 Security Measures</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="font-semibold text-sm mb-2">Encryption</p>
                    <ul className="text-xs space-y-1 list-disc pl-4">
                      <li>Passwords: bcrypt hashing (6 rounds)</li>
                      <li>Sessions: Iron Session encryption</li>
                      <li>HTTPS: TLS/SSL for data in transit</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="font-semibold text-sm mb-2">Access Control</p>
                    <ul className="text-xs space-y-1 list-disc pl-4">
                      <li>Role-based permissions (USER/ADMIN)</li>
                      <li>Multi-factor authentication (OTP)</li>
                      <li>Session timeout after inactivity</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="font-semibold text-sm mb-2">
                      Cookie Security
                    </p>
                    <ul className="text-xs space-y-1 list-disc pl-4">
                      <li>HttpOnly: No JavaScript access</li>
                      <li>Secure: HTTPS-only transmission</li>
                      <li>SameSite: CSRF protection</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="font-semibold text-sm mb-2">Monitoring</p>
                    <ul className="text-xs space-y-1 list-disc pl-4">
                      <li>Activity logs and audit trails</li>
                      <li>Failed login attempt tracking</li>
                      <li>Anomaly detection (future)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4.3 Data Retention</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>
                    <strong>User Accounts:</strong> Retained while employed; may
                    be deleted after termination
                  </li>
                  <li>
                    <strong>Documents:</strong> Retained indefinitely unless
                    administratively deleted
                  </li>
                  <li>
                    <strong>Chat History:</strong> Retained for operational
                    purposes; no automatic deletion
                  </li>
                  <li>
                    <strong>Session Cookies:</strong> Maximum 7 days; destroyed
                    on logout
                  </li>
                  <li>
                    <strong>Activity Logs:</strong> Retained for compliance and
                    security audits
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 5. Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Server className="h-5 w-5 text-purple-600" />
                5. Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">5.1 Internal Sharing</h3>
                <p className="text-sm mb-2">
                  Your data may be shared within the company:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Administrators can view all user data and documents</li>
                  <li>
                    Approved documents are visible to all authorized employees
                  </li>
                  <li>
                    HR may access account information for employment purposes
                  </li>
                  <li>IT department may access data for technical support</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5.2 Third-Party Services</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-sm text-blue-900 mb-2">
                    We use the following third-party services:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>
                      <strong>MongoDB Atlas:</strong> Database hosting (data
                      stored in cloud)
                    </li>
                    <li>
                      <strong>OpenAI (GPT-4.1-mini):</strong> AI chat assistant
                      (documents may be processed)
                    </li>
                    <li>
                      <strong>Google OAuth:</strong> Optional authentication (if
                      you choose to sign in with Google)
                    </li>
                    <li>
                      <strong>Resend:</strong> Email delivery for OTP codes
                      (future implementation)
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  These services are bound by their own privacy policies and our
                  data processing agreements.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5.3 Legal Disclosure</h3>
                <p className="text-sm">
                  We may disclose your information if required by law, legal
                  process, court order, or government request.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5.4 No External Sharing</h3>
                <p className="text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                  We do NOT sell, rent, or share your personal data with third
                  parties for marketing purposes. EmployAI is an internal
                  company platform only.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-purple-600" />
                6. Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p className="text-sm">
                Subject to company policies and applicable laws, you have the
                following rights:
              </p>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold text-sm mb-1">Access</p>
                  <p className="text-xs text-gray-600">
                    Request access to your personal data stored in the platform
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold text-sm mb-1">Correction</p>
                  <p className="text-xs text-gray-600">
                    Update or correct inaccurate account information
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold text-sm mb-1">Deletion</p>
                  <p className="text-xs text-gray-600">
                    Request deletion of your account (subject to company
                    retention policies)
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold text-sm mb-1">Export</p>
                  <p className="text-xs text-gray-600">
                    Download your uploaded documents and chat history
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold text-sm mb-1">Objection</p>
                  <p className="text-xs text-gray-600">
                    Object to certain data processing activities
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold text-sm mb-1">Portability</p>
                  <p className="text-xs text-gray-600">
                    Receive your data in a structured, machine-readable format
                  </p>
                </div>
              </div>

              <p className="text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <strong>Important:</strong> As an employee platform, some rights
                may be limited by company policies, legal obligations, or
                employment contracts. Contact HR or IT administration for data
                requests.
              </p>
            </CardContent>
          </Card>

          {/* 7. GDPR Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                7. GDPR and Data Protection Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p className="text-sm">
                If you are located in the European Economic Area (EEA) or United
                Kingdom, we process your data in accordance with the General
                Data Protection Regulation (GDPR):
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong>Lawful Basis:</strong> Processing is necessary for
                    employment purposes (GDPR Article 6(1)(b))
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong>Data Minimization:</strong> We collect only
                    necessary information for platform functionality
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong>Security:</strong> Appropriate technical and
                    organizational measures are in place
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong>Rights:</strong> You may exercise GDPR rights
                    (access, rectification, erasure, etc.)
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong>Transfers:</strong> Data may be transferred to
                    countries outside the EEA (MongoDB Atlas, OpenAI)
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong>Breach Notification:</strong> We will notify
                    authorities and affected individuals of data breaches as
                    required
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 8. Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                8. Children&apos;s Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              <p className="text-sm">
                EmployAI is intended for use by company employees only. The
                platform is not directed to individuals under the age of 18, and
                we do not knowingly collect personal information from minors.
              </p>
            </CardContent>
          </Card>

          {/* 9. Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                9. Changes to This Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices or legal requirements
                </li>
                <li>
                  Material changes will be communicated via email or platform
                  notifications
                </li>
                <li>
                  Continued use of the platform after changes constitutes
                  acceptance of the updated policy
                </li>
                <li>
                  The &quot;Last Updated&quot; date at the top indicates when
                  changes were made
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 10. Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-600" />
                10. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p className="text-sm">
                If you have questions or concerns about this Privacy Policy or
                how your data is handled:
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Privacy Questions:</strong> Contact your HR
                    department
                  </div>
                  <div>
                    <strong>Technical Support:</strong> Contact IT
                    administration
                  </div>
                  <div>
                    <strong>Security Concerns:</strong> Report to IT security
                    team immediately
                  </div>
                  <div>
                    <strong>GDPR Requests:</strong> Submit data subject access
                    requests to your Data Protection Officer
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3">
                For urgent security issues or suspected data breaches, contact
                your IT security team immediately via your company&apos;s
                security incident reporting process.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              href="/legal"
              className="text-purple-600 hover:underline font-medium"
            >
              Terms &amp; Conditions
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/rules"
              className="text-purple-600 hover:underline font-medium"
            >
              Platform Rules
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/"
              className="text-purple-600 hover:underline font-medium"
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
