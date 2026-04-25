"use client";

import { useMemo, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { destinationCountries, immigrationPathways } from "./data";
import { FilterSidebar } from "./components/filter-sidebar";
import { NetworkMap } from "./components/network-map";
import { defaultProfile, scoreDestinations } from "@/lib/scoring";

export default function Page() {
  const [profile, setProfile] = useState(defaultProfile);
  const scores = useMemo(
    () => scoreDestinations(profile, destinationCountries, immigrationPathways),
    [profile],
  );
  const [selectedCountryId, setSelectedCountryId] = useState(
    scores[0]?.countryId ?? destinationCountries[0].id,
  );

  return (
    <SidebarProvider>
      <FilterSidebar
        profile={profile}
        countries={destinationCountries}
        scores={scores}
        selectedCountryId={selectedCountryId}
        onProfileChange={setProfile}
        onSelectCountry={setSelectedCountryId}
      />
      <SidebarInset>
        <NetworkMap
          countries={destinationCountries}
          pathways={immigrationPathways}
          scores={scores}
          selectedCountryId={selectedCountryId}
          onSelectCountry={setSelectedCountryId}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
