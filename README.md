# \# Decky Shortcut Buttons

##### 

##### A Decky Loader plugin that adds customisable keyboard shortcut buttons to the Quick Access Menu. Tap a button to send a key combination to your game or app, such as Alt+F4 or F1.

##### 

##### I built this with Claude for use on SteamOS on my ROG Ally for being able to open menus and press save/load states in Emulators and Recomp projects.

##### 

##### It should work fine on any device running SteamOS.

##### 

## \## Features

##### 

##### \- Add, edit and delete your own shortcut buttons

##### \- Supports Ctrl, Alt, Shift and Super modifiers, plus function keys, letters, numbers and arrows

##### \- Closes the menu before sending, so keys reach your game

##### \- Shortcuts are saved between reboots



## \## Screenshots



##### !\[Decky menu](screenshots/deckymenu.jpg)

##### 

##### !\[Shortcut Buttons](screenshots/shortcutbuttons.jpg)

##### 

##### !\[Create New Shortcut](screenshots/createnewshortcut.jpg)

##### 

##### !\[Select Key](screenshots/selectkey.jpg)



## \## Installation

##### 

##### This plugin isn't in the Decky store, so it's installed through Decky's developer mode.

##### 

##### 1\. Install Decky Loader on your device.

##### 2\. Download the latest zip from the Releases page.

##### 3\. Open the Quick Access Menu (the `...` button) and go to the Decky tab (plug icon) → \*\*Settings\*\*.

##### 4\. Under \*\*General\*\*, turn on \*\*Developer mode\*\*. A new \*\*Developer\*\* tab appears.

##### 5\. Open the \*\*Developer\*\* tab and choose \*\*Install Plugin from ZIP File\*\*. Browse to the zip you downloaded and select it.

##### &#x20;  - Alternatively, choose \*\*Install Plugin from URL\*\* and paste the direct link to the zip on the Releases page.

##### 6\. Decky installs the plugin and reloads. "Shortcut Buttons" now appears in the Quick Access Menu.

##### 

##### Menu names may differ slightly between Decky versions.

##### 

## \## Manual install

##### 

##### If you'd rather not use developer mode, extract the zip into `\~/homebrew/plugins/` in Desktop Mode (needs `sudo`), then run `sudo systemctl restart plugin\_loader`.



## \## Usage

##### 

##### Tap a shortcut to send it. Turn on \*\*Edit mode\*\* and tap a shortcut to change it, or use \*\*+ Add shortcut\*\* to create a new one.

##### 

## \## Building from source

##### 

##### Requires Node.js and pnpm.

##### 

##### ```

##### pnpm i

##### pnpm build

##### ```

##### 

## \## License

##### 

##### BSD-3-Clause. See the LICENSE file.

