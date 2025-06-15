// frontend-agency/src/pages/Complaints.tsx
import { Card } from "@/components/ui/card";

export default function Complaints() {
  return (
    <div className="max-w-[1200px] mx-auto bg-white">
      <header className="w-full h-[78px] border-b border-gray-300 flex items-center px-8">
        <h1 className="font-semibold text-4xl text-black">Complaints</h1>
      </header>

      <div className="p-8">
        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-4">Complaints Dashboard</h2>
          <p>This is where complaints data will appear.</p>
        </Card>
      </div>
    </div>
  );
}
