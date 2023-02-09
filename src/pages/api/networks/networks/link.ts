// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

type Data = {
  name?: string;
};

const selectQuery = `
  *,
  main_network_id(
    *,
    discipler_id(
      *
    )
  ),
  networks_id(
    *,
    discipler_id(
      *
    )
  )
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: ["http://localhost:3001", "http://localhost:3002"],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  if (req.method === "POST") {
    const fields = ["main_network_id", "networks_id"];

    const payload: { [key: string]: string } = {};

    fields.forEach((key) => {
      if (!!req.body[key]) {
        payload[key] = req.body[key];
      }
    });

    const { error, data } = await supabase
      .from("network_networks") //
      .insert(payload as unknown)
      .select(selectQuery)
      .single();

    if (error) {
      // ENHANCEMENTS: stuctured logging
      console.log(error);
      return res.status(400).json({});
    }

    res.status(200).json(data);
    return;
  }

  return res.status(404).json({});
}
