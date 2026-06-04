"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackShipmentByCode } from "@/server/actions/shipping.actions";
import { cn } from "@/lib/utils";
import { Package, Truck, CheckCircle2, AlertCircle } from "lucide-react";

type TrackingState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | {
      type: "success";
      orderNumber: string;
      trackingNumber: string | null;
      statusLabel: string;
      status: string;
      events: Array<{
        date: string;
        status: string;
        description: string;
        location?: string;
      }>;
      estimatedDays?: number | null;
      message?: string;
    };

function StatusIcon({ status }: { status: string }) {
  if (status === "DELIVERED") {
    return <CheckCircle2 className="h-8 w-8 text-brand-green" strokeWidth={1} />;
  }
  if (status === "FAILED" || status === "RETURNED") {
    return <AlertCircle className="h-8 w-8 text-red-500" strokeWidth={1} />;
  }
  if (status === "IN_TRANSIT" || status === "LABEL_CREATED") {
    return <Truck className="h-8 w-8 text-brand-orange" strokeWidth={1} />;
  }
  return <Package className="h-8 w-8 text-neutral-400" strokeWidth={1} />;
}

type TrackingFormProps = {
  initialCode?: string;
  initialToken?: string;
};

export function TrackingForm({
  initialCode = "",
  initialToken = "",
}: TrackingFormProps) {
  const [code, setCode] = useState(initialCode);
  const [email, setEmail] = useState("");
  const [accessToken, setAccessToken] = useState(initialToken);
  const [state, setState] = useState<TrackingState>({ type: "idle" });

  const looksLikeOrderNumber = /^RU-/i.test(code.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ type: "loading" });

    const result = await trackShipmentByCode(code.trim(), {
      email: looksLikeOrderNumber ? email : undefined,
      accessToken: accessToken || undefined,
    });

    if (!result.success) {
      setState({ type: "error", message: result.message });
      return;
    }

    setState({
      type: "success",
      orderNumber: result.orderNumber,
      trackingNumber: result.trackingNumber,
      statusLabel: result.statusLabel,
      status: result.status,
      events: result.events,
      estimatedDays: result.estimatedDays,
      message: "message" in result ? result.message : undefined,
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          variant="minimal"
          placeholder="Nº pedido (RU-...) o tracking Bluexpress"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border border-neutral-200 bg-white px-4 py-3 text-sm normal-case tracking-normal"
          required
        />
        {looksLikeOrderNumber && (
          <Input
            variant="minimal"
            type="email"
            placeholder="Email de la compra"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-neutral-200 bg-white px-4 py-3 text-sm normal-case tracking-normal"
            required
          />
        )}
        {accessToken ? (
          <input type="hidden" name="token" value={accessToken} readOnly />
        ) : null}
        <Button type="submit" isLoading={state.type === "loading"}>
          Rastrear
        </Button>
      </form>

      {state.type === "error" && (
        <p className="mt-4 text-sm text-red-600">{state.message}</p>
      )}

      {state.type === "success" && (
        <div className="mt-10 border border-neutral-200 bg-neutral-50 p-6">
          <div className="flex items-start gap-4">
            <StatusIcon status={state.status} />
            <div>
              <p className="text-label-sm text-neutral-500">Pedido</p>
              <p className="font-medium">{state.orderNumber}</p>
              {state.trackingNumber && (
                <>
                  <p className="text-label-sm mt-3 text-neutral-500">Tracking</p>
                  <p className="font-mono text-sm">{state.trackingNumber}</p>
                </>
              )}
              <p className="mt-3 text-lg font-semibold">{state.statusLabel}</p>
              {state.estimatedDays && !state.trackingNumber && (
                <p className="text-body-muted mt-1 text-sm">
                  Entrega estimada: {state.estimatedDays} días hábiles
                </p>
              )}
              {state.message && (
                <p className="text-body-muted mt-2 text-sm">{state.message}</p>
              )}
            </div>
          </div>

          {state.events.length > 0 && (
            <ol className="mt-8 space-y-4 border-t border-neutral-200 pt-6">
              {state.events.map((event, i) => (
                <li key={`${event.date}-${i}`} className="flex gap-3 text-sm">
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      i === 0 ? "bg-brand-orange" : "bg-neutral-300",
                    )}
                    aria-hidden
                  />
                  <div>
                    <p className="text-neutral-500">
                      {new Date(event.date).toLocaleString("es-CL", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p className="mt-0.5">{event.description}</p>
                    {event.location && (
                      <p className="text-label-sm mt-0.5 text-neutral-400">
                        {event.location}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
