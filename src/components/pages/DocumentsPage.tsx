/**
 * Smart AI Travel Planner 3.0
 * Documents and OCR Assistant Page
 * Autonomous extraction, OCR confidence scores, editable fields, and dossier integration
 */

import React, { useState } from 'react';
import { TripPlan, ExtractedDocument } from '../../types/travel';
import { parseDocument } from '../../lib/api';

interface DocumentsPageProps {
  trip: TripPlan;
  onUpdateTripDocuments?: (doc: ExtractedDocument) => void;
}

const SAMPLE_DOCS = [
  {
    name: 'Pilatus_PC24_Aviation_Manifest_SER-84920.pdf',
    type: 'flight_confirmation',
    size: '1.4 MB',
    extracted: {
      id: 'doc-pilatus-01',
      fileName: 'Pilatus_PC24_Aviation_Manifest_SER-84920.pdf',
      documentType: 'flight_confirmation' as const,
      parsedAt: '2025-10-12 09:41 UTC',
      confidenceScore: 0.98,
      status: 'verified' as const,
      fields: {
        passengerNames: ['Lady Eleanor Vance', 'Lord Julian Vance'],
        bookingReference: 'CH-P24-8842',
        origin: 'Zurich Kloten (ZRH / LSZH) Cat IIIB FBO',
        destination: 'Naples Capodichino (NAP / LIRN)',
        departureDate: '2025-10-14 08:30 CEST',
        arrivalDate: '2025-10-14 10:15 CEST',
        flightOrRoomNumber: 'Tail SBR-24A (Pilatus PC-24 Super Versatile Jet)',
        seatNumber: 'VIP Club 01A / 01B',
        terminalOrGate: 'ExecuJet VIP Private Terminal Zurich',
        baggageAllowance: '320 kg total pressurised baggage compartment',
        pricePaid: '€14,800.00 EUR (Cleared via Corporate Wire)',
        cancellationPolicy: 'Non-refundable within 48h; slot swap permissible',
      },
      rawSummary:
        'Official charter agreement with Swiss Executive Aviation AG. Cleared flight plan corridor LSZH to LIRN. Includes VIP apron limousine transfer and direct tarmac immigration clearance.',
    },
  },
  {
    name: 'Villa_Treville_Master_Residence_Voucher.pdf',
    type: 'hotel_voucher',
    size: '2.1 MB',
    extracted: {
      id: 'doc-treville-02',
      fileName: 'Villa_Treville_Master_Residence_Voucher.pdf',
      documentType: 'hotel_voucher' as const,
      parsedAt: '2025-10-12 11:22 UTC',
      confidenceScore: 0.99,
      status: 'verified' as const,
      fields: {
        passengerNames: ['Lady Eleanor Vance', 'Lord Julian Vance'],
        bookingReference: 'VTR-88294-MAST',
        origin: 'Positano, Amalfi Coast, Italy',
        destination: 'Villa Treville Cliffside Estate',
        departureDate: 'Check-in: 2025-10-14 14:00 CEST',
        arrivalDate: 'Check-out: 2025-10-19 12:00 CEST',
        flightOrRoomNumber: 'Suite Zeffirelli (Master Cliffside Villa)',
        terminalOrGate: 'Private Pier Jetty Pontoon A',
        baggageAllowance: 'Complimentary private porterage from sea tender',
        pricePaid: '€18,500.00 EUR (5 nights inclusive of bespoke breakfast)',
        cancellationPolicy: 'Guaranteed reservation; concierge hold',
      },
      rawSummary:
        'Exclusive cliffside estate confirmation. Includes daily Champagne buffet, private access to Laurito Beach via funicular elevator, and 24-hour dedicated butler service.',
    },
  },
  {
    name: 'Riva_Dolceriva_Capri_Yacht_Charter.pdf',
    type: 'itinerary',
    size: '890 KB',
    extracted: {
      id: 'doc-riva-03',
      fileName: 'Riva_Dolceriva_Capri_Yacht_Charter.pdf',
      documentType: 'itinerary' as const,
      parsedAt: '2025-10-13 14:05 UTC',
      confidenceScore: 0.96,
      status: 'verified' as const,
      fields: {
        passengerNames: ['Lady Eleanor Vance', 'Lord Julian Vance'],
        bookingReference: 'CAP-RIVA-482',
        origin: 'Positano Jetty Pontoon',
        destination: 'Faraglioni & Blue Grotto, Capri',
        departureDate: '2025-10-15 10:00 CEST',
        arrivalDate: '2025-10-15 17:30 CEST',
        flightOrRoomNumber: '68ft Riva Dolceriva "Aura"',
        terminalOrGate: 'Capri Marina Grande Berth B-12',
        baggageAllowance: 'Deck luggage only + snorkel gear provided',
        pricePaid: '€4,200.00 EUR (Fuel, Skipper, Bar included)',
        cancellationPolicy: 'Weather contingency: reroute to Bay of Salerno',
      },
      rawSummary:
        'Private day charter contract with Captain Marco Bianchi. Fully licensed for Faraglioni transit with tender access to La Fontelina beach club.',
    },
  },
];

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  trip,
  onUpdateTripDocuments,
}) => {
  const [documents, setDocuments] = useState<ExtractedDocument[]>(
    trip.extractedDocuments && trip.extractedDocuments.length > 0
      ? trip.extractedDocuments
      : SAMPLE_DOCS.map((s) => s.extracted)
  );

  const [selectedDocId, setSelectedDocId] = useState<string>(
    documents[0]?.id || 'doc-pilatus-01'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentDoc =
    documents.find((d) => d.id === selectedDocId) || documents[0];

  const [editableFields, setEditableFields] = useState<Record<string, string>>({
    ...(currentDoc?.fields || {}),
    passengerNames: currentDoc?.fields?.passengerNames?.join(', ') || '',
  });

  const handleSelectDoc = (doc: ExtractedDocument) => {
    setSelectedDocId(doc.id);
    setEditableFields({
      ...(doc.fields || {}),
      passengerNames: doc.fields?.passengerNames?.join(', ') || '',
    });
    setSaveSuccess(false);
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditableFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveToTrip = () => {
    if (!currentDoc) return;
    const updated: ExtractedDocument = {
      ...currentDoc,
      fields: {
        ...currentDoc.fields,
        ...editableFields,
        passengerNames: editableFields.passengerNames
          ? editableFields.passengerNames.split(',').map((s) => s.trim())
          : [],
      },
    };

    setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    if (onUpdateTripDocuments) {
      onUpdateTripDocuments(updated);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSimulateUpload = async (docType: string) => {
    setIsProcessing(true);
    try {
      const mockResult = await parseDocument({
        name: `Uploaded_Travel_Doc_${Date.now()}.pdf`,
        content: `Simulated OCR raw string for ${docType}`,
      });
      setDocuments((prev) => [mockResult, ...prev]);
      handleSelectDoc(mockResult);
    } catch {
      // Fallback
    } finally {
      setIsProcessing(false);
    }
  };

  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(documents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Aetheris_Travel_Dossier_Documents_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E2E8F0] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C3AED]">
              Intelligent Document Ingestion Engine
            </span>
            <span className="text-xs text-[#94A3B8]">•</span>
            <span className="text-xs font-mono text-[#64748B]">
              OCR Precision Radar v3.4
            </span>
          </div>
          <h1 className="font-serif-heading text-3xl font-bold text-[#0F172A] mt-1">
            Travel Documents & OCR Extractor
          </h1>
          <p className="text-xs text-[#64748B]">
            Automated OCR parsing for aviation manifests, luxury hotel vouchers, yacht charter agreements, and biometric records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportAsJSON}
            className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & Document List (4 cols) */}
        <div data-aos="fade-up" data-aos-duration="600" className="lg:col-span-4 space-y-6">
          {/* File Upload Dropzone */}
          <div className="bg-white rounded-3xl border-2 border-dashed border-[#CBD5E1] hover:border-[#0891B2] transition-all p-6 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#0891B2] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">cloud_upload</span>
            </div>
            <div>
              <strong className="text-xs text-[#0F172A] block font-semibold">
                Drop Travel Vouchers or Tickets
              </strong>
              <span className="text-[11px] text-[#64748B] block mt-0.5">
                Supports PDF, JPG, PNG, and Wallet Passes
              </span>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSimulateUpload('boarding_pass')}
                disabled={isProcessing}
                className="w-full py-2 px-3 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>
                <span>{isProcessing ? 'Parsing via OCR...' : 'Upload & Parse Document'}</span>
              </button>
            </div>
          </div>

          {/* Document Ingestion History */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Active Ingested Dossier ({documents.length})
              </span>
              <span className="text-[10px] font-mono text-[#059669] font-bold">100% Parsed</span>
            </div>

            <div className="space-y-2.5">
              {documents.map((doc) => {
                const isSelected = doc.id === selectedDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-[#0891B2] shadow-xs ring-1 ring-[#0891B2]/30'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-[#0891B2] text-lg">
                          description
                        </span>
                        <div className="truncate">
                          <strong className="text-xs text-[#0F172A] block truncate">
                            {doc.fileName}
                          </strong>
                          <span className="text-[10px] text-[#64748B] block uppercase tracking-wider">
                            {doc.documentType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {Math.round((doc.confidenceScore ?? 0.98) * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: OCR Extraction View & Editable Fields (8 cols) */}
        <div data-aos="fade-left" data-aos-duration="600" className="lg:col-span-8 space-y-6">
          {currentDoc && (
            <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8 space-y-6">
              {/* Header with confidence and status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E2E8F0] gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#F1F5F9] text-[#0F172A] text-[10px] font-mono font-bold uppercase">
                      Ref: {editableFields.bookingReference || 'N/A'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      Confidence: {Math.round((currentDoc.confidenceScore ?? 0.98) * 100)}% Match
                    </span>
                  </div>
                  <h2 className="font-serif-heading text-xl font-bold text-[#0F172A] mt-2">
                    {currentDoc.fileName}
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Parsed timestamp: {currentDoc.parsedAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveToTrip}
                    className="px-5 py-2.5 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span className="material-symbols-outlined text-sm">bookmark_add</span>
                    <span>Save to Master Dossier</span>
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Document fields synchronized with active trip dossier successfully!</span>
                </div>
              )}

              {/* Editable Fields Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Structured Field Extractions (Editable)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase text-[#64748B]">
                        Passenger / Guest Names
                      </label>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">99.8%</span>
                    </div>
                    <input
                      type="text"
                      value={editableFields.passengerNames || ''}
                      onChange={(e) => handleFieldChange('passengerNames', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase text-[#64748B]">
                        Booking Reference / PNR
                      </label>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">100%</span>
                    </div>
                    <input
                      type="text"
                      value={editableFields.bookingReference || ''}
                      onChange={(e) => handleFieldChange('bookingReference', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-mono font-bold text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase text-[#64748B]">
                        Origin Location / Hub
                      </label>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">98.5%</span>
                    </div>
                    <input
                      type="text"
                      value={editableFields.origin || ''}
                      onChange={(e) => handleFieldChange('origin', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase text-[#64748B]">
                        Destination Location
                      </label>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">99.0%</span>
                    </div>
                    <input
                      type="text"
                      value={editableFields.destination || ''}
                      onChange={(e) => handleFieldChange('destination', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase text-[#64748B]">
                        Departure Date & Time
                      </label>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">99.4%</span>
                    </div>
                    <input
                      type="text"
                      value={editableFields.departureDate || ''}
                      onChange={(e) => handleFieldChange('departureDate', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase text-[#64748B]">
                        Arrival / Checkout Date & Time
                      </label>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">98.9%</span>
                    </div>
                    <input
                      type="text"
                      value={editableFields.arrivalDate || ''}
                      onChange={(e) => handleFieldChange('arrivalDate', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase text-[#64748B]">
                        Airframe / Room Suite Allocation
                      </label>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">99.0%</span>
                    </div>
                    <input
                      type="text"
                      value={editableFields.flightOrRoomNumber || ''}
                      onChange={(e) => handleFieldChange('flightOrRoomNumber', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase text-[#64748B]">
                        Total Financial Consideration
                      </label>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">100%</span>
                    </div>
                    <input
                      type="text"
                      value={editableFields.pricePaid || ''}
                      onChange={(e) => handleFieldChange('pricePaid', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-mono font-bold text-[#0891B2] focus:outline-none focus:border-[#0891B2]"
                    />
                  </div>
                </div>

                {/* Additional contextual notes */}
                <div className="pt-2 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#64748B]">
                    Extracted Contract & Policy Digest
                  </label>
                  <p className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] leading-relaxed">
                    {currentDoc.rawSummary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
