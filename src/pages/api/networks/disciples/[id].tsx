// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: ["http://localhost:3001", "http://localhost:3002"],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  if (req.method === "GET") {
    const { error, data } = await supabase
      .from("network_disciples")
      .select(
        `
        id,
        disciple_id(
          id,
          first_name,
          last_name
        ),
        created_at
      `
      )
      .eq("network_id", req.query.id);

    if (error) {
      // ENHANCEMENTS: stuctured logging
      console.log(error);
      return res.status(404).json({});
    }

    return res.status(200).json(data);
  }

  return res.status(404).json({});
}
