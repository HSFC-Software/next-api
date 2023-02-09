// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import moment from "moment";

type Data = {
  name?: string;
};

const selectQuery = `*`;

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

  if (req.method === "PATCH") {
    return patch(req, res);
  }

  return res.status(404).json({});
}

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const fields = ["name"];

  const payload: { [key: string]: string } = {};

  fields.forEach((key) => {
    if (!!req.body[key]) {
      payload[key] = req.body[key];
    }
  });

  const { error, data } = await supabase
    .from("networks") //
    .update(payload as unknown)
    .eq("id", req.query.id)
    .select(selectQuery)
    .single();

  if (error) {
    // ENHANCEMENTS: stuctured logging
    return res.status(400).json({});
  }

  res.status(200).json(data);
}
