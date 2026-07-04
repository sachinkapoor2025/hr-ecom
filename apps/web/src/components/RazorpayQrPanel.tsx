"use client";

type Props = {
  qrImageUrl: string;
  amountLabel: string;
  onOpenCheckout: () => void;
  openingCheckout: boolean;
};

export function RazorpayQrPanel({ qrImageUrl, amountLabel, onOpenCheckout, openingCheckout }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">Scan to pay with UPI</p>
        <p className="text-xs text-slate-500 mt-1">
          Open any UPI app (GPay, PhonePe, Paytm) and scan this QR code to pay {amountLabel}.
        </p>
      </div>
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImageUrl}
          alt="UPI payment QR code"
          className="h-52 w-52 rounded-lg border border-slate-200 bg-white object-contain"
        />
      </div>
      <p className="text-xs text-center text-slate-500">
        Payment confirms automatically after a successful scan. You can also use cards or netbanking below.
      </p>
      <button
        type="button"
        onClick={onOpenCheckout}
        disabled={openingCheckout}
        className="w-full rounded-md border-2 border-nav text-nav font-semibold text-sm py-2.5 hover:bg-blue-50 disabled:opacity-50 transition"
      >
        {openingCheckout ? "Opening…" : "Pay with card / netbanking instead"}
      </button>
    </div>
  );
}
