#!/bin/bash

# Test meal saving functionality
echo "Testing meal save functionality..."

# Use osascript to navigate the app
osascript <<EOF
tell application "Simulator"
    activate
    
    # Click "I already have an account" button
    delay 2
    tell application "System Events"
        click at {360, 1429}
    end tell
    
    # Wait for login screen
    delay 2
    
    # Type test email (assuming login screen)
    tell application "System Events"
        keystroke "test@example.com"
        key code 48  # Tab
        keystroke "password123"
        key code 36  # Return
    end tell
    
    delay 3
end tell
EOF

echo "Navigation complete. Check simulator for results."