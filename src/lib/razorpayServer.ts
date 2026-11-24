import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID && !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
  console.warn("RAZORPAY_KEY_ID is not configured in environment variables.");
}

export function getRazorpayServerInstance() {
  const key_id =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    "rzp_test_U2pWJ8lM7zk2AU";
  const key_secret =
    process.env.RAZORPAY_KEY_SECRET || "kbOODk2gSwFbzsJrkhsNgkTK";

  return new Razorpay({
    key_id,
    key_secret,
  });
}
