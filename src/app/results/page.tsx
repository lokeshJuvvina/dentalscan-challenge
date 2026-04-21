"use client";

import React, { useState } from "react";
import MessagingSidebar from "@/components/MessagingSidebar";
import { MessageCircle, CheckCircle2, Clock, FileText } from "lucide-react";

export default function ResultsPage() {
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  // In a real app, this would come from authentication/session
  const patientId = "patient-demo-123";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">DentalScan AI</h1>
          <button
            onClick={() => setIsMessagingOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <MessageCircle size={18} />
            <span className="hidden sm:inline">Message Clinic</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Scan Complete!
              </h2>
              <p className="text-gray-600">
                Your dental scan has been successfully processed
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Clock className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-800">Processing Time</p>
                <p className="text-sm text-gray-600">Completed in 2.3 seconds</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="text-green-600 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-800">Quality Score</p>
                <p className="text-sm text-gray-600">Excellent (98/100)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <FileText className="text-purple-600 mt-1" size={20} />
              <div>
                <p className="font-semibold text-gray-800">Analysis Status</p>
                <p className="text-sm text-gray-600">AI Review Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Scan Results Preview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["Front", "Left", "Right", "Upper", "Lower"].map((view, idx) => (
              <div
                key={idx}
                className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center"
              >
                <span className="text-gray-500 font-medium">{view} View</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Next Steps:</strong> A dental professional will review
              your scans within 24 hours. You'll receive a notification once the
              analysis is complete. Have questions? Use the messaging feature to
              communicate with your clinic.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Need to reach your clinic?</h3>
          <p className="mb-4">
            Click the button below to start a conversation with your dental care team.
          </p>
          <button
            onClick={() => setIsMessagingOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <MessageCircle size={20} />
            Open Messaging
          </button>
        </div>
      </main>

      {/* Messaging Sidebar */}
      <MessagingSidebar
        patientId={patientId}
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
      />
    </div>
  );
}
