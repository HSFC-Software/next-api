// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

type Data = {
  name?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: [
      "http://localhost:3001",
      "http://localhost:3002",
      "https://admin.fishgen.org",
    ],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  if (req.method === "DELETE") {
    const { error } = await supabase
      .from("network_disciples") //
      .delete()
      .eq("id", req.query.id);

    if (error) {
      // ENHANCEMENTS: stuctured logging
      console.log(error);
      return res.status(400).json({});
    }

    res.status(200).json({});
    return;
  }

  return res.status(404).json({});
}
