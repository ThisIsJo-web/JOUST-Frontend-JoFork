import { Tournament } from "../../../types";

const inputCls = "w-full h-12 bg-background border border-foreground/10 px-4 text-xs text-foreground focus:outline-none focus:border-primary transition-all rounded-xl";

interface Props {
  tournament: Tournament;
  formatDefinitions: any[];
  isEditing: boolean;
  formatConfig: any;
  onToggleEdit: () => void;
  onDiscard: () => void;
  onRuleChange: (key: string, value: any) => void;
  onSave: () => void;
}

export default function FormatRulesPanel({ tournament, formatDefinitions, isEditing, formatConfig, onToggleEdit, onDiscard, onRuleChange, onSave }: Props) {
  const fields = formatDefinitions.find(f => f.id === tournament.format)?.configFields ?? [];

  return (
    <div className="bg-foreground/5 border border-foreground/5 p-8 rounded-[2.5rem]">
      <div className="flex justify-between items-center mb-8 border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground font-poppins">Format Rules</h3>
          {!isEditing && (
            <button onClick={onToggleEdit} className="text-primary hover:opacity-70 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
        {isEditing && (
          <button onClick={onDiscard} className="text-[10px] font-black uppercase text-foreground/40 hover:text-foreground tracking-widest font-poppins">Discard</button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {fields.map((field: any) => (
              <div key={field.key} className="space-y-2">
                <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins ml-1">{field.label}</label>
                <input
                  type="number"
                  value={formatConfig[field.key] ?? ""}
                  onChange={e => onRuleChange(field.key, e.target.value)}
                  placeholder={field.defaultValue !== null ? String(field.defaultValue) : field.placeholder}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
          <button onClick={onSave} className="w-full py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:brightness-110 transition-all font-poppins">
            Persist Rules
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          {fields.map((field: any) => (
            <div key={field.key} className="space-y-1">
              <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest font-poppins">{field.label}</p>
              <p className="text-xs font-black text-foreground uppercase tracking-tight">
                {formatConfig[field.key] ?? field.defaultValue ?? "AUTO"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
