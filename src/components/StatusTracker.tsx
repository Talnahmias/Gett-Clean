import { STATUS_LABELS, STATUS_STEPS, mapStatusToStep } from "@/lib/constants";
import { BookingStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export function StatusTracker({
  status,
  etaMinutes,
}: {
  status: BookingStatus;
  etaMinutes?: number | null;
}) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
        Booking cancelled
      </div>
    );
  }

  const stepStatus = mapStatusToStep(status);
  const currentIdx = STATUS_STEPS.indexOf(stepStatus);

  return (
    <div className="space-y-3">
      <p className="text-center text-lg font-bold text-gett-black">
        {STATUS_LABELS[status]}
      </p>
      {etaMinutes != null && ["OFFERED", "ASSIGNED", "EN_ROUTE"].includes(status) && (
        <p className="text-center text-sm text-gett-green font-medium">
          ETA {etaMinutes} min
        </p>
      )}
      <div className="flex items-center justify-between gap-1 px-2">
        {STATUS_STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx || (status === "OFFERED" && i === 0);
          return (
            <div key={step} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  "h-3 w-3 rounded-full transition-all",
                  done ? "bg-gett-green" : "bg-gray-200",
                  active && "pulse-dot ring-4 ring-gett-green/30",
                )}
              />
            </div>
          );
        })}
      </div>
      <div className="relative mx-2 h-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gett-green transition-all duration-500"
          style={{ width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
