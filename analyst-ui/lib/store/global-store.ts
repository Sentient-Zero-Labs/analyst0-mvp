"use client";

import { CharterListResponseItem } from "@/services/charter/charter.schema";
import { OrganisationListResponseItem } from "@/services/organisation/organisation.schema";
import { create } from "zustand";

export const useSelectedOrganisation = create<{
  selectedOrganisation: OrganisationListResponseItem | null;
  setSelectedOrganisation: (org: OrganisationListResponseItem | null) => void;
}>((set) => ({
  selectedOrganisation: null,
  setSelectedOrganisation: (org) => set({ selectedOrganisation: org }),
}));

export const useSelectedCharter = create<{
  selectedCharter: CharterListResponseItem | null;
  setSelectedCharter: (charter: CharterListResponseItem | null) => void;
}>((set) => ({
  selectedCharter: null,
  setSelectedCharter: (charter) => set({ selectedCharter: charter }),
}));
