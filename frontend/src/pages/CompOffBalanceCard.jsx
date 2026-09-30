import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { getMyCompOffBalance } from "../../api/compOffApi";

export default function CompOffBalanceCard({ token }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBalance = async () => {
    try {
      setLoading(true);

      const data = await getMyCompOffBalance(token);

      setBalance(data);
    } catch (error) {
      console.error("Failed to load Comp-Off balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadBalance();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border p-5">
        Loading Comp-Off balance...
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-[#E3E7F5] shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-blue-50">
          <Clock3 className="h-5 w-5 text-blue-600" />
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Comp-Off Balance
          </p>

          <p className="text-2xl font-bold text-[#1E2761]">
            {balance?.balance ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}