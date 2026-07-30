#!/bin/bash

echo "📁 Updating TinQa Studio structure..."

ROOT="apps/studio-web/src"

#############################################
# Assets
#############################################

mkdir -p $ROOT/assets/{fonts,icons,images,logos,animations,sounds}

#############################################
# Core
#############################################

mkdir -p \
$ROOT/core/api \
$ROOT/core/client \
$ROOT/core/config \
$ROOT/core/constants \
$ROOT/core/services \
$ROOT/core/communication/{packets,parsers,protocol,serializers,transport,websocket}

touch \
$ROOT/core/api/index.ts \
$ROOT/core/client/index.ts \
$ROOT/core/config/index.ts \
$ROOT/core/constants/index.ts \
$ROOT/core/services/index.ts \
$ROOT/core/communication/packets/index.ts \
$ROOT/core/communication/parsers/index.ts \
$ROOT/core/communication/protocol/Packet.ts \
$ROOT/core/communication/protocol/PacketTypes.ts \
$ROOT/core/communication/protocol/index.ts \
$ROOT/core/communication/serializers/PacketBuilder.ts \
$ROOT/core/communication/serializers/index.ts \
$ROOT/core/communication/transport/index.ts \
$ROOT/core/communication/websocket/index.ts

#############################################
# Layout
#############################################

for layout in Header Sidebar Workspace StatusBar DockArea
do
mkdir -p $ROOT/layouts/StudioLayout/$layout

touch \
$ROOT/layouts/StudioLayout/$layout/$layout.tsx \
$ROOT/layouts/StudioLayout/$layout/$layout.module.scss \
$ROOT/layouts/StudioLayout/$layout/$layout.types.ts \
$ROOT/layouts/StudioLayout/$layout/index.ts
done

touch \
$ROOT/layouts/StudioLayout/StudioLayout.tsx \
$ROOT/layouts/StudioLayout/StudioLayout.module.scss \
$ROOT/layouts/StudioLayout/index.ts

#############################################
# Modules
#############################################

MODULES=(
dashboard
device-manager
diagnostics
emulator
firmware
monitoring
preferences
workspace-manager
)

for module in "${MODULES[@]}"
do

mkdir -p \
$ROOT/modules/$module/components \
$ROOT/modules/$module/hooks \
$ROOT/modules/$module/pages \
$ROOT/modules/$module/services \
$ROOT/modules/$module/store \
$ROOT/modules/$module/types \
$ROOT/modules/$module/utils

if [ "$module" = "emulator" ]; then
mkdir -p \
$ROOT/modules/$module/{canvas,controls,renderer,protocol,websocket,inspector}
fi

if [ "$module" = "diagnostics" ]; then
mkdir -p \
$ROOT/modules/$module/{reports,scanner,tests}
fi

if [ "$module" = "monitoring" ]; then
mkdir -p \
$ROOT/modules/$module/{logger,packet-monitor,performance}
fi

touch $ROOT/modules/$module/index.ts

done

#############################################
# Shared
#############################################

mkdir -p \
$ROOT/shared/hooks \
$ROOT/shared/store \
$ROOT/shared/utils \
$ROOT/shared/types \
$ROOT/shared/constants \
$ROOT/shared/services

mkdir -p \
$ROOT/shared/styles/{abstracts,base,themes,components,layout}

touch \
$ROOT/shared/styles/globals.scss \
$ROOT/shared/styles/index.scss \
$ROOT/shared/styles/abstracts/_variables.scss \
$ROOT/shared/styles/abstracts/_mixins.scss \
$ROOT/shared/styles/abstracts/_functions.scss \
$ROOT/shared/styles/base/_reset.scss \
$ROOT/shared/styles/base/_typography.scss \
$ROOT/shared/styles/base/_animations.scss \
$ROOT/shared/styles/base/_scrollbar.scss \
$ROOT/shared/styles/themes/_light.scss \
$ROOT/shared/styles/themes/_dark.scss

#############################################
# Shared UI
#############################################

UI_COMPONENTS=(
Button
Card
Panel
Dialog
Drawer
Badge
Input
Checkbox
Radio
Select
SearchBar
Tooltip
Spinner
Skeleton
Avatar
Tabs
Divider
EmptyState
ThemeToggle
StatusDot
PageHeader
ScrollArea
DataGrid
Inspector
PropertyGrid
DockPanel
Window
TreeView
ContextMenu
Icon
)

mkdir -p $ROOT/shared/ui

for component in "${UI_COMPONENTS[@]}"
do

mkdir -p $ROOT/shared/ui/$component

touch \
$ROOT/shared/ui/$component/$component.tsx \
$ROOT/shared/ui/$component/$component.module.scss \
$ROOT/shared/ui/$component/$component.types.ts \
$ROOT/shared/ui/$component/$component.test.tsx \
$ROOT/shared/ui/$component/index.ts

done

#############################################
# Shared Hooks
#############################################

HOOKS=(
useTheme
useLocalStorage
useResizeObserver
useDebounce
useThrottle
useBoolean
useEventListener
useKeyboard
usePrevious
)

for hook in "${HOOKS[@]}"
do
touch $ROOT/shared/hooks/$hook.ts
done

touch $ROOT/shared/hooks/index.ts

#############################################
# Shared Store
#############################################

touch \
$ROOT/shared/store/app.store.ts \
$ROOT/shared/store/theme.store.ts \
$ROOT/shared/store/notification.store.ts \
$ROOT/shared/store/index.ts

#############################################
# Shared Types
#############################################

touch \
$ROOT/shared/types/api.ts \
$ROOT/shared/types/common.ts \
$ROOT/shared/types/device.ts \
$ROOT/shared/types/matrix.ts \
$ROOT/shared/types/theme.ts \
$ROOT/shared/types/index.ts

#############################################
# Shared Utils
#############################################

UTILS=(
debounce
throttle
storage
download
color
formatDate
math
)

for util in "${UTILS[@]}"
do
touch $ROOT/shared/utils/$util.ts
done

touch $ROOT/shared/utils/index.ts

echo ""
echo "✅ TinQa Studio structure updated successfully."
echo ""