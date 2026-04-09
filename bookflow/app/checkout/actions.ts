"use server";

import { adminSupabase } from "@/lib/supabase/admin";
import { getServerUser } from "@/lib/supabase/server";

type CartItem = {
  id: string;
  title: string;
  price: number;
  format: string;
  quantity: number;
};

type CheckoutPayload = {
  items: CartItem[];
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    region: string;
    country: string;
  };
  paymentMethod: string;
};

function generateOrderNumber() {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `BF-${ymd}-${rand}`;
}

// Ghana tax rates (GRA)
const TAX = { vat: 0.125, nhil: 0.025, getfund: 0.025 };
const TAX_RATE = TAX.vat + TAX.nhil + TAX.getfund; // 0.175

export async function createOrder(payload: CheckoutPayload): Promise<{ orderId: string; orderNumber: string }> {
  const user = await getServerUser();

  const subtotal = payload.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 200 ? 0 : 20;
  // Tax applied on subtotal (pre-shipping), rounded to 2dp
  const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + shippingCost + taxAmount;
  const orderNumber = generateOrderNumber();

  // If user is logged in, use their profile; otherwise use guest flow
  let userId: string | null = null;
  if (user) {
    userId = user.id;
  } else {
    // Guest: find or create a profile by email
    const { data: existing } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("email", payload.shipping.email)
      .single();

    if (existing) {
      userId = existing.id;
    }
    // If no profile exists (true guest), we still record the order without user_id
    // by temporarily creating a guest profile is beyond scope — skip for now
  }

  if (!userId) {
    throw new Error("Please sign in to complete your order.");
  }

  // Create the order
  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .insert({
      user_id: userId,
      order_number: orderNumber,
      status: "paid",
      payment_status: "completed",
      subtotal,
      shipping_cost: shippingCost,
      tax_amount: taxAmount,
      tax_rate: TAX_RATE,
      tax_breakdown: { vat: TAX.vat, nhil: TAX.nhil, getfund: TAX.getfund, total: TAX_RATE },
      total_amount: total,
      currency: "GHS",
      payment_method: payload.paymentMethod,
      payment_processed_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
      shipping_address: {
        first_name: payload.shipping.firstName,
        last_name: payload.shipping.lastName,
        email: payload.shipping.email,
        phone: payload.shipping.phone,
        address: payload.shipping.address,
        city: payload.shipping.city,
        region: payload.shipping.region,
        country: payload.shipping.country,
      },
    })
    .select("id")
    .single();

  if (orderError) throw new Error(orderError.message);

  // Create line items
  const lineItems = payload.items.map((item) => ({
    order_id: order.id,
    book_id: item.id,
    book_format: item.format,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }));

  const { error: lineError } = await adminSupabase
    .from("order_line_items")
    .insert(lineItems);

  if (lineError) throw new Error(lineError.message);

  // Update sales_count on each book (best-effort)
  for (const item of payload.items) {
    try {
      await adminSupabase.rpc("increment_sales_count", {
        book_id: item.id,
        amount: item.quantity,
      });
    } catch {
      // RPC may not exist yet — ignore
    }
  }

  return { orderId: order.id, orderNumber };
}

export async function getOrderById(orderId: string) {
  const user = await getServerUser();
  if (!user) return null;

  const { data } = await adminSupabase
    .from("orders")
    .select(`
      *,
      order_line_items (
        id, book_format, quantity, unit_price, total_price,
        books ( id, title, slug, cover_image_url, authors(name) )
      )
    `)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  return data;
}
