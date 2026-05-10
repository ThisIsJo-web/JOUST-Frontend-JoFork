import { Tournament, FormatConfig } from "../../../tournaments/types";

const inputCls = "w-full h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl";

interface Props {
  tournament: Tournament;
  formatDefinitions: any[];
  isEditing: boolean;
  formatConfig: FormatConfig;
  onToggleEdit: () => void;
  onDiscard: () => void;
  onRuleChange: (key: string, value: any) => void;
  onSave: () => void;
}

function isBooleanField(field: any) {
  return field.key === "allowDraw" || typeof field.defaultValue === "boolean";
}

function isArrayField(field: any) {
  return field.key === "tieBreakerOrder";
}

function isStringField(field: any) {
  return isArrayField(field) || field.key === "progressionType";
}

function getDisplayValue(field: any, formatConfig: FormatConfig) {
  const rawValue = (formatConfig as any)[field.key];
  if (isBooleanField(field)) {
    return rawValue === true ? "Yes" : rawValue === false ? "No" : field.defaultValue === true ? "Yes" : "No";
  }
  if (isArrayField(field)) {
    return Array.isArray(rawValue) ? rawValue.join(", ") : field.defaultValue ?? "AUTO";
  }
  return rawValue ?? field.defaultValue ?? "AUTO";
}

export default function FormatRulesPanel({ tournament, formatDefinitions, isEditing, formatConfig, onToggleEdit, onDiscard, onRuleChange, onSave }: Props) {
  const fields = formatDefinitions.find((f) => f.id === tournament.format)?.configFields ?? [];
  const hasCardGame = !!tournament.cardGameId;

  const handleChange = (field: any, rawValue: string | boolean) => {
    if (isBooleanField(field)) {
      onRuleChange(field.key, Boolean(rawValue));
      return;
    }

    if (isArrayField(field)) {
      const text = String(rawValue).trim();
      if (text === "") {
        onRuleChange(field.key, null);
      } else {
        const items = text
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        onRuleChange(field.key, items.length > 0 ? items : null);
      }
      return;
    }

    if (isStringField(field)) {
      const text = String(rawValue).trim();
      onRuleChange(field.key, text === "" ? null : text);
      return;
    }

    const value = String(rawValue).trim();
    onRuleChange(field.key, value === "" ? null : Number(value));
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] p-8 md:p-10 rounded-[2.5rem] shadow-2xl transition-all duration-500">
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/[0.05]">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/60 font-poppins">Format Rules</h3>
          {!isEditing && (
            <button onClick={onToggleEdit} className="text-primary hover:brightness-125 transition-all p-2 bg-primary/10 rounded-lg">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
        {isEditing && (
          <button onClick={onDiscard} className="text-[10px] font-black uppercase text-foreground/30 hover:text-foreground tracking-widest font-poppins transition-all">Discard</button>
        )}
      </div>

      {isEditing ? (
        <div className={`space-y-8 transition-all duration-700 ${!hasCardGame ? "opacity-10 grayscale blur-sm pointer-events-none translate-y-4" : "opacity-100 translate-y-0"}`}>
          <div className="grid grid-cols-1 gap-6">
            {fields.map((field: any) => {
              const rawValue = (formatConfig as any)[field.key];
              const value = isArrayField(field)
                ? Array.isArray(rawValue)
                  ? rawValue.join(", ")
                  : ""
                : rawValue ?? "";

              return (
                <div key={field.key} className="space-y-2">
                  <label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] font-poppins ml-1">{field.label}</label>
                  {isBooleanField(field) ? (
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 border-white/10 flex items-center justify-center transition-all group-hover:border-primary ${Boolean(rawValue) ? "bg-primary border-primary shadow-lg shadow-primary/20" : ""}`}>
                        {Boolean(rawValue) && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg>}
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(rawValue)}
                        onChange={(e) => handleChange(field, e.target.checked)}
                        className="hidden"
                      />
                      <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest transition-colors group-hover:text-foreground">{Boolean(rawValue) ? "Enabled" : "Disabled"}</span>
                    </label>
                  ) : (
                    <input
                      type={isStringField(field) ? "text" : "number"}
                      value={value}
                      onChange={(e) => handleChange(field, e.target.value)}
                      placeholder={field.defaultValue !== null ? String(field.defaultValue) : field.placeholder}
                      className={`${inputCls} bg-transparent border-white/10 focus:border-primary/50`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={onSave} className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20">
            Persist Combat Rules
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-10 gap-x-6">
          {fields.map((field: any) => (
            <div key={field.key} className="space-y-1.5">
              <p className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em] font-poppins">{field.label}</p>
              <p className="text-[11px] font-black text-foreground uppercase tracking-tight">
                {getDisplayValue(field, formatConfig)}
              </p>
            </div>
          ))}
          {fields.length === 0 && (
            <p className="col-span-full text-[10px] text-foreground/20 font-black uppercase tracking-widest text-center py-4 italic">No specific config for this format</p>
          )}
        </div>
      )}
    </div>
  );
}
