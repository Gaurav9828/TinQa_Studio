#!/bin/bash

echo "🚀 Creating TinQa Platform..."

########################################
# Root
########################################

mkdir -p \
apps \
packages \
firmware \
scripts \
.github

touch \
README.md \
LICENSE \
.gitignore

########################################
# Apps
########################################

mkdir -p \
apps/studio-web \
apps/pi-agent \
apps/simulator-cli

########################################
# Packages
########################################

mkdir -p \
packages/protocol \
packages/docs \
packages/assets

touch \
packages/docs/Architecture.md \
packages/docs/Communication.md \
packages/docs/PacketFormat.md \
packages/docs/DevelopmentGuide.md \
packages/docs/Roadmap.md \
packages/docs/ThemeGuide.md

########################################
# Firmware
########################################

mkdir -p firmware/esp32

########################################
# React App
########################################

cd apps

npm create vite@latest studio-web -- --template react-ts

cd studio-web

########################################
# Install Packages
########################################

npm install

npm install \
react-router-dom \
zustand \
axios \
socket.io-client \
framer-motion \
lucide-react \
zod \
react-hook-form

npm install -D \
sass \
eslint \
prettier \
@types/node

########################################
# Source Structure
########################################

mkdir -p src/{

app,

assets,

core/{
api,
communication/{packets,parsers,protocol,serializers,websocket},
config,
constants,
services,
types
},

layouts/StudioLayout,

modules/{
dashboard/{pages,components,hooks,services,types},
device-manager/{pages,components,hooks,services,types},
emulator/{pages,components,hooks,services,types,canvas,controls,inspector,renderer,websocket,protocol},
diagnostics/{pages,components,hooks,services,types},
monitoring/{pages,components,hooks,services,types},
firmware/{pages,components,hooks,services,types},
preferences/{pages,components,hooks,services,types}
},

shared/{
components/{
data-display,
feedback,
forms,
layout,
navigation,
overlays,
typography
},
hooks,
icons,
store,
styles/{
abstracts,
base,
themes
},
utils
}

}

########################################
# App Files
########################################

touch \
src/main.tsx \
src/app/App.tsx \
src/app/App.scss \
src/app/router.tsx \
src/app/providers.tsx

########################################
# Layout Files
########################################

touch \
src/layouts/StudioLayout/index.ts \
src/layouts/StudioLayout/StudioLayout.tsx \
src/layouts/StudioLayout/StudioLayout.scss \
src/layouts/StudioLayout/Header.tsx \
src/layouts/StudioLayout/Sidebar.tsx \
src/layouts/StudioLayout/Workspace.tsx

########################################
# Style Files
########################################

touch \
src/shared/styles/globals.scss \
src/shared/styles/abstracts/_variables.scss \
src/shared/styles/abstracts/_mixins.scss \
src/shared/styles/abstracts/_functions.scss \
src/shared/styles/base/_reset.scss \
src/shared/styles/base/_typography.scss \
src/shared/styles/base/_animations.scss \
src/shared/styles/base/_scrollbar.scss \
src/shared/styles/themes/_light.scss \
src/shared/styles/themes/_dark.scss

########################################
# Stores
########################################

touch \
src/shared/store/theme.store.ts \
src/shared/store/device.store.ts \
src/shared/store/matrix.store.ts \
src/shared/store/diagnostic.store.ts \
src/shared/store/user.store.ts \
src/shared/store/notification.store.ts

########################################
# Core
########################################

touch \
src/core/api/index.ts \
src/core/config/index.ts \
src/core/constants/index.ts \
src/core/services/index.ts \
src/core/types/index.ts

touch \
src/core/communication/protocol/Packet.ts \
src/core/communication/protocol/PacketTypes.ts \
src/core/communication/parsers/PacketParser.ts \
src/core/communication/serializers/PacketBuilder.ts

########################################
# Module Index Files
########################################

for module in dashboard device-manager emulator diagnostics monitoring firmware preferences
do
touch src/modules/$module/index.ts
done

########################################
# Component Generator
########################################

components=(
Button
Card
Panel
Input
Badge
Avatar
Dropdown
Modal
Tooltip
Spinner
ThemeToggle
StatusDot
PageHeader
SearchBar
)

for component in "${components[@]}"
do

folder="src/shared/components/forms"

case $component in

Card|Panel|Badge|StatusDot)
folder="src/shared/components/data-display"
;;

Modal|Tooltip)
folder="src/shared/components/overlays"
;;

PageHeader)
folder="src/shared/components/typography"
;;

SearchBar)
folder="src/shared/components/navigation"
;;

Spinner)
folder="src/shared/components/feedback"
;;

ThemeToggle)
folder="src/shared/components/layout"
;;

esac

mkdir -p "$folder/$component"

touch \
"$folder/$component/$component.tsx" \
"$folder/$component/$component.scss" \
"$folder/$component/index.ts"

done

########################################

echo ""
echo "✅ TinQa Platform Created Successfully"
echo ""
echo "Run:"
echo ""
echo "cd apps/studio-web"
echo "npm run dev"
echo ""