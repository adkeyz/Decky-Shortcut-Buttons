import {
  ButtonItem,
  DropdownItem,
  Navigation,
  PanelSection,
  PanelSectionRow,
  TextField,
  ToggleField,
} from "@decky/ui";
import { callable, definePlugin, toaster } from "@decky/api";
import { useEffect, useState } from "react";
import { FaKeyboard } from "react-icons/fa";

type Shortcut = { id: string; name: string; mods: string[]; key: string };

// Keep in sync with KEYMAP in main.py
const KEYS = [
  "esc", "enter", "tab", "space", "backspace", "delete", "insert", "home",
  "end", "pageup", "pagedown", "printscreen", "up", "down", "left", "right",
  "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12",
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
  ..."abcdefghijklmnopqrstuvwxyz".split(""),
];
const MODS = [
  { id: "ctrl", label: "Ctrl" },
  { id: "alt", label: "Alt" },
  { id: "shift", label: "Shift" },
  { id: "meta", label: "Super / Windows" },
];

const getShortcuts = callable<[], Shortcut[]>("get_shortcuts");
const saveShortcuts = callable<[Shortcut[]], boolean>("save_shortcuts");
const sendShortcut = callable<[string[], string], boolean>("send_shortcut");

// Lives outside the component so it survives the menu closing/reopening
// (e.g. when a dropdown opens).
let draftEditing: Shortcut | null = null;

function describe(s: Shortcut) {
  const m = MODS.filter((x) => s.mods.includes(x.id)).map((x) => x.label.split(" ")[0]);
  return [...m, s.key.toUpperCase()].join("+");
}

function Content() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditingState] = useState<Shortcut | null>(draftEditing);
  const setEditing = (s: Shortcut | null) => {
    draftEditing = s;
    setEditingState(s);
  };

  useEffect(() => {
    getShortcuts().then(setShortcuts);
  }, []);

  const persist = (list: Shortcut[]) => {
    setShortcuts(list);
    saveShortcuts(list);
  };

  const press = async (s: Shortcut) => {
    // Close the menu first so the keys go to the game, not to Steam's own UI
    Navigation.CloseSideMenus();
    await new Promise((r) => setTimeout(r, 700));
    const ok = await sendShortcut(s.mods, s.key);
    if (!ok) toaster.toast({ title: "Shortcut Buttons", body: "Couldn't send the keys" });
  };

  // ----- editor view -----
  if (editing) {
    const toggleMod = (id: string, on: boolean) =>
      setEditing({
        ...editing,
        mods: on ? [...editing.mods, id] : editing.mods.filter((m) => m !== id),
      });
    return (
      <PanelSection title="Edit shortcut">
        <PanelSectionRow>
          <TextField
            label="Name"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          />
        </PanelSectionRow>
        {MODS.map((m) => (
          <PanelSectionRow key={m.id}>
            <ToggleField
              label={m.label}
              checked={editing.mods.includes(m.id)}
              onChange={(v) => toggleMod(m.id, v)}
            />
          </PanelSectionRow>
        ))}
        <PanelSectionRow>
          <DropdownItem
            label="Key"
            rgOptions={KEYS.map((k) => ({ data: k, label: k.toUpperCase() }))}
            selectedOption={editing.key}
            onChange={(o) => setEditing({ ...editing, key: o.data })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => {
              const exists = shortcuts.some((s) => s.id === editing.id);
              persist(
                exists
                  ? shortcuts.map((s) => (s.id === editing.id ? editing : s))
                  : [...shortcuts, editing]
              );
              setEditing(null);
            }}
          >
            Save
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => {
              persist(shortcuts.filter((s) => s.id !== editing.id));
              setEditing(null);
            }}
          >
            Delete
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => setEditing(null)}>
            Cancel
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  // ----- button list view -----
  return (
    <PanelSection title="Shortcuts">
      {shortcuts.map((s) => (
        <PanelSectionRow key={s.id}>
          <ButtonItem
            layout="below"
            description={describe(s)}
            onClick={() => (editMode ? setEditing(s) : press(s))}
          >
            {editMode ? `✎ ${s.name}` : s.name}
          </ButtonItem>
        </PanelSectionRow>
      ))}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() =>
            setEditing({ id: String(Date.now()), name: "New shortcut", mods: [], key: "a" })
          }
        >
          + Add shortcut
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField label="Edit mode (tap to edit)" checked={editMode} onChange={setEditMode} />
      </PanelSectionRow>
    </PanelSection>
  );
}

export default definePlugin(() => ({
  name: "Shortcut Buttons",
  titleView: <div>Shortcut Buttons</div>,
  content: <Content />,
  icon: <FaKeyboard />,
  onDismount() {},
}));
