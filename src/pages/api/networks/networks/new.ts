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
    origin: [
      "http://localhost:3001",
      "http://localhost:3002",
      "https://admin.fishgen.org",
    ],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  if (req.method === "POST") {
    const fields = ["name", "discipler_id", "network_id"];

    const payload: { [key: string]: string } = {};

    fields.forEach((key) => {
      if (!!req.body[key]) {
        payload[key] = req.body[key];
      }
    });

    const { error, data } = await supabase
      .from("networks") //
      .insert({
        name: payload.name,
        discipler_id: payload.discipler_id,
      })
      .select(`*, discipler_id(*)`)
      .single();

    if (error) {
      console.log({ error });

      // ENHANCEMENTS: stuctured logging
      return res.status(400).json({});
    }

    const { error: networkError, data: network } = await supabase
      .from("network_networks") //
      .insert({
        main_network_id: payload.network_id,
        networks_id: data.id,
      })
      .select(selectQuery)
      .single();

    if (networkError) {
      console.log({ networkError });
      // ENHANCEMENTS: stuctured logging
      return res.status(400).json({});
    }

    res.status(200).json(network);
  }
}
