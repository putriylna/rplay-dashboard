import { anton } from "@/lib/fonts";

interface DateSelectorProps {
  activeDate: string;
  setActiveDate: (date: string) => void;
}

export const DateSelector = ({ activeDate, setActiveDate }: DateSelectorProps) => {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
      {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        const dateStr = d.toISOString().split("T")[0];
        const isSelected = activeDate === dateStr;
        return (
          <button
            key={dateStr}
            onClick={() => setActiveDate(dateStr)}
            className={`flex flex-col items-center min-w-[90px] p-4 rounded-2xl transition-all border ${
              isSelected ? "bg-[#cc111f] border-[#cc111f] shadow-lg scale-105" : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600"
            }`}
          >
            <span className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${isSelected ? "text-white" : "text-zinc-500"}`}>
              {offset === 0 ? "Hari Ini" : d.toLocaleDateString("id-ID", { weekday: "short" })}
            </span>
            <span className="text-2xl font-black italic">{d.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
};