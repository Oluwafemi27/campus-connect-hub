import { createAPIFileRoute } from "@tanstack/react-start/api";
import {
  getDataBundlesServer,
  getAirtimesServer,
  getTVSubscriptionsServer,
  purchaseDataBundleServer,
  purchaseAirtimeServer,
  purchaseTVSubscriptionServer,
} from "@/server/gsubz";

export const APIRoute = createAPIFileRoute("/api/gsubz")(
  {
    GET: async ({ request }) => {
      try {
        const url = new URL(request.url);
        const type = url.searchParams.get("type");

        if (type === "data-bundles") {
          const bundles = await getDataBundlesServer();
          return Response.json({ success: true, data: bundles });
        }

        if (type === "airtimes") {
          const airtimes = await getAirtimesServer();
          return Response.json({ success: true, data: airtimes });
        }

        if (type === "tv-subscriptions") {
          const subscriptions = await getTVSubscriptionsServer();
          return Response.json({ success: true, data: subscriptions });
        }

        return Response.json(
          { success: false, error: "Invalid type parameter" },
          { status: 400 }
        );
      } catch (error) {
        console.error("GSubz API GET error:", error);
        return Response.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    },

    POST: async ({ request }) => {
      try {
        const body = await request.json();
        const { action, bundleId, airtimeId, subscriptionId, phoneNumber, smartCardNumber } =
          body;

        if (action === "purchase-data") {
          const result = await purchaseDataBundleServer(bundleId, phoneNumber);
          return Response.json(result);
        }

        if (action === "purchase-airtime") {
          const result = await purchaseAirtimeServer(airtimeId, phoneNumber);
          return Response.json(result);
        }

        if (action === "purchase-tv") {
          const result = await purchaseTVSubscriptionServer(subscriptionId, smartCardNumber);
          return Response.json(result);
        }

        return Response.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
      } catch (error) {
        console.error("GSubz API POST error:", error);
        return Response.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    },
  }
);
