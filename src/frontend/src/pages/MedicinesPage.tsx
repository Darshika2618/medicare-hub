import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Pill, Plus } from "lucide-react";
import { useState } from "react";
import { AddPrescriptionSheet } from "./medicines/AddPrescriptionSheet";
import { AddReminderSheet } from "./medicines/AddReminderSheet";
import { PrescriptionsTab } from "./medicines/PrescriptionsTab";
import { RemindersTab } from "./medicines/RemindersTab";

export function MedicinesPage() {
  const [rxSheetOpen, setRxSheetOpen] = useState(false);
  const [remSheetOpen, setRemSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("prescriptions");

  const header = (
    <div className="flex items-center justify-between">
      <h1 className="text-lg font-display font-bold text-foreground">
        My Medicines
      </h1>
      <button
        type="button"
        data-ocid="medicines.add_button"
        onClick={() => {
          if (activeTab === "prescriptions") setRxSheetOpen(true);
          else setRemSheetOpen(true);
        }}
        className="flex items-center justify-center gap-1.5 h-11 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-display font-semibold transition-smooth active:scale-95 tap-highlight-none"
        aria-label="Add new item"
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </div>
  );

  return (
    <Layout header={header}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        data-ocid="medicines.tabs"
      >
        <TabsList className="w-full mb-4">
          <TabsTrigger
            data-ocid="medicines.prescriptions_tab"
            value="prescriptions"
            className="flex-1"
          >
            <Pill className="w-3.5 h-3.5 mr-1.5" />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger
            data-ocid="medicines.reminders_tab"
            value="reminders"
            className="flex-1"
          >
            <Bell className="w-3.5 h-3.5 mr-1.5" />
            Reminders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="mt-0">
          <PrescriptionsTab onAdd={() => setRxSheetOpen(true)} />
        </TabsContent>

        <TabsContent value="reminders" className="mt-0">
          <RemindersTab onAdd={() => setRemSheetOpen(true)} />
        </TabsContent>
      </Tabs>

      <AddPrescriptionSheet
        open={rxSheetOpen}
        onClose={() => setRxSheetOpen(false)}
      />
      <AddReminderSheet
        open={remSheetOpen}
        onClose={() => setRemSheetOpen(false)}
      />
    </Layout>
  );
}
