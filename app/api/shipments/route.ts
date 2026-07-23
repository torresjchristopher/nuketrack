import shipmentData from "../../../data/db.json";

export async function GET() {
  return Response.json(shipmentData, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
