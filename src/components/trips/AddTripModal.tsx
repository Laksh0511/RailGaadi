"use client";

import React, { useState } from "react";
import { UserTrip } from "@/types/trip";
import { TRAINS_DATABASE } from "@/lib/constants";
import { saveUserTrip } from "@/lib/storage";

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripAdded: (trip: UserTrip) => void;
}

export function AddTripModal({ isOpen, onClose, onTripAdded }: AddTripModalProps) {
  const [selectedTrainNum, setSelectedTrainNum] = useState(TRAINS_DATABASE[0]?.number || "");
  const [pnr, setPnr] = useState("");
  const [journeyDate, setJourneyDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [travelClass, setTravelClass] = useState("");
  const [coach, setCoach] = useState("");
  const [seats, setSeats] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const train = TRAINS_DATABASE.find((t) => t.number === selectedTrainNum) || TRAINS_DATABASE[0];

    const departureDate = new Date(journeyDate || Date.now());
    
    const newTrip: UserTrip = {
      id: `trip-${Date.now()}`,
      pnr: pnr || "UNSPECIFIED",
      train,
      journeyDate,
      travelClass: travelClass || train.classes[0] || "SL",
      coach: coach || "B1",
      seats: seats || "1",
      bookingStatus: "CNF",
      originStationCode: train.origin.code,
      destinationStationCode: train.destination.code,
      scheduledDeparture: train.departureTime,
      scheduledArrival: train.arrivalTime,
      countdownDepartureTimestamp: departureDate.toISOString(),
      createdAt: new Date().toISOString(),
      isPast: false,
    };

    saveUserTrip(newTrip);
    onTripAdded(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in-up">
      <div className="fixed inset-0" onClick={onClose} aria-label="Close modal" />
      <div className="relative bg-surface rounded-3xl p-stack-lg w-full max-w-lg shadow-2xl border border-outline-variant/30 z-10">
        <div className="flex items-center justify-between mb-stack-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">add_task</span>
            </div>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface">Add New Journey</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-label-caps text-on-surface-variant uppercase font-semibold mb-1">
              Select Train
            </label>
            <select
              value={selectedTrainNum}
              onChange={(e) => setSelectedTrainNum(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2.5 text-body-sm text-on-surface font-medium focus:ring-1 focus:ring-primary outline-none"
            >
              {TRAINS_DATABASE.map((t) => (
                <option key={t.number} value={t.number}>
                  {t.number} - {t.name} ({t.origin.code} ➔ {t.destination.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant uppercase font-semibold mb-1">
                10-Digit PNR Number
              </label>
              <input
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
                placeholder="e.g. 8410294812"
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-body-sm font-data-mono text-on-surface focus:ring-1 focus:ring-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant uppercase font-semibold mb-1">
                Travel Date
              </label>
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant uppercase font-semibold mb-1">
                Class
              </label>
              <input
                type="text"
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                placeholder="e.g. 3A, CC"
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant uppercase font-semibold mb-1">
                Coach
              </label>
              <input
                type="text"
                value={coach}
                onChange={(e) => setCoach(e.target.value)}
                placeholder="e.g. B1, C2"
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-label-caps text-on-surface-variant uppercase font-semibold mb-1">
                Seat(s)
              </label>
              <input
                type="text"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                placeholder="e.g. 34, 35"
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-body-sm text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-sm font-semibold shadow-sm transition-all"
            >
              Save Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
