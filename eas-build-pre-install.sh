#!/bin/bash
# Fix permissions for files uploaded from Windows/OneDrive
# Without this, prebuild fails with EACCES when creating .expo/web cache
set -e
chmod -R u+rwX .
echo "Fixed permissions on project root"
