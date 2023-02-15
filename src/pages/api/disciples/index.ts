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

  if (req.method === "POST") {
    return save(req, res);
  }

  if (req.method === "GET") {
    return get(req, res);
  }

  return res.status(404).json({});
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  // todo: handle q query from auto complete

  const { error, data } = await supabase.from("disciples").select("*");

  if (error) {
    // ENHANCEMENTS: stuctured logging
    return res.status(400).json({});
  }

  res.status(200).json(data);
}

async function save(req: NextApiRequest, res: NextApiResponse) {
  const fields = ["first_name", "last_name", "middle_name", "is_vip"];

  const payload: { [key: string]: string } = {};

  fields.forEach((key) => {
    if (!!req.body[key]) {
      if (key === "is_vip") return;
      payload[key] = req.body[key];
    }
  });

  const { error, data } = await supabase
    .from("disciples") //
    .insert(payload as unknown)
    .select()
    .single();

  if (error) {
    // ENHANCEMENTS: stuctured logging
    return res.status(400).json({});
  }

  if (req.body.is_vip) {
    await supabase.from("vips").insert({
      disciple_id: data.id,
    });
  }

  res.status(200).json(data);
}
