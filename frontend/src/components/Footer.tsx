import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gray-400" />
          <span className="text-gray-500 font-semibold">ReadEnjoyer</span>
        </div>
        <p className="text-gray-400 text-sm">
          Oleh Dushynskyi 75659 • Danil Doshyn 75667
        </p>
      </div>
    </footer>
  );
}
