// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    return save(req, res);
  }

  return res.status(404).json({});
}

async function save(req: NextApiRequest, res: NextApiResponse) {
  const fields = ["first_name", "last_name", "middle_name"];

  const payload: { [key: string]: string } = {};

  fields.forEach((key) => {
    if (!!req.body[key]) {
      payload[key] = req.body[key];
    }
  });

  const { error } = await supabase
    .from("disciples") //
    .insert(payload as unknown);

  if (error) {
    // ENHANCEMENTS: stuctured logging
    return res.status(400).json({});
  }

  res.status(200).json({});
}
