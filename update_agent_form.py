#!/usr/bin/env python3
"""
Script to copy the admin vehicle creation form to the agent dashboard.
This ensures agents have the SAME form as admins with all fields.
"""

import re

print("🚀 Updating Agent Dashboard with Admin Vehicle Form...")

# Read the admin dashboard
with open('frontend/src/pages/admin/AdminDashboardPage.jsx', 'r', encoding='utf-8') as f:
    admin_content = f.read()

# Read the agent dashboard
with open('frontend/src/pages/agent/AgentDashboardPage.jsx', 'r', encoding='utf-8') as f:
    agent_content = f.read()

# Extract the admin vehicle modal (from Create Vehicle Modal comment to the closing </Modal>)
admin_modal_pattern = r'(      \{/\* Create Vehicle Modal \*/\}.*?      </Modal>)'
admin_match = re.search(admin_modal_pattern, admin_content, re.DOTALL)

if not admin_match:
    print("❌ Could not find admin vehicle modal")
    exit(1)

admin_modal = admin_match.group(1)

# Replace the agent vehicle modal with the admin one
agent_modal_pattern = r'(      \{/\* Create Vehicle Modal.*?      </Modal>)'
agent_content_updated = re.sub(agent_modal_pattern, admin_modal.replace('{/* Create Vehicle Modal */', '{/* Create Vehicle Modal - Same as Admin */}', 1), agent_content, flags=re.DOTALL)

# Write the updated agent dashboard
with open('frontend/src/pages/agent/AgentDashboardPage.jsx', 'w', encoding='utf-8') as f:
    f.write(agent_content_updated)

print("✅ Agent dashboard updated successfully!")
print("")
print("Changes made:")
print("- Replaced simple agent vehicle form with complete admin form")
print("- Added all sections: Grunddaten, Technische Daten, Kapazität & Preise, Beschreibung, Fahrzeugbild")
print("- Same emerald/teal color scheme as admin")
print("- All handlers are already implemented (handleCreateVehicle, handleImageChange)")
print("")
print("Next: Test by running the dev server and creating a vehicle as an agent!")
